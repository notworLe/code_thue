import { Link } from "react-router-dom";
import { posterUrl } from "../api/tmdbApi";
import { FiStar } from "react-icons/fi";

export default function MovieCard({ item, mediaType }) {
  const type = mediaType || item.media_type || "movie";
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const year = date ? new Date(date).getFullYear() : "";
  const poster = posterUrl(item.poster_path, "w342");

  return (
    <Link to={`/${type}/${item.id}`} className="movie-card">
      <div className="movie-card-poster">
        {poster ? (
          <img src={poster} alt={title} loading="lazy" />
        ) : (
          <div className="movie-card-no-poster">
            <span>🎬</span>
          </div>
        )}
        <div className="movie-card-overlay">
          <span className="movie-card-view">Xem chi tiết</span>
        </div>
        {item.vote_average > 0 && (
          <div className="movie-card-rating">
            <FiStar />
            <span>{item.vote_average?.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{title}</h3>
        {year && <span className="movie-card-year">{year}</span>}
      </div>
    </Link>
  );
}
