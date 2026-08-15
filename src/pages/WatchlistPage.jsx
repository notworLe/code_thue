import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { getUserWatchlist, removeFromWatchlist } from "../api/firebaseApi";
import { posterUrl } from "../api/tmdbApi";
import { FiTrash2, FiFilm } from "react-icons/fi";

export default function WatchlistPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    const fetchWatchlist = async () => {
      try {
        const data = await getUserWatchlist(user.uid);
        setWatchlist(data);
      } catch (err) {
        console.error("Watchlist fetch error:", err);
      }
      setLoading(false);
    };
    fetchWatchlist();
  }, [isAuthenticated, user, navigate]);

  const handleRemove = async (mediaId, mediaType) => {
    try {
      await removeFromWatchlist(user.uid, mediaId, mediaType);
      setWatchlist((prev) =>
        prev.filter(
          (item) =>
            !(item.mediaId === mediaId && item.mediaType === mediaType)
        )
      );
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="watchlist-page">
      <div className="page-header">
        <h1>❤️ Danh sách yêu thích</h1>
        <p>{watchlist.length} phim</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiFilm size={48} />
          </div>
          <p>Danh sách yêu thích trống.</p>
          <Link to="/explore" className="btn-explore">
            Khám phá phim
          </Link>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map((item) => (
            <div key={item.id} className="watchlist-item">
              <Link to={`/${item.mediaType}/${item.mediaId}`}>
                <div className="watchlist-poster">
                  {item.posterPath ? (
                    <img
                      src={posterUrl(item.posterPath, "w342")}
                      alt={item.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="watchlist-no-poster">🎬</div>
                  )}
                </div>
                <h3 className="watchlist-title">{item.title}</h3>
                <span className="watchlist-type">
                  {item.mediaType === "tv" ? "TV Show" : "Phim"}
                </span>
              </Link>
              <button
                className="watchlist-remove"
                onClick={() => handleRemove(item.mediaId, item.mediaType)}
              >
                <FiTrash2 /> Xoá
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
