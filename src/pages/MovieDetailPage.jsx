import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getDetails,
  getVideos,
  posterUrl,
  backdropUrl,
  profileUrl,
} from "../api/tmdbApi";
import {
  checkInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getUserRating,
  getMediaRatings,
} from "../api/firebaseApi";
import RatingBar from "../components/RatingBar";
import CommentSection from "../components/CommentSection";
import TrailerModal from "../components/TrailerModal";
import MovieCard from "../components/MovieCard";
import { FiPlay, FiHeart, FiCalendar, FiClock } from "react-icons/fi";

export default function MovieDetailPage() {
  const { mediaType, id } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [details, setDetails] = useState(null);
  const [videos, setVideos] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [communityRating, setCommunityRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailsRes, videosRes] = await Promise.all([
          getDetails(mediaType, id),
          getVideos(mediaType, id),
        ]);
        setDetails(detailsRes.data);
        setVideos(videosRes.data.results || []);

        // Fetch ratings
        const ratings = await getMediaRatings(id, mediaType);
        setCommunityRating(ratings.average);
        setRatingCount(ratings.count);

        // Fetch user-specific data
        if (isAuthenticated && user) {
          const [isInList, rating] = await Promise.all([
            checkInWatchlist(user.uid, id, mediaType),
            getUserRating(user.uid, id, mediaType),
          ]);
          setInWatchlist(isInList);
          setUserRating(rating);
        }
      } catch (err) {
        console.error("Detail fetch error:", err);
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [mediaType, id, isAuthenticated, user]);

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập!");
      return;
    }
    try {
      if (inWatchlist) {
        await removeFromWatchlist(user.uid, id, mediaType);
        setInWatchlist(false);
      } else {
        await addToWatchlist(
          user.uid,
          id,
          mediaType,
          details.poster_path,
          details.title || details.name
        );
        setInWatchlist(true);
      }
    } catch (err) {
      console.error("Watchlist error:", err);
    }
  };

  const handleRatingUpdate = async (newRating) => {
    setUserRating(newRating);
    const ratings = await getMediaRatings(id, mediaType);
    setCommunityRating(ratings.average);
    setRatingCount(ratings.count);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="empty-state">
        <p>Không tìm thấy thông tin phim.</p>
      </div>
    );
  }

  const title = details.title || details.name;
  const date = details.release_date || details.first_air_date;
  const genres = details.genres || [];
  const cast = details.credits?.cast?.slice(0, 12) || [];
  const directors =
    details.credits?.crew?.filter((c) => c.job === "Director") || [];
  const similar = details.similar?.results?.slice(0, 12) || [];
  const recommendations = details.recommendations?.results?.slice(0, 12) || [];
  const seasons = details.seasons || [];

  return (
    <div className="detail-page">
      {/* Hero Section */}
      <div
        className="detail-hero"
        style={{
          backgroundImage: `url(${backdropUrl(details.backdrop_path)})`,
        }}
      >
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <div className="detail-poster">
            <img
              src={posterUrl(details.poster_path)}
              alt={title}
            />
          </div>
          <div className="detail-info">
            <h1 className="detail-title">{title}</h1>
            {details.tagline && (
              <p className="detail-tagline">"{details.tagline}"</p>
            )}
            <div className="detail-meta">
              {date && (
                <span className="meta-item">
                  <FiCalendar /> {date}
                </span>
              )}
              {details.runtime && (
                <span className="meta-item">
                  <FiClock /> {details.runtime} phút
                </span>
              )}
              {details.number_of_seasons && (
                <span className="meta-item">
                  📺 {details.number_of_seasons} mùa
                </span>
              )}
              <span className="meta-item">
                ⭐ {details.vote_average?.toFixed(1)} ({details.vote_count} votes)
              </span>
            </div>
            <div className="detail-genres">
              {genres.map((g) => (
                <span key={g.id} className="genre-tag">
                  {g.name}
                </span>
              ))}
            </div>
            {directors.length > 0 && (
              <p className="detail-director">
                <strong>Đạo diễn:</strong>{" "}
                {directors.map((d) => d.name).join(", ")}
              </p>
            )}
            <p className="detail-overview">{details.overview}</p>

            <div className="detail-actions">
              <button className="btn-trailer" onClick={() => setShowTrailer(true)}>
                <FiPlay /> Xem Trailer
              </button>
              <button
                className={`btn-watchlist ${inWatchlist ? "in-list" : ""}`}
                onClick={handleWatchlist}
              >
                <FiHeart />
                {inWatchlist ? "Xoá khỏi yêu thích" : "Thêm vào yêu thích"}
              </button>
            </div>

            <RatingBar
              mediaId={id}
              mediaType={mediaType}
              userRating={userRating}
              communityRating={communityRating}
              ratingCount={ratingCount}
              onRatingUpdate={handleRatingUpdate}
            />
          </div>
        </div>
      </div>

      <div className="detail-body">
        {/* Cast */}
        {cast.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Diễn viên</h2>
            <div className="cast-grid">
              {cast.map((person) => (
                <Link
                  key={person.credit_id}
                  to={`/person/${person.id}`}
                  className="cast-card"
                >
                  <div className="cast-photo">
                    {person.profile_path ? (
                      <img
                        src={profileUrl(person.profile_path)}
                        alt={person.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="cast-no-photo">👤</div>
                    )}
                  </div>
                  <div className="cast-info">
                    <h4>{person.name}</h4>
                    <span>{person.character}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Seasons (TV Shows) */}
        {mediaType === "tv" && seasons.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Các mùa</h2>
            <div className="seasons-grid">
              {seasons.map((season) => (
                <div
                  key={season.id}
                  className={`season-card ${selectedSeason === season.season_number ? "selected" : ""}`}
                  onClick={() =>
                    setSelectedSeason(
                      selectedSeason === season.season_number
                        ? null
                        : season.season_number
                    )
                  }
                >
                  <div className="season-poster">
                    {season.poster_path ? (
                      <img
                        src={posterUrl(season.poster_path, "w185")}
                        alt={season.name}
                      />
                    ) : (
                      <div className="season-no-poster">📺</div>
                    )}
                  </div>
                  <div className="season-info">
                    <h4>{season.name}</h4>
                    <span>{season.episode_count} tập</span>
                    {season.air_date && <span>{season.air_date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <CommentSection mediaId={id} mediaType={mediaType} />

        {/* Similar / Recommendations */}
        {recommendations.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Phim gợi ý</h2>
            <div className="media-grid">
              {recommendations.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  mediaType={item.media_type || mediaType}
                />
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Phim tương tự</h2>
            <div className="media-grid">
              {similar.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  mediaType={item.media_type || mediaType}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <TrailerModal videos={videos} onClose={() => setShowTrailer(false)} />
      )}
    </div>
  );
}
