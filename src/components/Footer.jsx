export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">🎬 MovieReview</span>
          <p className="footer-desc">
            Website đánh giá phim - Khám phá, đánh giá và chia sẻ cảm nhận về
            những bộ phim yêu thích của bạn.
          </p>
        </div>
        <div className="footer-links">
          <p>Dữ liệu phim được cung cấp bởi</p>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-tmdb"
          >
            The Movie Database (TMDB)
          </a>
        </div>
        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} MovieReview. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
