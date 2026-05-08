import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import xlsx from "xlsx";
import pg from "pg";

const { Pool } = pg;

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

const workbookLabel = path.basename(resolved);

function normalizeChoiceLetter(v) {
  if (!v) return null;
  const s = String(v).trim().toUpperCase();
  if (["A", "B", "C", "D"].includes(s)) return s;
  return null;
}

// NOTE: currently unused (kept for future dedupe/import-id generation)
function stableQuestionKey(q) {
  const payload = [
    q.certification,
    q.prompt,
    q.choiceA,
    q.choiceB,
    q.choiceC ?? "",
    q.choiceD ?? "",
    q.correct,
    q.explanation ?? "",
  ].join("\n---\n");
  return crypto.createHash("sha256").update(payload).digest("hex");
}
void stableQuestionKey;

function toDifficultyScore(label) {
  if (!label) return null;
  const normalized = String(label).trim().toLowerCase();
  if (["easy", "low"].includes(normalized)) return 2;
  if (["moderate", "medium"].includes(normalized)) return 3;
  if (["hard", "difficult", "challenging"].includes(normalized)) return 4;
  return null;
}

function parseQuestionBankXlsx(xlsxPath) {
  const wb = xlsx.readFile(xlsxPath);
  const preferredSheets = ["Elite_Bank", "Question_Bank"];
  const sheetName = preferredSheets.find((name) => wb.Sheets[name]) ||
    wb.SheetNames.find((name) => {
      const lower = name.toLowerCase();
      return lower.includes("bank") || lower.includes("exam");
    });
  if (!sheetName) throw new Error("Could not find a question sheet (Elite_Bank / Question_Bank).");
  const ws = wb.Sheets[sheetName];

  const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null });
  const headerRowIndex = aoa.findIndex(
    (row) =>
      Array.isArray(row) &&
      row.some((cell) => {
        if (cell == null) return false;
        const text = String(cell).trim().toLowerCase();
        return text === "question" || text === "question text" || text === "prompt";
      })
  );
  if (headerRowIndex === -1) throw new Error("Could not find header row (column containing 'Question').");

  const headerRaw = aoa[headerRowIndex].map((h) => (h == null ? "" : String(h).trim()));
  const header = headerRaw.map((h) => h.toLowerCase());
  const rows = aoa
    .slice(headerRowIndex + 1)
    .filter((r) => Array.isArray(r) && r.some((v) => v != null && String(v).trim() !== ""));

  const columnAliases = {
    prompt: ["question", "prompt", "question text"],
    optionA: ["option a", "choice a", "a"],
    optionB: ["option b", "choice b", "b"],
    optionC: ["option c", "choice c", "c"],
    optionD: ["option d", "choice d", "d"],
    correct: ["correct", "correct answer"],
    explanation: ["correct explanation", "best answer rationale", "explanation", "rationale"],
    reference: ["pmbok section", "pmbok reference", "reference"],
    domain: ["domain"],
    topic: ["topic", "theme"],
    approach: ["approach", "method"],
    difficulty: ["difficulty"],
  };

  function columnIndex(key) {
    const aliases = columnAliases[key] || [];
    for (const alias of aliases) {
      const idx = header.indexOf(alias);
      if (idx !== -1) return idx;
    }
    return null;
  }

  const columnIndexes = Object.keys(columnAliases).reduce((acc, key) => {
    acc[key] = columnIndex(key);
    return acc;
  }, {});

  function cell(row, key) {
    const idx = columnIndexes[key];
    if (idx == null) return null;
    const value = row[idx];
    return value == null ? null : value;
  }

  const questions = [];
  for (const row of rows) {
    const prompt = cell(row, "prompt");
    const a = cell(row, "optionA");
    const b = cell(row, "optionB");
    const c = cell(row, "optionC");
    const d = cell(row, "optionD");
    const correct = normalizeChoiceLetter(cell(row, "correct"));

    if (!prompt || !a || !b || !correct) continue;

    const topic = cell(row, "topic");
    const domain = cell(row, "domain");
    const difficulty = cell(row, "difficulty");
    const approach = cell(row, "approach");
    const reference = cell(row, "reference");

    const explanation = cell(row, "explanation");

    const tags = Array.from(
      new Set(
        [topic, domain, difficulty, approach, reference]
          .map((t) => (t == null ? null : String(t).trim()))
          .filter((t) => t && t.length > 0)
      )
    );

    const refParts = [];
    if (reference) refParts.push(`Reference: ${String(reference).trim()}`);
    if (approach) refParts.push(`Approach: ${String(approach).trim()}`);
    if (topic) refParts.push(`Theme: ${String(topic).trim()}`);
    const referenceText = refParts.length ? refParts.join(" | ") : null;

    const q = {
      certification: "PMP",
      prompt: String(prompt).trim(),
      choiceA: String(a).trim(),
      choiceB: String(b).trim(),
      choiceC: c == null ? null : String(c).trim(),
      choiceD: d == null ? null : String(d).trim(),
      correct,
      explanation: explanation == null ? null : String(explanation).trim(),
      referenceText,
      tags,
      difficultyScore: toDifficultyScore(difficulty),
      domain: domain == null ? null : String(domain).trim(),
    };

    questions.push(q);
  }

  return questions;
}

async function main() {
  const parsed = parseQuestionBankXlsx(resolved);
  const input = limit ? parsed.slice(0, limit) : parsed;

  console.log(`Parsed questions: ${parsed.length}${limit ? ` (importing first ${input.length})` : ""}`);

  if (dryRun) {
    input.slice(0, 5).forEach((q, idx) => {
      console.log(`[dry-run] ${idx + 1}. ${q.prompt.slice(0, 80)}…`);
    });
    console.log(`Dry-run complete — would process ${input.length} rows.`);
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  const domainCache = new Map();
  let createdQuestions = 0;
  let skippedQuestions = 0;

  try {
    await client.query("BEGIN");
    await client.query(
      'DELETE FROM "QuestionAttempt" WHERE "questionId" IN (SELECT "id" FROM "PracticeQuestion" WHERE "sourceWorkbook" = $1)',
      [workbookLabel]
    );
    await client.query(
      'DELETE FROM "PracticeQuestion" WHERE "sourceWorkbook" = $1',
      [workbookLabel]
    );

    for (const q of input) {
      let domainId = null;
      if (q.domain) {
        const cacheKey = q.domain.toLowerCase();
        if (domainCache.has(cacheKey)) {
          domainId = domainCache.get(cacheKey);
        } else {
          const upsert = await client.query(
            'INSERT INTO "QuestionDomain" ("id", "certification", "name", "updatedAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT ("certification", "name") DO UPDATE SET "updatedAt" = NOW() RETURNING "id"',
            [crypto.randomUUID(), "PMP", q.domain]
          );
          domainId = upsert.rows[0].id;
          domainCache.set(cacheKey, domainId);
        }
      }

      await client.query(
        'INSERT INTO "PracticeQuestion" ("id", "certification", "format", "stem", "choiceA", "choiceB", "choiceC", "choiceD", "correctAnswer", "explanation", "referenceText", "difficulty", "domainId", "tags", "sourceWorkbook", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)',
        [
          crypto.randomUUID(),
          "PMP",
          "SINGLE_CHOICE",
          q.prompt,
          q.choiceA,
          q.choiceB,
          q.choiceC,
          q.choiceD,
          q.correct,
          q.explanation,
          q.referenceText,
          q.difficultyScore,
          domainId,
          q.tags,
          workbookLabel,
          new Date(),
        ]
      );
      createdQuestions++;
    }

    await client.query("COMMIT");

    console.log("\nDone.");
    console.log(
      JSON.stringify(
        {
          dryRun: false,
          parsed: parsed.length,
          imported: createdQuestions,
          skipped: skippedQuestions,
        },
        null,
        2
      )
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
