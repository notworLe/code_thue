import { useState, useEffect } from "react";
import { getComments, getMediaRatings } from "../api/firebaseApi";
import { FiCpu, FiThumbsUp, FiThumbsDown, FiRefreshCw } from "react-icons/fi";

const AI_API_BASE =
  import.meta.env.VITE_AI_API_BASE || "/api/ai";

export default function ReviewSummary({ mediaId, mediaType, movieTitle }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasEnoughComments, setHasEnoughComments] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const [comments, ratings] = await Promise.all([
        getComments(mediaId, mediaType),
        getMediaRatings(mediaId, mediaType),
      ]);

      if (comments.length < 3) {
        setHasEnoughComments(false);
        setLoading(false);
        return;
      }

      setHasEnoughComments(true);

      const res = await fetch(`${AI_API_BASE}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comments: comments.map((c) => ({
            content: c.content,
            userEmail: c.userEmail,
          })),
          movieTitle,
          averageRating: ratings.average,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Summary error:", err);
      setError("Không thể tạo tóm tắt lúc này.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, [mediaId, mediaType]);

  if (!hasEnoughComments && !loading) return null;

  const sentimentIcon = {
    positive: "✅",
    negative: "⚠️",
    mixed: "🔄",
  };

  const sentimentText = {
    positive: "Tích cực",
    negative: "Tiêu cực",
    mixed: "Trung lập",
  };

  return (
    <div className="review-summary">
      <div className="review-summary-header">
        <h3>
          <FiCpu /> Tóm tắt đánh giá AI
        </h3>
        <button
          className="review-summary-refresh"
          onClick={fetchSummary}
          disabled={loading}
          title="Tạo lại tóm tắt"
        >
          <FiRefreshCw className={loading ? "spinning" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="review-summary-loading">
          <div className="spinner" />
          <p>AI đang phân tích bình luận...</p>
        </div>
      ) : error ? (
        <div className="review-summary-error">
          <p>{error}</p>
        </div>
      ) : summary ? (
        <div className="review-summary-content">
          <div className="review-summary-sentiment">
            <span className="sentiment-badge">
              {sentimentIcon[summary.sentiment] || "🔄"}{" "}
              {sentimentText[summary.sentiment] || "Trung lập"}
            </span>
            <span className="comment-count">
              từ {summary.commentCount} bình luận
            </span>
          </div>

          <p className="review-summary-text">{summary.summary}</p>

          {summary.highlights?.length > 0 && (
            <div className="review-summary-tags">
              <FiThumbsUp className="tag-icon positive" />
              {summary.highlights.map((h, i) => (
                <span key={i} className="tag positive">
                  {h}
                </span>
              ))}
            </div>
          )}

          {summary.concerns?.length > 0 && (
            <div className="review-summary-tags">
              <FiThumbsDown className="tag-icon negative" />
              {summary.concerns.map((c, i) => (
                <span key={i} className="tag negative">
                  {c}
                </span>
              ))}
            </div>
          )}

          {summary.recommendation && (
            <p className="review-summary-rec">
              💡 {summary.recommendation}
            </p>
          )}

          <p className="review-summary-footer">
            Được tạo bởi AI • Gemini Flash
          </p>
        </div>
      ) : null}
    </div>
  );
}
