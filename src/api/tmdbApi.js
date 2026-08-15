import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: API_KEY,
    language: "vi-VN",
  },
});

// Trending
export const getTrending = (mediaType = "all", timeWindow = "week") =>
  tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);

// Popular
export const getPopular = (mediaType, page = 1) =>
  tmdbApi.get(`/${mediaType}/popular`, { params: { page } });

// Top Rated
export const getTopRated = (mediaType, page = 1) =>
  tmdbApi.get(`/${mediaType}/top_rated`, { params: { page } });

// Now Playing / On Air
export const getNowPlaying = (mediaType, page = 1) => {
  const endpoint = mediaType === "movie" ? "now_playing" : "on_the_air";
  return tmdbApi.get(`/${mediaType}/${endpoint}`, { params: { page } });
};

// Details
export const getDetails = (mediaType, id) =>
  tmdbApi.get(`/${mediaType}/${id}`, {
    params: { append_to_response: "credits,videos,similar,recommendations" },
  });

// Credits
export const getCredits = (mediaType, id) =>
  tmdbApi.get(`/${mediaType}/${id}/credits`);

// Videos
export const getVideos = (mediaType, id) =>
  tmdbApi.get(`/${mediaType}/${id}/videos`, { params: { language: "en-US" } });

// Similar
export const getSimilar = (mediaType, id, page = 1) =>
  tmdbApi.get(`/${mediaType}/${id}/similar`, { params: { page } });

// Recommendations
export const getRecommendations = (mediaType, id, page = 1) =>
  tmdbApi.get(`/${mediaType}/${id}/recommendations`, { params: { page } });

// Search
export const searchMulti = (query, page = 1) =>
  tmdbApi.get("/search/multi", { params: { query, page } });

export const searchMovie = (query, page = 1) =>
  tmdbApi.get("/search/movie", { params: { query, page } });

export const searchTv = (query, page = 1) =>
  tmdbApi.get("/search/tv", { params: { query, page } });

export const searchPerson = (query, page = 1) =>
  tmdbApi.get("/search/person", { params: { query, page } });

// Discover by genre
export const discoverByGenre = (mediaType, genreId, page = 1) =>
  tmdbApi.get(`/discover/${mediaType}`, {
    params: { with_genres: genreId, page, sort_by: "popularity.desc" },
  });

// Genres list
export const getGenres = (mediaType) =>
  tmdbApi.get(`/genre/${mediaType}/list`);

// Person Details
export const getPersonDetails = (id) =>
  tmdbApi.get(`/person/${id}`, {
    params: { append_to_response: "combined_credits" },
  });

// Person credits
export const getPersonCredits = (id) =>
  tmdbApi.get(`/person/${id}/combined_credits`);

// TV Season Details
export const getSeasonDetails = (tvId, seasonNumber) =>
  tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`);

// Image URLs
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const posterUrl = (path, size = "w500") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
export const backdropUrl = (path, size = "original") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
export const profileUrl = (path, size = "w185") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

export default tmdbApi;
