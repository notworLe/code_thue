/**
 * Script:
 * 1. Test tất cả Gemini text-generation models
 * 2. In kết quả theo trạng thái
 * 3. Tự cập nhật MODEL_CHAIN trong api/ai/chat.js với các models OK
 *
 * Chạy: node test_models.mjs
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync, writeFileSync } from "fs";

// Load .env
const envFile = readFileSync(".env", "utf-8");
envFile.split("\n").forEach((line) => {
  const eqIdx = line.indexOf("=");
  if (eqIdx > 0) {
    const k = line.substring(0, eqIdx).trim();
    const v = line.substring(eqIdx + 1).trim().replace(/^"|"$/g, "");
    if (k && v) process.env[k] = v;
  }
});

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("❌ GEMINI_API_KEY missing in .env"); process.exit(1); }

// Tất cả models text-generation (bỏ TTS, Live, Image, Transcribe, Embedding, Video, Music)
const ALL_TEXT_MODELS = [
  // Gemini 4
  "gemini-4-argon",
  // Gemini 3.x stable
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-3-flash-preview",
  // Gemini 2.5 (limited access)
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

const TIMEOUT_MS = 8000;
const genAI = new GoogleGenerativeAI(KEY);

function classifyError(msg) {
  if (msg.includes("429")) return "429_QUOTA";
  if (msg.includes("404")) return "404_MISSING";
  if (msg.includes("503")) return "503_BUSY";
  if (msg.includes("TIMEOUT")) return "TIMEOUT";
  return "OTHER_ERR";
}

console.log("=".repeat(60));
console.log("  GEMINI MODEL SCAN");
console.log(`  Key: ${KEY.substring(0, 10)}...`);
console.log("=".repeat(60));

const results = { ok: [], quota: [], busy: [], missing: [], error: [] };

for (const modelName of ALL_TEXT_MODELS) {
  const pad = modelName.padEnd(28);
  process.stdout.write(`  ${pad} `);
  const start = Date.now();

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { maxOutputTokens: 10 },
    });

    await Promise.race([
      model.generateContent("Say: OK"),
      new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), TIMEOUT_MS)),
    ]);

    const ms = Date.now() - start;
    console.log(`✅ OK       ${(ms / 1000).toFixed(2)}s`);
    results.ok.push({ model: modelName, ms });
  } catch (err) {
    const ms = Date.now() - start;
    const type = classifyError(err.message);
    const icons = {
      "429_QUOTA": "⚠️  QUOTA   ",
      "404_MISSING": "❌ MISSING ",
      "503_BUSY": "🔄 BUSY    ",
      "TIMEOUT": "⏱  TIMEOUT ",
      "OTHER_ERR": "💥 ERROR   ",
    };
    console.log(`${icons[type]} ${(ms / 1000).toFixed(2)}s`);
    const bucket = type === "429_QUOTA" ? "quota" : type === "404_MISSING" ? "missing" : type === "503_BUSY" ? "busy" : "error";
    results[bucket].push(modelName);
  }
}

// ============ SUMMARY ============
console.log("\n" + "=".repeat(60));
console.log("  RESULTS");
console.log("=".repeat(60));
console.log(`✅ OK      : ${results.ok.map(r => r.model).join(", ") || "none"}`);
console.log(`⚠️  QUOTA   : ${results.quota.join(", ") || "none"}`);
console.log(`🔄 BUSY    : ${results.busy.join(", ") || "none"}`);
console.log(`❌ MISSING : ${results.missing.join(", ") || "none"}`);
console.log(`💥 ERROR   : ${results.error.join(", ") || "none"}`);

if (results.ok.length === 0 && results.quota.length === 0) {
  console.log("\n⚠️  Không có model nào khả dụng! Kiểm tra API key.");
  process.exit(1);
}

// Sort OK models by speed
results.ok.sort((a, b) => a.ms - b.ms);

// Build fallback chain: OK models first (fastest first), then quota models (might reset later)
const chain = [
  ...results.ok.map(r => r.model),
  ...results.quota,   // available after quota reset
  ...results.busy,    // might recover
];

if (chain.length === 0) {
  console.log("\n⚠️  Không đủ model để build chain.");
  process.exit(1);
}

console.log(`\n🏆 Fastest: ${results.ok[0]?.model ?? "none"}`);
console.log(`📋 Chain   : ${chain.join(" → ")}`);

// ============ AUTO-UPDATE chat.js ============
const chatPath = "api/ai/chat.js";
let chatSrc = readFileSync(chatPath, "utf-8");

const chainStr = chain.map(m => `  "${m}",`).join("\n");
const newChain = `const MODEL_CHAIN = [\n${chainStr}\n];`;

// Replace existing MODEL_CHAIN
const updated = chatSrc.replace(
  /const MODEL_CHAIN = \[[\s\S]*?\];/,
  newChain
);

if (updated === chatSrc) {
  console.log("\n⚠️  Không tìm thấy MODEL_CHAIN trong chat.js để cập nhật.");
} else {
  writeFileSync(chatPath, updated, "utf-8");
  console.log(`\n✅ Đã cập nhật MODEL_CHAIN trong ${chatPath}`);
  console.log("   Chạy lệnh sau để deploy:");
  console.log("   git add api/ai/chat.js && git commit -m \"fix: update model chain\" && git push");
}
