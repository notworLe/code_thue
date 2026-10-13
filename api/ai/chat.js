import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Model fallback chain — thứ tự ưu tiên:
 * 1. Thử model đầu tiên
 * 2. Nếu 429 (quota) hoặc 503 (overload) → thử model tiếp theo
 * 3. Nếu 404 (not found) → skip, thử tiếp
 * 4. Nếu hết tất cả → trả lỗi rõ ràng
 */
const MODEL_CHAIN = [
  "gemini-3-flash-preview",   // ✅ 1.06s - fast & working
  "gemini-3.8-flash",         // 🔄 busy → recovers
  "gemini-4-argon",           // ⚠️ quota → resets daily
  "gemini-3.6-flash",         // ⚠️ quota → resets daily
  "gemini-3.5-flash",         // ⚠️ quota → resets daily
  "gemini-3.1-pro-preview",   // ⚠️ quota → resets daily
  // gemini-3.1-flash-lite   → 7.91s, quá chậm cho Vercel 10s timeout
  // gemini-3.5-flash-lite   → timeout/error
  // gemini-2.5-*            → 404 not available on this key
];

const SYSTEM_PROMPT = `Bạn là trợ lý AI tư vấn phim trên website MovieReview.

Nhiệm vụ:
- Gợi ý phim phù hợp với yêu cầu của người dùng (tâm trạng, thể loại, hoàn cảnh)
- Trả lời câu hỏi về nội dung phim (KHÔNG spoil cốt truyện chính)
- So sánh phim khi được yêu cầu
- Đề xuất 2-4 phim, kèm tên gốc, năm sản xuất, và mô tả ngắn 1-2 câu

Quy tắc:
- Trả lời bằng tiếng Việt
- Dùng emoji phù hợp (🎬 ⭐ 🔥 📺 💡)
- Ngắn gọn, tối đa 200 từ
- Không trả lời câu hỏi ngoài chủ đề phim/giải trí/diễn viên`;

/**
 * Phân loại lỗi Gemini API
 * @returns "quota" | "overload" | "not_found" | "error"
 */
function classifyError(err) {
  const msg = String(err);
  if (msg.includes("429")) return "quota";
  if (msg.includes("503")) return "overload";
  if (msg.includes("404")) return "not_found";
  return "error";
}

/**
 * Gọi Gemini với fallback chain
 * Tự động thử model tiếp theo nếu quota/overload/not_found
 */
async function callWithFallback(message, chatHistory) {
  const triedModels = [];
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    triedModels.push(modelName);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.7,
        },
      });

      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(message);
      const reply = result.response.text();

      // Log model được dùng để dễ debug
      console.log(`[AI] Model used: ${modelName}`);
      return { reply, modelUsed: modelName };
    } catch (err) {
      const errType = classifyError(err);
      lastError = err;

      if (errType === "not_found") {
        console.warn(`[AI] ${modelName}: 404 Not Found — skip`);
        continue; // Model không tồn tại → thử tiếp
      }
      if (errType === "quota") {
        console.warn(`[AI] ${modelName}: 429 Quota exceeded — trying next model`);
        continue; // Hết quota → thử model khác
      }
      if (errType === "overload") {
        console.warn(`[AI] ${modelName}: 503 Overloaded — trying next model`);
        // Retry 1 lần sau 1s trước khi chuyển model
        await new Promise((r) => setTimeout(r, 1000));
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
          });
          const chat = model.startChat({ history: chatHistory });
          const result = await chat.sendMessage(message);
          const reply = result.response.text();
          console.log(`[AI] Model used (retry): ${modelName}`);
          return { reply, modelUsed: modelName };
        } catch {
          continue; // Retry vẫn fail → thử model tiếp
        }
      }

      // Lỗi khác (auth, network...) → dừng luôn
      console.error(`[AI] ${modelName}: Unexpected error:`, err.message);
      throw err;
    }
  }

  // Hết cả chain
  throw new Error(
    `Tất cả model đều không khả dụng (đã thử: ${triedModels.join(", ")}). ` +
    `Lỗi cuối: ${lastError?.message?.substring(0, 100)}`
  );
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    // Build chat history — filter welcome/error messages, must start with user
    const chatHistory = history
      .filter((m) => m.role !== "system")
      .filter((m) => !m.content?.includes("⚠️"))
      .slice(1) // skip welcome message
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    const { reply, modelUsed } = await callWithFallback(message.trim(), chatHistory);

    return res.status(200).json({ reply, model: modelUsed });
  } catch (error) {
    console.error("[AI] Chat handler error:", error.message);

    // Phân loại lỗi để trả message phù hợp
    const errType = classifyError(error);
    let userMessage = "Có lỗi xảy ra. Vui lòng thử lại sau.";
    if (errType === "quota") {
      userMessage = "AI đang quá tải (hết quota). Vui lòng thử lại sau ít phút.";
    } else if (errType === "overload") {
      userMessage = "AI đang bận. Vui lòng thử lại sau vài giây.";
    }

    return res.status(500).json({
      error: userMessage,
      debug: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}
