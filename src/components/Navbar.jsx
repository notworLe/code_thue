import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { clearUser } from "../redux/features/authSlice";
import { FiSearch, FiUser, FiLogOut, FiHeart, FiLogIn } from "react-icons/fi";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MovieReview</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Trang chủ</Link>
          <Link to="/explore" className="nav-link">Khám phá</Link>
        </div>

        <div className="navbar-actions">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm phim, diễn viên..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </form>

          <div className="user-menu" ref={dropdownRef}>
            <button
              className="user-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FiUser />
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                {isAuthenticated ? (
                  <>
                    <div className="dropdown-email">{user?.email}</div>
                    <Link
                      to="/watchlist"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FiHeart /> Danh sách yêu thích
                    </Link>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <FiLogOut /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiLogIn /> Đăng nhập
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
