import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTrending, backdropUrl, posterUrl } from "../api/tmdbApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function Banner() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await getTrending("all", "day");
        setMovies(data.results.slice(0, 8));
      } catch (err) {
        console.error("Banner fetch error:", err);
      }
    };
    fetchTrending();
  }, []);

  if (!movies.length) return <div className="banner-skeleton" />;

  return (
    <div className="banner">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="banner-swiper"
      >
        {movies.map((item) => (
          <SwiperSlide key={item.id}>
            <Link
              to={`/${item.media_type === "tv" ? "tv" : "movie"}/${item.id}`}
              className="banner-slide"
            >
              <div
                className="banner-backdrop"
                style={{
                  backgroundImage: `url(${backdropUrl(item.backdrop_path)})`,
                }}
              >
                <div className="banner-gradient" />
                <div className="banner-content">
                  <div className="banner-poster">
                    <img
                      src={posterUrl(item.poster_path, "w342")}
                      alt={item.title || item.name}
                    />
                  </div>
                  <div className="banner-info">
                    <span className="banner-badge">
                      {item.media_type === "tv" ? "TV Show" : "Phim"}
                    </span>
                    <h2 className="banner-title">
                      {item.title || item.name}
                    </h2>
                    <p className="banner-overview">
                      {item.overview?.slice(0, 200)}
                      {item.overview?.length > 200 ? "..." : ""}
                    </p>
                    <div className="banner-meta">
                      <span className="banner-rating">
                        ⭐ {item.vote_average?.toFixed(1)}
                      </span>
                      <span className="banner-date">
                        {item.release_date || item.first_air_date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
