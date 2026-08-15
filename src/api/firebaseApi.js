import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  getDoc,
  setDoc,
  limit,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// ==================== WATCHLIST ====================

export const addToWatchlist = async (userId, mediaId, mediaType, posterPath, title) => {
  const docRef = doc(db, "watchlist", `${userId}_${mediaType}_${mediaId}`);
  await setDoc(docRef, {
    userId,
    mediaId: Number(mediaId),
    mediaType,
    posterPath,
    title,
    createdAt: serverTimestamp(),
  });
};

export const removeFromWatchlist = async (userId, mediaId, mediaType) => {
  const docRef = doc(db, "watchlist", `${userId}_${mediaType}_${mediaId}`);
  await deleteDoc(docRef);
};

export const checkInWatchlist = async (userId, mediaId, mediaType) => {
  const docRef = doc(db, "watchlist", `${userId}_${mediaType}_${mediaId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

export const getUserWatchlist = async (userId) => {
  const q = query(
    collection(db, "watchlist"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ==================== RATINGS ====================

export const addOrUpdateRating = async (userId, mediaId, mediaType, score) => {
  const docRef = doc(db, "ratings", `${userId}_${mediaType}_${mediaId}`);
  await setDoc(docRef, {
    userId,
    mediaId: Number(mediaId),
    mediaType,
    score,
    updatedAt: serverTimestamp(),
  });
};

export const removeRating = async (userId, mediaId, mediaType) => {
  const docRef = doc(db, "ratings", `${userId}_${mediaType}_${mediaId}`);
  await deleteDoc(docRef);
};

export const getUserRating = async (userId, mediaId, mediaType) => {
  const docRef = doc(db, "ratings", `${userId}_${mediaType}_${mediaId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().score : null;
};

export const getMediaRatings = async (mediaId, mediaType) => {
  const q = query(
    collection(db, "ratings"),
    where("mediaId", "==", Number(mediaId)),
    where("mediaType", "==", mediaType)
  );
  const snapshot = await getDocs(q);
  const ratings = snapshot.docs.map((doc) => doc.data().score);
  if (ratings.length === 0) return { average: 0, count: 0 };
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return { average: Math.round(average * 10) / 10, count: ratings.length };
};

// ==================== COMMENTS ====================

export const addComment = async (userId, userEmail, mediaId, mediaType, content) => {
  await addDoc(collection(db, "comments"), {
    userId,
    userEmail,
    mediaId: Number(mediaId),
    mediaType,
    content,
    createdAt: serverTimestamp(),
  });
};

export const deleteComment = async (commentId) => {
  await deleteDoc(doc(db, "comments", commentId));
};

export const getComments = async (mediaId, mediaType) => {
  const q = query(
    collection(db, "comments"),
    where("mediaId", "==", Number(mediaId)),
    where("mediaType", "==", mediaType),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
