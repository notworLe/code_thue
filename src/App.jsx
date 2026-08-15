import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";
import store from "./redux/store";
import { setUser, clearUser } from "./redux/features/authSlice";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import SearchPage from "./pages/SearchPage";
import AuthPage from "./pages/AuthPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import PersonDetailPage from "./pages/PersonDetailPage";
import WatchlistPage from "./pages/WatchlistPage";

function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid, email: user.email }));
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return null;
}

function AppContent() {
  return (
    <BrowserRouter>
      <AuthListener />
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/:mediaType/:id" element={<MovieDetailPage />} />
            <Route path="/person/:id" element={<PersonDetailPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
