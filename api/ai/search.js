import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Bạn là công cụ tìm kiếm phim thông minh. Người dùng sẽ mô tả phim bằng ngôn ngữ tự nhiên và bạn cần phân tích ý định của họ.

Nhiệm vụ: Dựa trên mô tả của người dùng, trả về danh sách phim phù hợp nhất.

Quy tắc trả lời:
- Trả về JSON hợp lệ, KHÔNG có text thêm
- Mỗi phim gồm: title (tên gốc tiếng Anh), year, description (tiếng Việt, 1 câu), relevance (giải thích vì sao phù hợp, tiếng Việt)
- Tối đa 6 phim, xếp theo độ liên quan giảm dần
- Nếu không hiểu yêu cầu, trả về mảng rỗng

Format trả về (CHỈ JSON, không markdown):
[
  {
    "title": "Inception",
    "year": 2010,
    "description": "Phim về kẻ trộm xâm nhập giấc mơ",
    "relevance": "Phim về giấc mơ trong giấc mơ, đúng yêu cầu"
  }
]`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Query is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Retry logic for 503 errors
    let text = "";
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(query.trim());
        text = result.response.text();
        break;
      } catch (err) {
        lastError = err;
        if (String(err).includes("503") && attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }

    let movies = [];
    try {
      movies = JSON.parse(text);
    } catch {
      movies = [];
    }

    return res.status(200).json({
      query: query.trim(),
      interpretation: `Tìm kiếm AI cho: "${query.trim()}"`,
      results: Array.isArray(movies) ? movies : [],
    });
  } catch (error) {
    console.error("Search API error:", error);
    return res.status(500).json({
      error: "Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.",
    });
  }
}
