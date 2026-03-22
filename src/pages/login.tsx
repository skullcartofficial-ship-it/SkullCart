import "../styles.css";
import "./login.css";
import { auth, signInWithGoogle } from "../firebase";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { sendWelcomeEmail } from "../emailService"; // Import email service

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

      // Store user name in localStorage
      let userName = "";
      if (user.displayName && user.displayName.trim() !== "") {
        userName = user.displayName;
        localStorage.setItem("userName", user.displayName);
        localStorage.setItem("userDisplayName", user.displayName);
      } else {
        const emailName = email.split("@")[0];
        userName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userDisplayName", "");
      }
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");
      localStorage.setItem("userId", user.uid);

      // Send welcome email for first-time email login users
      const welcomeEmailSent = localStorage.getItem("welcomeEmailSent");
      if (!welcomeEmailSent && user.email) {
        try {
          await sendWelcomeEmail(userName, user.email);
          localStorage.setItem("welcomeEmailSent", "true");
          console.log("Welcome email sent to email user");
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }
      }

      alert("Login successful 🎉");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();

      // Get the stored user name
      const userName = localStorage.getItem("userName") || "";
      const userEmail = localStorage.getItem("userEmail") || "";

      // Send welcome email for first-time Google users
      const welcomeEmailSent = localStorage.getItem("welcomeEmailSent");
      if (!welcomeEmailSent && userEmail) {
        try {
          await sendWelcomeEmail(userName, userEmail);
          localStorage.setItem("welcomeEmailSent", "true");
          console.log("Welcome email sent to Google user");
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }
      }

      console.log("Google login successful, user name stored");
      alert(`Welcome ${userName || "User"}! 🎉`);
      window.location.href = "/";
    } catch (error: any) {
      console.error("Google login error:", error);
      alert(error.message || "Google login failed. Please try again.");
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
