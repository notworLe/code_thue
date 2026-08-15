import { useState, useEffect } from "react";
import { getTrending, getPopular, getTopRated, getNowPlaying, getGenres } from "../api/tmdbApi";
import Banner from "../components/Banner";
import MovieCard from "../components/MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function MovieRow({ title, items, mediaType }) {
  return (
    <section className="movie-row">
      <h2 className="section-title">{title}</h2>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          480: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
        className="movie-swiper"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <MovieCard item={item} mediaType={mediaType} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

function TrendingList({ items }) {
  return (
    <section className="trending-list">
      <h2 className="section-title">🔥 Đang xu hướng</h2>
      <div className="trending-grid">
        {items.map((item, index) => (
          <div key={item.id} className="trending-item">
            <span className="trending-rank">{index + 1}</span>
            <MovieCard item={item} mediaType={item.media_type} />
            <div className="trending-popularity">
              <div
                className="trending-bar"
                style={{
                  width: `${Math.min(100, (item.popularity / items[0]?.popularity) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [popularTv, setPopularTv] = useState([]);
  const [topRatedTv, setTopRatedTv] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          trendingRes,
          popularMovieRes,
          topRatedMovieRes,
          nowPlayingRes,
          popularTvRes,
          topRatedTvRes,
        ] = await Promise.all([
          getTrending("all", "week"),
          getPopular("movie"),
          getTopRated("movie"),
          getNowPlaying("movie"),
          getPopular("tv"),
          getTopRated("tv"),
        ]);

        setTrending(trendingRes.data.results.slice(0, 10));
        setPopularMovies(popularMovieRes.data.results);
        setTopRatedMovies(topRatedMovieRes.data.results);
        setNowPlaying(nowPlayingRes.data.results);
        setPopularTv(popularTvRes.data.results);
        setTopRatedTv(topRatedTvRes.data.results);
      } catch (err) {
        console.error("HomePage fetch error:", err);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Banner />
      <div className="home-content">
        <TrendingList items={trending} />
        <MovieRow title="🎬 Phim đang chiếu" items={nowPlaying} mediaType="movie" />
        <MovieRow title="⭐ Phim đánh giá cao" items={topRatedMovies} mediaType="movie" />
        <MovieRow title="🔥 Phim phổ biến" items={popularMovies} mediaType="movie" />
        <MovieRow title="📺 TV Shows phổ biến" items={popularTv} mediaType="tv" />
        <MovieRow title="⭐ TV Shows đánh giá cao" items={topRatedTv} mediaType="tv" />
      </div>
    </div>
  );
}
