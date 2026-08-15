import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function TrailerModal({ videos, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const trailers = videos.filter(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  if (!trailers.length) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
          <p className="modal-empty">Không có trailer cho phim này.</p>
        </div>
      </div>
    );
  }

  const current = trailers[currentIndex];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content trailer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="trailer-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${current.key}?autoplay=1`}
            title={current.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="trailer-iframe"
          />
        </div>

        <div className="trailer-info">
          <h3>{current.name}</h3>
          <span>
            {currentIndex + 1} / {trailers.length}
          </span>
        </div>

        {trailers.length > 1 && (
          <div className="trailer-nav">
            <button
              className="trailer-nav-btn"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? trailers.length - 1 : prev - 1
                )
              }
            >
              <FiChevronLeft />
            </button>
            <button
              className="trailer-nav-btn"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === trailers.length - 1 ? 0 : prev + 1
                )
              }
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
