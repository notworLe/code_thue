import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Bạn là trợ lý AI tư vấn phim trên website MovieReview.

Nhiệm vụ:
- Gợi ý phim phù hợp với yêu cầu của người dùng (tâm trạng, thể loại, hoàn cảnh)
- Trả lời câu hỏi về nội dung phim (KHÔNG spoil cốt truyện chính)
- So sánh phim khi được yêu cầu
- Luôn đề xuất 2-5 phim, kèm tên gốc, năm sản xuất, và mô tả ngắn 1-2 câu

Quy tắc:
- Trả lời bằng tiếng Việt
- Sử dụng emoji phù hợp (🎬 ⭐ 🔥 📺 💡)
- Giữ câu trả lời ngắn gọn, dễ đọc (tối đa 300 từ)
- Nếu không chắc chắn, hãy hỏi lại người dùng để hiểu rõ hơn
- Không trả lời các câu hỏi không liên quan đến phim/giải trí/diễn viên
- Nếu người dùng hỏi ngoài chủ đề, nhắc nhở nhẹ nhàng rằng bạn chỉ hỗ trợ về phim`;

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    });

    // Build chat history
    const chatHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    // Retry logic for 503 errors
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await chat.sendMessage(message.trim());
        const reply = result.response.text();
        return res.status(200).json({ reply });
      } catch (err) {
        lastError = err;
        if (String(err).includes("503") && attempt < 2) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  } catch (error) {
    console.error("Chat API error:", error.message);
    return res.status(500).json({
      error: "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.",
      debug: error.message || String(error),
    });
  }
}
