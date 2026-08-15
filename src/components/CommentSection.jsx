import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { addComment, deleteComment, getComments } from "../api/firebaseApi";
import { FiSend, FiTrash2 } from "react-icons/fi";
import Pagination from "./Pagination";

const COMMENTS_PER_PAGE = 5;

export default function CommentSection({ mediaId, mediaType }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await getComments(mediaId, mediaType);
      setComments(data);
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [mediaId, mediaType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await addComment(user.uid, user.email, mediaId, mediaType, newComment.trim());
      setNewComment("");
      await fetchComments();
      setCurrentPage(1);
    } catch (err) {
      console.error("Add comment error:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xoá bình luận này?")) return;
    try {
      await deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);
  const paginatedComments = comments.slice(
    (currentPage - 1) * COMMENTS_PER_PAGE,
    currentPage * COMMENTS_PER_PAGE
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="comment-section">
      <h3 className="comment-title">
        Bình luận ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={
            isAuthenticated
              ? "Viết bình luận của bạn..."
              : "Đăng nhập để bình luận"
          }
          className="comment-input"
          disabled={!isAuthenticated}
          rows={3}
        />
        <button
          type="submit"
          className="comment-submit"
          disabled={!isAuthenticated || loading || !newComment.trim()}
        >
          <FiSend /> Gửi
        </button>
      </form>

      <div className="comments-list">
        {paginatedComments.length === 0 ? (
          <p className="no-comments">Chưa có bình luận nào.</p>
        ) : (
          paginatedComments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-email">{comment.userEmail}</span>
                <span className="comment-date">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
              {user?.uid === comment.userId && (
                <button
                  className="comment-delete"
                  onClick={() => handleDelete(comment.id)}
                >
                  <FiTrash2 /> Xoá
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
