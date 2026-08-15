import { useState, useEffect } from "react";
import { getGenres } from "../api/tmdbApi";

export default function GenreFilter({ mediaType, selectedGenre, onGenreChange }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data } = await getGenres(mediaType);
        setGenres(data.genres || []);
      } catch (err) {
        console.error("Genre fetch error:", err);
      }
    };
    if (mediaType === "movie" || mediaType === "tv") {
      fetchGenres();
    }
  }, [mediaType]);

  if (mediaType === "person") return null;

  return (
    <div className="genre-filter">
      <button
        className={`genre-btn ${!selectedGenre ? "active" : ""}`}
        onClick={() => onGenreChange(null)}
      >
        Tất cả
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          className={`genre-btn ${selectedGenre === genre.id ? "active" : ""}`}
          onClick={() => onGenreChange(genre.id)}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
