import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * MODEL_CHAIN — thứ tự ưu tiên:
 * - Models ✅ OK để trước (nhanh nhất)
 * - Models ⚠️ quota để sau (tự reset hàng ngày)
 * - Khi 429 quota → tự nhảy sang model tiếp theo
 * - Khi 503 busy → retry 1 lần → nhảy tiếp
 * - Khi 404 missing → skip ngay
 * - Khi TIMEOUT → báo ngay (không thử tiếp, tránh chờ lâu)
 */
const MODEL_CHAIN = [
  "gemini-3-flash-preview",   // ✅ confirmed 1.06s
  "gemini-3.8-flash",         // 🔄 busy → may recover
  "gemini-4-argon",           // ⚠️ quota resets daily
  "gemini-3.6-flash",         // ⚠️ quota resets daily
  "gemini-3.5-flash",         // ⚠️ quota resets daily
  "gemini-3.1-pro-preview",   // ⚠️ quota resets daily
];

const SYSTEM_PROMPT = `Bạn là trợ lý AI tư vấn phim trên website MovieReview.

Nhiệm vụ:
- Gợi ý phim phù hợp với yêu cầu (tâm trạng, thể loại, hoàn cảnh)
- Trả lời câu hỏi về nội dung phim (KHÔNG spoil)
- So sánh phim khi được yêu cầu
- Đề xuất 2-4 phim, kèm tên gốc, năm, mô tả ngắn 1-2 câu

Quy tắc:
- Trả lời bằng tiếng Việt
- Dùng emoji phù hợp (🎬 ⭐ 🔥 📺 💡)
- Ngắn gọn, tối đa 200 từ
- Không trả lời câu hỏi ngoài chủ đề phim/giải trí/diễn viên`;

// Per-model timeout (ms) — phải < Vercel 10s limit
const MODEL_TIMEOUT_MS = 8000;

function classifyError(msg) {
  const s = String(msg);
  if (s.includes("429")) return "quota";
  if (s.includes("503")) return "busy";
  if (s.includes("404")) return "not_found";
  if (s.includes("TIMEOUT")) return "timeout";
  return "error";
}

/**
 * Gọi Gemini với fallback tự động.
 * Trả về: { reply, modelUsed } hoặc throw Error với .errorType
 */
async function callWithFallback(message, chatHistory) {
  let allQuota = true; // nếu tất cả đều 429 → thông báo riêng

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
      });

      const chat = model.startChat({ history: chatHistory });

      // Race với timeout để tránh chờ quá lâu
      const result = await Promise.race([
        chat.sendMessage(message),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("TIMEOUT")), MODEL_TIMEOUT_MS)
        ),
      ]);

      const reply = result.response.text();
      console.log(`[AI] ✅ model=${modelName}`);
      return { reply, modelUsed: modelName };

    } catch (err) {
      const errType = classifyError(err.message);
      console.warn(`[AI] ${modelName}: ${errType}`);

      if (errType === "timeout") {
        // Timeout = Gemini không kịp trả lời — không thử tiếp, báo ngay
        const e = new Error("Gemini timeout");
        e.errorType = "timeout";
        throw e;
      }

      if (errType === "not_found") {
        allQuota = false;
        continue; // 404 → skip ngay
      }

      if (errType === "quota") {
        continue; // 429 → thử model tiếp, giữ allQuota = true
      }

      if (errType === "busy") {
        allQuota = false;
        // Retry 1 lần sau 1s
        await new Promise((r) => setTimeout(r, 1000));
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
          });
          const chat = model.startChat({ history: chatHistory });
          const result = await Promise.race([
            chat.sendMessage(message),
            new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), MODEL_TIMEOUT_MS)),
          ]);
          const reply = result.response.text();
          console.log(`[AI] ✅ model=${modelName} (retry)`);
          return { reply, modelUsed: modelName };
        } catch {
          continue; // retry vẫn lỗi → thử model tiếp
        }
      }

      // Lỗi khác (auth, network) → dừng luôn
      allQuota = false;
      const e = new Error(err.message);
      e.errorType = "error";
      throw e;
    }
  }

  // Hết cả chain
  const e = new Error("All models exhausted");
  e.errorType = allQuota ? "all_quota" : "all_failed";
  throw e;
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

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ errorType: "config", error: "API key chưa được cấu hình." });
    }

    // Build history — bỏ welcome message và error messages, phải bắt đầu bằng user
    const chatHistory = history
      .filter((m) => m.role !== "system")
      .filter((m) => !m.isError) // flag từ frontend
      .slice(1) // skip welcome message (role assistant)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const { reply, modelUsed } = await callWithFallback(message.trim(), chatHistory);
    return res.status(200).json({ reply, model: modelUsed });

  } catch (err) {
    console.error("[AI] Handler error:", err.message);
    const errorType = err.errorType || "error";

    // Trả errorType để frontend hiện UX phù hợp
    const messages = {
      timeout: "AI đang xử lý chậm. Vui lòng thử lại nhé!",
      all_quota: "AI đang bận (hết lượt dùng). Vui lòng thử lại sau vài phút!",
      all_failed: "AI tạm thời không khả dụng. Vui lòng thử lại sau!",
      config: "API chưa được cấu hình.",
      error: "Có lỗi xảy ra. Vui lòng thử lại!",
    };

    return res.status(500).json({
      errorType,
      error: messages[errorType] || messages.error,
    });
  }
}
