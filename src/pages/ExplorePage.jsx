import { useState, useEffect } from "react";
import { getPopular, discoverByGenre, searchPerson } from "../api/tmdbApi";
import MovieCard from "../components/MovieCard";
import PersonCard from "../components/PersonCard";
import GenreFilter from "../components/GenreFilter";
import Pagination from "../components/Pagination";

const TABS = [
  { key: "movie", label: "Phim lẻ" },
  { key: "tv", label: "Phim dài tập" },
  { key: "person", label: "Con người" },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("movie");
  const [items, setItems] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res;
        if (activeTab === "person") {
          res = await getPopular("person", currentPage);
        } else if (selectedGenre) {
          res = await discoverByGenre(activeTab, selectedGenre, currentPage);
        } else {
          res = await getPopular(activeTab, currentPage);
        }
        setItems(res.data.results || []);
        setTotalPages(res.data.total_pages || 1);
      } catch (err) {
        console.error("Explore fetch error:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [activeTab, selectedGenre, currentPage]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedGenre(null);
    setCurrentPage(1);
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setCurrentPage(1);
  };

  return (
    <div className="explore-page">
      <div className="page-header">
        <h1>Khám phá</h1>
        <div className="tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <GenreFilter
        mediaType={activeTab}
        selectedGenre={selectedGenre}
        onGenreChange={handleGenreChange}
      />

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Đang tải...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>Không tìm thấy kết quả.</p>
        </div>
      ) : (
        <>
          <div className="media-grid">
            {items.map((item) =>
              activeTab === "person" ? (
                <PersonCard key={item.id} person={item} />
              ) : (
                <MovieCard key={item.id} item={item} mediaType={activeTab} />
              )
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
