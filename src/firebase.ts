import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBuEpUZD8CVIgk04t_9QV3DhTJf7WWYF3Q",
  authDomain: "skullcart-a6df4.firebaseapp.com",
  projectId: "skullcart-a6df4",
  storageBucket: "skullcart-a6df4.appspot.com",
  messagingSenderId: "694346856670",
  appId: "1:694346856670:web:6f3a9a69846e42418e2a4f",
  measurementId: "G-LRCQWW3L0E",
};

// Prevent duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

// ✅ Email/Password functions
export const signUpWithEmail = createUserWithEmailAndPassword;
export const signInWithEmail = signInWithEmailAndPassword;

// ✅ Google Sign-In function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("Google user data:", {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });

    // Extract a better name from email if displayName is not available
    let userName = user.displayName;

    if (!userName || userName.trim() === "") {
      // Try to extract name from email
      const emailName = user.email?.split("@")[0] || "";

      // Remove numbers and special characters, capitalize first letter
      let cleanName = emailName
        .replace(/[0-9]/g, "")
        .replace(/[^a-zA-Z]/g, " ");
      if (cleanName.trim() === "") {
        cleanName = emailName;
      }

      // Capitalize each word
      userName = cleanName
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      if (userName === "") {
        userName = "User";
      }
    }

    // Store user data
    localStorage.setItem("userName", userName);
    localStorage.setItem("userEmail", user.email || "");
    localStorage.setItem("userPhoto", user.photoURL || "");
    localStorage.setItem("userId", user.uid);

    return user;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

// ✅ Safe analytics
isSupported().then((yes) => {
  if (yes) getAnalytics(app);
});
