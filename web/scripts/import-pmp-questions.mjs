import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import xlsx from "xlsx";
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;

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

  // Require Prisma schema to include Question/Tag/QuestionTag.
  // We check by attempting a simple query.
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  // Basic connectivity check
  await prisma.$queryRaw`SELECT 1`;

  if (!prisma.question || !prisma.tag || !prisma.questionTag) {
    throw new Error(
      "Prisma Client does not include question/tag/questionTag models. Update prisma/schema.prisma in this repo to match the PMIHub question-bank schema and regenerate."
    );
  }

  const tagCache = new Map();
  let createdQuestions = 0;
  let skippedQuestions = 0;
  let createdTags = 0;
  let createdJoins = 0;

  for (const q of input) {
    const key = stableQuestionKey(q);

    if (dryRun) {
      console.log(`[dry-run] would upsert question: ${key.slice(0, 10)}… (${q.prompt.slice(0, 60)}…)`);
      continue;
    }

    // Upsert question by prompt hash stored in reference field (until schema supports explicit unique hash)
    // If you prefer, we can add a dedicated unique field later.
    const existing = await prisma.question.findFirst({ where: { reference: key } });
    if (existing) {
      skippedQuestions++;
      continue;
    }

    const created = await prisma.question.create({
      data: {
        certification: q.certification,
        type: q.type,
        prompt: q.prompt,
        choiceA: q.choiceA,
        choiceB: q.choiceB,
        choiceC: q.choiceC,
        choiceD: q.choiceD,
        correct: q.correct,
        explanation: q.explanation,
        reference: key,
      },
      select: { id: true },
    });
    createdQuestions++;

    for (const name of q.tags) {
      const norm = name.trim();
      let tagId = tagCache.get(norm);
      if (!tagId) {
        const t = await prisma.tag.upsert({
          where: { name: norm },
          update: {},
          create: { name: norm },
          select: { id: true },
        });
        tagId = t.id;
        tagCache.set(norm, tagId);
        createdTags++; // counts upserts too; acceptable for summary
      }

      await prisma.questionTag.upsert({
        where: { questionId_tagId: { questionId: created.id, tagId } },
        update: {},
        create: { questionId: created.id, tagId },
      });
      createdJoins++;
    }
  }

  await prisma.$disconnect();

  console.log("\nDone.");
  console.log(
    JSON.stringify(
      {
        dryRun,
        parsed: parsed.length,
        imported: createdQuestions,
        skipped: skippedQuestions,
        tagsTouched: createdTags,
        joinsCreated: createdJoins,
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
