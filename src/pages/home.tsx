import "../styles.css";
import "./login.css";
import { auth, signInWithGoogle } from "../firebase";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store user info in localStorage
      if (user.displayName) {
        localStorage.setItem("userName", user.displayName);
      } else if (user.email) {
        const emailName = user.email.split("@")[0];
        localStorage.setItem(
          "userName",
          emailName.charAt(0).toUpperCase() + emailName.slice(1)
        );
      } else {
        localStorage.setItem("userName", "User");
      }
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");

      alert("Login successful 🎉");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found") {
        alert("User not found. Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email format.");
      } else {
        alert("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();

      // Store user info in localStorage
      if (user.displayName) {
        localStorage.setItem("userName", user.displayName);
      } else if (user.email) {
        const emailName = user.email.split("@")[0];
        localStorage.setItem(
          "userName",
          emailName.charAt(0).toUpperCase() + emailName.slice(1)
        );
      } else {
        localStorage.setItem("userName", "User");
      }
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");

      alert(`Welcome ${user.displayName || "User"}! 🎉`);
      window.location.href = "/";
    } catch (error: any) {
      console.error("Google login error:", error);

      if (error.message.includes("unauthorized-domain")) {
        alert(
          `Domain "${window.location.hostname}" is not authorized!\n\nPlease add "${window.location.hostname}" to Firebase Console:\nAuthentication → Settings → Authorized domains`
        );
      } else {
        alert(error.message || "Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <h2>💀 Skull Cart Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button className="login-btn" onClick={loginUser} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="divider">OR</div>

          <button
            className="google-btn"
            onClick={googleLogin}
            disabled={loading}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
              alt="google"
            />
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>

          <p className="signup">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>

        <div className="login-right">
          <img src="/skullcart.png" alt="logo" />
        </div>
      </div>
    </div>
  );
}
