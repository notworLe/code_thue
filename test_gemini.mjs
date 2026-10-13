import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";

// Read .env manually
const envFile = readFileSync(".env", "utf-8");
envFile.split("\n").forEach(line => {
  const [k, v] = line.split("=");
  if (k && v) process.env[k.trim()] = v.trim().replace(/^"|"$/g, "");
});

const key = process.env.GEMINI_API_KEY;
console.log("API Key:", key ? `${key.substring(0, 8)}...` : "MISSING!");

if (!key) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(key);

async function testChat() {
  console.log("\n🔄 Testing Gemini API directly...\n");
  const start = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: { maxOutputTokens: 256 },
    });

    const result = await model.generateContent("Xin chào, gợi ý 1 phim hay");
    const text = result.response.text();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    
    console.log(`✅ Gemini phản hồi trong ${elapsed}s:`);
    console.log(`📝 ${text.substring(0, 200)}...`);
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`❌ Lỗi sau ${elapsed}s:`, err.message);
  }
}

async function testVercelProxy() {
  console.log("\n🔄 Testing Vercel API endpoint...\n");
  const start = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch("https://danh-gia-phim.vercel.app/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "hi" }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    const data = await res.json();
    
    if (res.ok) {
      console.log(`✅ Vercel API phản hồi trong ${elapsed}s:`);
      console.log(`📝 ${data.reply?.substring(0, 200)}...`);
    } else {
      console.error(`❌ Vercel API lỗi ${res.status} sau ${elapsed}s:`);
      console.error(data);
    }
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`❌ Vercel API timeout/lỗi sau ${elapsed}s:`, err.message);
  }
}

async function testLocalProxy() {
  console.log("\n🔄 Testing localhost proxy...\n");
  const start = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch("http://localhost:5173/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "hi" }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    const data = await res.json();
    
    if (res.ok) {
      console.log(`✅ Local proxy phản hồi trong ${elapsed}s:`);
      console.log(`📝 ${data.reply?.substring(0, 200)}...`);
    } else {
      console.error(`❌ Local proxy lỗi ${res.status} sau ${elapsed}s:`);
      console.error(data);
    }
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`❌ Local proxy lỗi sau ${elapsed}s:`, err.message);
  }
}

console.log("========================================");
console.log("  GEMINI API TEST SCRIPT");
console.log("========================================");

await testChat();
await testVercelProxy();
await testLocalProxy();

console.log("\n✅ Test hoàn tất!");
