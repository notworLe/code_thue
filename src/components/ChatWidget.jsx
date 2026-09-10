import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchMulti } from "../api/tmdbApi";
import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiMinimize2,
  FiMaximize2,
  FiSearch,
} from "react-icons/fi";

const AI_API_BASE =
  import.meta.env.VITE_AI_API_BASE || "/api/ai";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! 👋 Tôi là trợ lý AI tư vấn phim. Hãy cho tôi biết bạn muốn xem phim gì nhé!\n\n💡 Ví dụ:\n• \"Gợi ý phim kinh dị hay\"\n• \"Phim lãng mạn xem cùng người yêu\"\n• \"Phim hoạt hình cho cả gia đình\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter((m) => m.role !== "system");
      const res = await fetch(`${AI_API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau nhé!",
        },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (text) => {
    // Bold: **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Newlines
    formatted = formatted.replace(/\n/g, "<br/>");
    return formatted;
  };

  if (!isOpen) {
    return (
      <button
        className="chat-fab"
        onClick={() => setIsOpen(true)}
        title="Trợ lý AI tư vấn phim"
      >
        <FiMessageCircle />
        <span className="chat-fab-badge">AI</span>
      </button>
    );
  }

  return (
    <div className={`chat-widget ${isMinimized ? "minimized" : ""}`}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-avatar">🤖</span>
          <div>
            <h4>AI Movie Advisor</h4>
            <span className="chat-status">
              {loading ? "Đang trả lời..." : "Online"}
            </span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
          >
            {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
          </button>
          <button onClick={() => setIsOpen(false)} title="Đóng">
            <FiX />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                {msg.role === "assistant" && (
                  <span className="chat-msg-avatar">🤖</span>
                )}
                <div
                  className="chat-msg-content"
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(msg.content),
                  }}
                />
              </div>
            ))}
            {loading && (
              <div className="chat-msg assistant">
                <span className="chat-msg-avatar">🤖</span>
                <div className="chat-msg-content chat-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              rows={1}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              <FiSend />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
