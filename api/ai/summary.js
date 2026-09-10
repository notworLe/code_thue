import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Bạn là công cụ tóm tắt đánh giá phim. Dựa trên danh sách bình luận được cung cấp, hãy tóm tắt thành một đánh giá ngắn gọn.

Quy tắc:
- Trả về JSON hợp lệ, KHÔNG có text thêm
- Phân tích sentiment tổng thể: "positive", "negative", hoặc "mixed"
- Liệt kê 2-3 điểm được khen nhiều nhất (highlights)
- Liệt kê 1-2 điểm bị chê (concerns), nếu không có thì để mảng rỗng
- Viết summary bằng tiếng Việt, 2-3 câu, tự nhiên
- Đưa ra recommendation: phim phù hợp cho ai

Format JSON:
{
  "summary": "Phim được đánh giá tích cực với...",
  "sentiment": "positive",
  "highlights": ["diễn xuất tuyệt vời", "hình ảnh đẹp"],
  "concerns": ["nhịp phim chậm"],
  "recommendation": "Phù hợp cho fan thể loại hành động"
}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { comments, movieTitle, averageRating } = req.body;

    if (!comments || !Array.isArray(comments) || comments.length < 3) {
      return res.status(400).json({
        error: "Cần ít nhất 3 bình luận để tóm tắt",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const commentText = comments
      .map((c, i) => `${i + 1}. "${c.content}" — ${c.userEmail || "Ẩn danh"}`)
      .join("\n");

    const prompt = `Phim: ${movieTitle || "Không rõ"}\nĐiểm trung bình: ${averageRating || "N/A"}/10\nSố bình luận: ${comments.length}\n\nCác bình luận:\n${commentText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        summary: "Không thể tóm tắt đánh giá lúc này.",
        sentiment: "mixed",
        highlights: [],
        concerns: [],
        recommendation: "",
      };
    }

    return res.status(200).json({
      commentCount: comments.length,
      ...parsed,
    });
  } catch (error) {
    console.error("Summary API error:", error);
    return res.status(500).json({
      error: "Có lỗi xảy ra khi tóm tắt. Vui lòng thử lại.",
    });
  }
}
