# Website Đánh Giá Phim - Implementation Plan

Dựa trên báo cáo đề tài **"11216081_NguyenVuAnhTuan_Webdanhgiaphim"**, xây dựng website đánh giá phim với đầy đủ chức năng theo mô tả trong report.

## Tóm Tắt Đề Tài

Xây dựng website đánh giá phim với các chức năng: hiển thị danh sách phim, tra cứu thông tin chi tiết, tìm kiếm theo từ khóa/bộ lọc, đăng ký/đăng nhập, quản lý danh sách yêu thích (watchlist), đánh giá và viết bình luận.

## Technology Stack (Theo Report)

| Công nghệ | Mục đích |
|---|---|
| **ReactJS** | Frontend framework (component-based, Virtual DOM) |
| **TailwindCSS** | CSS utility-first framework |
| **Redux Toolkit** | State management |
| **Firebase** | Authentication + Firestore (NoSQL database) |
| **TMDB API** | Dữ liệu phim (The Movie Database) |
| **Axios** | HTTP client cho API calls |
| **React Router** | Routing/điều hướng |
| **React Icons** | Icon library |
| **Swiper** | Slider/carousel component |

## User Review Required

> [!IMPORTANT]
> **TMDB API Key**: Cần có API key từ [themoviedb.org](https://developer.themoviedb.org/docs) để lấy dữ liệu phim. Bạn đã có API key chưa?

> [!IMPORTANT]
> **Firebase Project**: Cần tạo Firebase project để sử dụng Authentication và Firestore. Bạn đã có Firebase config chưa?

## Open Questions

> [!IMPORTANT]
> 1. Bạn có muốn dùng **Vite** làm build tool (phổ biến hiện nay) không?
> 2. Report đề cập TailwindCSS - bạn muốn dùng version nào? (v3 hay v4?)
> 3. Bạn có TMDB API key và Firebase config sẵn rồi không? Nếu chưa, tôi sẽ tạo placeholder.

## Proposed Changes

### 1. Project Setup & Configuration

#### [NEW] Project initialization with Vite + React
- `npx create-vite ./ --template react`
- Cài đặt dependencies: `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `firebase`, `axios`, `react-icons`, `swiper`, `tailwindcss`

#### [NEW] [tailwind.config.js](file:///home/notworle/nonvintage/gitvanhub/code_thue/tailwind.config.js)
- Cấu hình TailwindCSS với custom theme colors

#### [NEW] [.env](file:///home/notworle/nonvintage/gitvanhub/code_thue/.env)
- Biến môi trường: `VITE_TMDB_API_KEY`, `VITE_FIREBASE_*`

---

### 2. Firebase Configuration

#### [NEW] [src/firebase/firebase.js](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/firebase/firebase.js)
- Khởi tạo Firebase app, Auth, Firestore

---

### 3. Redux Store & Slices

#### [NEW] [src/redux/store.js](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/redux/store.js)
- Cấu hình Redux store

#### [NEW] [src/redux/features/authSlice.js](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/redux/features/authSlice.js)
- Quản lý trạng thái đăng nhập/đăng ký

#### [NEW] [src/redux/features/movieSlice.js](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/redux/features/movieSlice.js)
- Quản lý dữ liệu phim từ TMDB API

---

### 4. API Services

#### [NEW] [src/api/tmdbApi.js](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/api/tmdbApi.js)
- Axios instance cho TMDB API
- Các hàm: `getTrending()`, `getPopular()`, `getTopRated()`, `getMovieDetails()`, `getShowDetails()`, `getPersonDetails()`, `searchMulti()`, `getMoviesByGenre()`, `getCredits()`, `getVideos()`, `getSimilar()`, `getSeasons()`

#### [NEW] [src/api/firebaseApi.js](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/api/firebaseApi.js)
- CRUD cho Firestore collections: watchlist, ratings, comments

---

### 5. Pages (Theo Report - Chương 4)

#### [NEW] [src/pages/HomePage.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/pages/HomePage.jsx)
- **Banner** slider hiển thị phim trending (Swiper)
- Danh sách phim trending dạng list + mức độ nổi tiếng
- Danh sách phim theo thể loại (đang chiếu, đánh giá cao)

#### [NEW] [src/pages/ExplorePage.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/pages/ExplorePage.jsx)
- 3 tab: Phim dài tập (TV), Phim lẻ (Movie), Con người (People)
- Hệ thống lọc theo thể loại (genre filter)
- Pagination

#### [NEW] [src/pages/SearchPage.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/pages/SearchPage.jsx)
- Tự động mở khi nhập vào thanh tìm kiếm
- Bộ lọc: TV, Movie, People
- Hiển thị thông báo không tìm thấy kết quả

#### [NEW] [src/pages/AuthPage.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/pages/AuthPage.jsx)
- Toggle giữa Đăng nhập/Đăng ký
- Nút ẩn/hiện mật khẩu (biểu tượng con mắt)
- Redirect về trang chủ sau khi thành công

#### [NEW] [src/pages/MovieDetailPage.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/pages/MovieDetailPage.jsx)
- Ảnh bìa (backdrop) + Poster + Thông tin chi tiết
- Thanh đánh giá (rating bar) - điểm cá nhân + điểm trung bình + tổng lượt
- Nút xem trailer (modal video player, có nút điều hướng prev/next)
- Nút thêm/xóa khỏi danh sách yêu thích
- Danh sách diễn viên chính (click → trang thông tin người)
- Mục mùa phim (cho TV shows)
- Phần bình luận (tối đa 5/trang, pagination, xóa bình luận cá nhân)
- Phim tương tự/gợi ý

#### [NEW] [src/pages/PersonDetailPage.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/pages/PersonDetailPage.jsx)
- Ảnh, tên, giới thiệu, ngày sinh
- Danh sách phim có tham gia

#### [NEW] [src/pages/WatchlistPage.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/pages/WatchlistPage.jsx)
- Hiển thị tất cả phim yêu thích
- Nút xóa khỏi danh sách
- Pagination

---

### 6. Components

#### [NEW] [src/components/Navbar.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/Navbar.jsx)
- Biểu tượng người dùng (dropdown: login/email + watchlist + logout)
- Thanh tìm kiếm (điều hướng tới SearchPage khi nhập)

#### [NEW] [src/components/Banner.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/Banner.jsx)
- Swiper slider cho phim trending

#### [NEW] [src/components/MovieCard.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/MovieCard.jsx)
- Thẻ phim (poster, tên, thể loại, điểm)

#### [NEW] [src/components/PersonCard.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/PersonCard.jsx)
- Thẻ diễn viên (ảnh, tên, công việc)

#### [NEW] [src/components/GenreFilter.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/GenreFilter.jsx)
- Bộ lọc thể loại cho Explore/Search page

#### [NEW] [src/components/RatingBar.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/RatingBar.jsx)
- Thanh đánh giá (chọn điểm, hủy, sửa)

#### [NEW] [src/components/CommentSection.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/CommentSection.jsx)
- Danh sách bình luận (5/trang), form nhập, nút xóa

#### [NEW] [src/components/TrailerModal.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/TrailerModal.jsx)
- Modal phát video trailer, nút prev/next

#### [NEW] [src/components/Pagination.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/Pagination.jsx)
- Điều hướng trang (trước, sau, đến trang cụ thể)

#### [NEW] [src/components/Footer.jsx](file:///home/notworle/nonvintage/gitvanhub/code_thue/src/components/Footer.jsx)

---

### 7. Firestore Database Structure (Theo Report 3.5)

```
Collections:
├── users/          → { id, email, password (handled by Firebase Auth) }
├── watchlist/      → { userId, mediaId, mediaType }
├── ratings/        → { userId, mediaId, mediaType, score, timestamp }
└── comments/       → { id, userId, userEmail, mediaId, mediaType, content, timestamp }
```

---

### 8. Routing Structure

```
/                    → HomePage
/explore             → ExplorePage
/search              → SearchPage
/auth                → AuthPage (Login/Register)
/movie/:id           → MovieDetailPage
/tv/:id              → MovieDetailPage (TV variant)
/person/:id          → PersonDetailPage
/watchlist            → WatchlistPage
```

---

## Verification Plan

### Automated Tests
- Chạy `npm run build` để verify code compiles thành công

### Manual Verification
- Kiểm tra từng trang trên browser
- Test flow: Đăng ký → Đăng nhập → Tìm phim → Xem chi tiết → Đánh giá → Bình luận → Thêm yêu thích → Xem watchlist → Đăng xuất
- Test responsive trên mobile viewport
