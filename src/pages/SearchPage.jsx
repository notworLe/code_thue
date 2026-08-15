import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMulti, searchMovie, searchTv, searchPerson } from "../api/tmdbApi";
import MovieCard from "../components/MovieCard";
import PersonCard from "../components/PersonCard";
import Pagination from "../components/Pagination";

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "movie", label: "Phim lẻ" },
  { key: "tv", label: "Phim dài tập" },
  { key: "person", label: "Con người" },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [filter, setFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        let res;
        switch (filter) {
          case "movie":
            res = await searchMovie(query, currentPage);
            break;
          case "tv":
            res = await searchTv(query, currentPage);
            break;
          case "person":
            res = await searchPerson(query, currentPage);
            break;
          default:
            res = await searchMulti(query, currentPage);
        }
        let items = res.data.results || [];
        if (filter !== "all") {
          items = items.map((item) => ({ ...item, media_type: filter }));
        }
        setResults(items);
        setTotalPages(res.data.total_pages || 1);
      } catch (err) {
        console.error("Search error:", err);
      }
      setLoading(false);
    };
    fetchResults();
  }, [query, filter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filter]);

  return (
    <div className="search-page">
      <div className="page-header">
        <h1>
          Tìm kiếm: <span className="search-query">"{query}"</span>
        </h1>
        <div className="tab-bar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`tab-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Đang tìm kiếm...</p>
        </div>
      ) : results.length === 0 && query ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>Không tìm thấy kết quả cho "{query}"</p>
        </div>
      ) : (
        <>
          <div className="media-grid">
            {results.map((item) => {
              const type = item.media_type || filter;
              if (type === "person") {
                return <PersonCard key={item.id} person={item} />;
              }
              return <MovieCard key={`${type}-${item.id}`} item={item} mediaType={type} />;
            })}
          </div>
          {results.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
