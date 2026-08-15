# Hướng Dẫn Tạo Firebase Project (5 phút)

## Bước 1: Truy cập Firebase Console
1. Mở trình duyệt, vào **[https://console.firebase.google.com](https://console.firebase.google.com)**
2. Đăng nhập bằng **tài khoản Google** của bạn

## Bước 2: Tạo Project mới
1. Click **"Create a project"** (hoặc "Tạo dự án")
2. Đặt tên project: `movie-review-app` (hoặc tên gì cũng được)
3. **Bỏ tick** Google Analytics (không cần thiết) → Click **"Create project"**
4. Đợi khoảng 30 giây → Click **"Continue"**

## Bước 3: Tạo Web App
1. Ở trang chủ project, click biểu tượng **`</>`** (Web)
2. Đặt tên app: `movie-review-web`
3. **Không cần** tick Firebase Hosting → Click **"Register app"**
4. Bạn sẽ thấy đoạn code chứa **firebaseConfig** giống như:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXX",
  authDomain: "movie-review-app-xxxxx.firebaseapp.com",
  projectId: "movie-review-app-xxxxx",
  storageBucket: "movie-review-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxx"
};
```

> [!IMPORTANT]
> **Copy lại các giá trị này!** Bạn sẽ cần dán vào file `.env`

5. Click **"Continue to console"**

## Bước 4: Bật Authentication
1. Ở menu bên trái, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Trong tab **"Sign-in method"**, click **"Email/Password"**
4. Bật **"Enable"** → Click **"Save"**

## Bước 5: Tạo Firestore Database
1. Ở menu bên trái, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Chọn location: **asia-southeast1 (Singapore)** (gần Việt Nam nhất)
4. Chọn **"Start in test mode"** → Click **"Create"**

## Bước 6: Dán config vào file .env

Sau khi hoàn thành, mở file `.env` trong project và **thay thế nội dung** thành:

```env
VITE_TMDB_API_KEY=a224d1984c5771d15fc531a47dae66fb

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> [!TIP]
> Thay các giá trị `your_...` bằng config bạn đã copy ở **Bước 3**

---

## Sau khi xong, hãy nói cho tôi biết để tôi bắt đầu code! 🚀
