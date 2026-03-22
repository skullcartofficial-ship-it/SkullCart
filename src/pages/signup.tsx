import { useState } from "react";
import { auth, signInWithGoogle } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { sendWelcomeEmail } from "../emailService"; // Import email service
import "./signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [loading, setLoading] = useState(false);

  const signupUser = async () => {
    // Validation
    if (!firstName || !lastName) {
      alert("Please enter your first and last name");
      return;
    }

    if (!email) {
      alert("Please enter your email");
      return;
    }

    if (!phone) {
      alert("Please enter your phone number");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password should be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const fullName = `${firstName} ${lastName}`.trim();

      // Update profile with display name (combine first and last name)
      await updateProfile(user, {
        displayName: fullName,
      });

      // Store user info in localStorage
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userFirstName", firstName);
      localStorage.setItem("userLastName", lastName);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userPhone", `${countryCode}${phone}`);
      localStorage.setItem("userPhoto", "");

      // Send welcome email
      try {
        const emailResult = await sendWelcomeEmail(fullName, email);
        if (emailResult.success) {
          console.log("✅ Welcome email sent successfully to:", email);
        } else {
          console.error("❌ Failed to send welcome email:", emailResult.error);
        }
      } catch (emailError) {
        console.error("❌ Email sending error:", emailError);
      }

      alert(
        "Account created successfully! Check your email for welcome message! 🎉"
      );
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Signup error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        alert("Email already in use. Please use a different email or login.");
      } else if (error.code === "auth/weak-password") {
        alert("Password is too weak. Please use a stronger password.");
      } else {
        alert("Signup failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();

      // Store user info in localStorage
      let userName = "";
      if (user.displayName) {
        userName = user.displayName;
        localStorage.setItem("userName", user.displayName);
        // Split name for first and last name if possible
        const nameParts = user.displayName.split(" ");
        localStorage.setItem("userFirstName", nameParts[0] || "");
        localStorage.setItem(
          "userLastName",
          nameParts.slice(1).join(" ") || ""
        );
      } else if (user.email) {
        const emailName = user.email.split("@")[0];
        userName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userFirstName", emailName);
        localStorage.setItem("userLastName", "");
      } else {
        userName = "User";
        localStorage.setItem("userName", "User");
        localStorage.setItem("userFirstName", "User");
        localStorage.setItem("userLastName", "");
      }

      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");
      localStorage.setItem("userPhone", "");

      // Send welcome email for Google signup
      if (user.email) {
        try {
          const emailResult = await sendWelcomeEmail(userName, user.email);
          if (emailResult.success) {
            console.log("✅ Welcome email sent to Google user:", user.email);
          } else {
            console.error(
              "❌ Failed to send welcome email to Google user:",
              emailResult.error
            );
          }
        } catch (emailError) {
          console.error("❌ Email sending error:", emailError);
        }
      }

      alert(`Welcome ${userName}! Check your email for welcome message! 🎉`);
      window.location.href = "/";
    } catch (error: any) {
      console.error("Google signup error:", error);

      if (error.message.includes("unauthorized-domain")) {
        alert(
          `Domain "${window.location.hostname}" is not authorized!\n\nPlease add "${window.location.hostname}" to Firebase Console:\nAuthentication → Settings → Authorized domains`
        );
      } else {
        alert(error.message || "Google signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2>💀 Create Account</h2>

        {/* Name row */}
        <div className="name-row">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        {/* Phone */}
        <div className="phone-row">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            disabled={loading}
          >
            <option value="+1">+1 (USA)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+91">+91 (India)</option>
            <option value="+61">+61 (Australia)</option>
            <option value="+81">+81 (Japan)</option>
          </select>

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button className="signup-btn" onClick={signupUser} disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="divider">OR</div>

        <button
          className="google-signup-btn"
          onClick={googleSignup}
          disabled={loading}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
            alt="google"
          />
          {loading ? "Signing up..." : "Sign up with Google"}
        </button>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
