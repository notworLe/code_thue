import { useState } from "react";
import { useSelector } from "react-redux";
import { FiStar } from "react-icons/fi";
import { addOrUpdateRating, removeRating } from "../api/firebaseApi";

export default function RatingBar({
  mediaId,
  mediaType,
  userRating,
  communityRating,
  ratingCount,
  onRatingUpdate,
}) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRate = async (score) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để đánh giá!");
      return;
    }
    setLoading(true);
    try {
      if (userRating === score) {
        await removeRating(user.uid, mediaId, mediaType);
        onRatingUpdate(null);
      } else {
        await addOrUpdateRating(user.uid, mediaId, mediaType, score);
        onRatingUpdate(score);
      }
    } catch (err) {
      console.error("Rating error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="rating-bar">
      <div className="rating-stars">
        <span className="rating-label">Đánh giá:</span>
        <div className="stars-container">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              className={`star-btn ${
                star <= (hoveredStar || userRating || 0) ? "filled" : ""
              }`}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => handleRate(star)}
              disabled={loading}
              title={`${star}/10`}
            >
              <FiStar />
            </button>
          ))}
        </div>
        {userRating && (
          <span className="user-score">Điểm của bạn: {userRating}/10</span>
        )}
      </div>
      <div className="rating-community">
        <span className="community-score">
          ⭐ {communityRating > 0 ? communityRating.toFixed(1) : "—"}
        </span>
        <span className="community-count">({ratingCount} đánh giá)</span>
      </div>
    </div>
  );
}
