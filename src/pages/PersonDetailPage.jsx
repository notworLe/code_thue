import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPersonDetails, profileUrl, posterUrl } from "../api/tmdbApi";
import MovieCard from "../components/MovieCard";
import { FiCalendar, FiMapPin } from "react-icons/fi";

export default function PersonDetailPage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      try {
        const { data } = await getPersonDetails(id);
        setPerson(data);
      } catch (err) {
        console.error("Person fetch error:", err);
      }
      setLoading(false);
    };
    fetchPerson();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="empty-state">
        <p>Không tìm thấy thông tin.</p>
      </div>
    );
  }

  const credits = person.combined_credits?.cast || [];
  const sortedCredits = [...credits]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 20);

  const biography = person.biography || "Chưa có thông tin tiểu sử.";

  return (
    <div className="person-detail-page">
      <div className="person-hero">
        <div className="person-photo-large">
          {person.profile_path ? (
            <img
              src={profileUrl(person.profile_path, "h632")}
              alt={person.name}
            />
          ) : (
            <div className="person-no-photo-large">👤</div>
          )}
        </div>
        <div className="person-info-detail">
          <h1>{person.name}</h1>
          <div className="person-meta">
            {person.birthday && (
              <span className="meta-item">
                <FiCalendar /> Sinh: {person.birthday}
              </span>
            )}
            {person.deathday && (
              <span className="meta-item">
                Mất: {person.deathday}
              </span>
            )}
            {person.place_of_birth && (
              <span className="meta-item">
                <FiMapPin /> {person.place_of_birth}
              </span>
            )}
            {person.known_for_department && (
              <span className="meta-item genre-tag">
                {person.known_for_department}
              </span>
            )}
          </div>
          <div className="person-bio">
            <h3>Giới thiệu</h3>
            <p>
              {showFullBio || biography.length <= 500
                ? biography
                : `${biography.slice(0, 500)}...`}
            </p>
            {biography.length > 500 && (
              <button
                className="bio-toggle"
                onClick={() => setShowFullBio(!showFullBio)}
              >
                {showFullBio ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        </div>
      </div>

      {sortedCredits.length > 0 && (
        <section className="detail-section">
          <h2 className="section-title">Phim đã tham gia</h2>
          <div className="media-grid">
            {sortedCredits.map((item) => (
              <MovieCard
                key={`${item.media_type}-${item.id}-${item.credit_id}`}
                item={item}
                mediaType={item.media_type}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
