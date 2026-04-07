import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import xlsx from "xlsx";
import { PrismaClient } from "../src/generated/prisma/index.js";

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

const filePath = argValue("--file");
const dryRun = process.argv.includes("--dry-run");
const limitRaw = argValue("--limit");
const limit = limitRaw ? Number(limitRaw) : null;

if (!filePath) {
  console.error("Usage: node scripts/import-pmp-questions.mjs --file <path-to-xlsx> [--dry-run] [--limit N]\n");
  process.exit(1);
}

const resolved = path.resolve(filePath);
if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(1);
}

function normalizeChoiceLetter(v) {
  if (!v) return null;
  const s = String(v).trim().toUpperCase();
  if (["A", "B", "C", "D"].includes(s)) return s;
  return null;
}

function stableQuestionKey(q) {
  // Stable hash to dedupe across runs
  const payload = [
    q.certification,
    q.type,
    q.prompt,
    q.choiceA,
    q.choiceB,
    q.choiceC,
    q.choiceD,
    q.correct,
  ].join("\n---\n");
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function parseQuestionBankXlsx(xlsxPath) {
  const wb = xlsx.readFile(xlsxPath);
  const ws = wb.Sheets["Question_Bank"];
  if (!ws) throw new Error('Sheet "Question_Bank" not found');

  const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null });
  const headerRowIndex = aoa.findIndex((r) => Array.isArray(r) && r.some((v) => v === "Q#"));
  if (headerRowIndex === -1) throw new Error("Could not find header row (Q#)");

  const header = aoa[headerRowIndex].map((h) => (h == null ? "" : String(h).trim()));
  const rows = aoa.slice(headerRowIndex + 1).filter((r) => Array.isArray(r) && r.some((v) => v != null && String(v).trim() !== ""));

  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  function cell(row, name) {
    const i = idx[name];
    if (i == null) return null;
    return row[i] ?? null;
  }

  const questions = [];
  for (const row of rows) {
    const prompt = cell(row, "Question");
    const a = cell(row, "Option A");
    const b = cell(row, "Option B");
    const c = cell(row, "Option C");
    const d = cell(row, "Option D");
    const correct = normalizeChoiceLetter(cell(row, "Correct Answer"));

    if (!prompt || !a || !b || !c || !d || !correct) continue;

    const topic = cell(row, "Topic");
    const domain = cell(row, "Domain");
    const difficulty = cell(row, "Difficulty");
    const approach = cell(row, "Approach");
    const pmbok = cell(row, "PMBOK Section");

    const explanation = cell(row, "Correct Explanation");

    const tags = [topic, domain, difficulty, approach, pmbok]
      .map((t) => (t == null ? null : String(t).trim()))
      .filter((t) => t && t.length > 0);

    const q = {
      certification: "PMP",
      type: "MCQ",
      prompt: String(prompt).trim(),
      choiceA: String(a).trim(),
      choiceB: String(b).trim(),
      choiceC: String(c).trim(),
      choiceD: String(d).trim(),
      correct,
      explanation: explanation == null ? null : String(explanation).trim(),
      reference: null,
      tags,
    };

    questions.push(q);
  }

  return questions;
}

async function main() {
  const parsed = parseQuestionBankXlsx(resolved);
  const input = limit ? parsed.slice(0, limit) : parsed;

  console.log(`Parsed questions: ${parsed.length}${limit ? ` (importing first ${input.length})` : ""}`);

  // PMIHub schema uses QuestionDomain + PracticeQuestion.
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  // Basic connectivity check
  await prisma.$queryRaw`SELECT 1`;

  // Cache domains by (certification,name)
  const domainCache = new Map();

  let upsertedQuestions = 0;
  let createdQuestions = 0;
  let skippedQuestions = 0;
  let createdDomains = 0;

  for (const q of input) {
    const key = stableQuestionKey(q);

    if (dryRun) {
      console.log(`[dry-run] would upsert question: ${key.slice(0, 10)}… (${q.prompt.slice(0, 60)}…)`);
      continue;
    }

    // Domain: we treat the first "Domain" tag (if present) as QuestionDomain.name
    // Fallback to "General".
    const domainName = (q.tags.find((t) => t.toLowerCase().includes("domain")) || q.tags[0] || "General")
      .replace(/^Domain\s*[:\-]?\s*/i, "")
      .trim()
      .slice(0, 128);

    const domainKey = `${q.certification}::${domainName}`;
    let domainId = domainCache.get(domainKey);
    if (!domainId) {
      const d = await prisma.questionDomain.upsert({
        where: { certification_name: { certification: q.certification, name: domainName } },
        update: {},
        create: { certification: q.certification, name: domainName },
        select: { id: true },
      });
      domainId = d.id;
      domainCache.set(domainKey, domainId);
      createdDomains++;
    }

    // Idempotency: use referenceText to store the stable hash
    const existing = await prisma.practiceQuestion.findFirst({
      where: { certification: q.certification, referenceText: key },
      select: { id: true },
    });

    if (existing) {
      skippedQuestions++;
      continue;
    }

    await prisma.practiceQuestion.create({
      data: {
        certification: q.certification,
        format: "SINGLE_CHOICE",
        stem: q.prompt,
        choiceA: q.choiceA,
        choiceB: q.choiceB,
        choiceC: q.choiceC,
        choiceD: q.choiceD,
        correctAnswer: q.correct,
        explanation: q.explanation,
        referenceText: key,
        tags: q.tags,
        domainId,
      },
      select: { id: true },
    });

    createdQuestions++;
    upsertedQuestions++;
  }

  await prisma.$disconnect();

  console.log("\nDone.");
  console.log(
    JSON.stringify(
      {
        dryRun,
        parsed: parsed.length,
        createdDomains,
        imported: createdQuestions,
        skipped: skippedQuestions,
        totalWritten: upsertedQuestions,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
