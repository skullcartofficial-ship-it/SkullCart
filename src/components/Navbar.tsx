import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getCart } from "../cart";
import EditProfile from "./EditProfile";
import "./Navbar.css";

const skullLogo = "/orangecatfinals.png";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">(
    "top"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const storedName = localStorage.getItem("userName");
        let name = "";
        if (storedName && storedName !== "null" && storedName !== "undefined") {
          name = storedName;
        } else if (u.displayName) {
          name = u.displayName;
          localStorage.setItem("userName", u.displayName);
        } else if (u.email) {
          const emailName = u.email.split("@")[0];
          name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          localStorage.setItem("userName", name);
        } else {
          name = "User";
        }
        setUserName(name);
        const nameParts = name.trim().split(" ");
        const initials =
          nameParts.length === 1
            ? nameParts[0].charAt(0).toUpperCase()
            : nameParts[0].charAt(0).toUpperCase() +
              nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        setUserInitials(initials);
        localStorage.setItem("userEmail", u.email || "");
      } else {
        setUserName("");
        setUserInitials("");
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setCartCount(getCart().length);
  }, []);

  const calculateDropdownPosition = () => {
    if (window.innerWidth <= 768) {
      const avatarElement = document.querySelector(".avatar-initials");
      if (avatarElement) {
        const rect = avatarElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 340;
        if (spaceBelow < dropdownHeight) {
          setDropdownPosition("bottom");
        } else {
          setDropdownPosition("top");
        }
      }
    }
  };

  const handleAvatarClick = () => {
    if (!dropdownOpen) {
      calculateDropdownPosition();
    }
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        const dropdown = document.querySelector(".dropdown");
        const avatar = document.querySelector(".avatar-initials");
        if (
          dropdown &&
          avatar &&
          !dropdown.contains(event.target as Node) &&
          !avatar.contains(event.target as Node)
        ) {
          setDropdownOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const logout = async () => {
    await signOut(auth);
    localStorage.clear();
    setDropdownOpen(false);
    setMobileNavOpen(false);
    navigate("/");
  };

  const handleNameUpdate = (newName: string) => {
    setUserName(newName);
    const nameParts = newName.trim().split(" ");
    const initials =
      nameParts.length === 1
        ? nameParts[0].charAt(0).toUpperCase()
        : nameParts[0].charAt(0).toUpperCase() +
          nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    setUserInitials(initials);
  };

  const getUserEmail = () =>
    localStorage.getItem("userEmail") || user?.email || "";

  const goTo = (path: string) => {
    setMobileNavOpen(false);
    navigate(path);
  };

  const handleAboutUsClick = () => {
    if (window.location.pathname === "/") {
      const aboutSection = document.getElementById("about-section");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
      }
    } else {
      navigate("/#about-section");
      setTimeout(() => {
        const aboutSection = document.getElementById("about-section");
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    setMobileNavOpen(false);
  };

  return (
    <>
      <header className="navbar">
        {/* ── LOGO ── */}
        <div className="logo" onClick={() => navigate("/")}>
          <img src={skullLogo} alt="ArmorX Logo" className="skull-image" />
          <span className="logo-text">ArmorX</span>
        </div>

        {/* ── DESKTOP LINKS ── */}
        <nav className="desktop-menu">
          <a onClick={() => navigate("/")}>Home</a>
          <a onClick={() => navigate("/shop")}>Shop</a>
          <a onClick={() => navigate("/shop")}>Deals</a>
          <a onClick={handleAboutUsClick}>About Us</a>
        </nav>

        {/* ── ACTIONS (search removed) ── */}
        <div className="actions">
          {/* Cart */}
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>

          {/* Profile / Login */}
          {user ? (
            <div className="profile">
              <div className="avatar-initials" onClick={handleAvatarClick}>
                {userInitials}
              </div>
              {dropdownOpen && (
                <div className={`dropdown dropdown-${dropdownPosition}`}>
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">{userInitials}</div>
                    <div className="dropdown-user-details">
                      <p className="dropdown-name">{userName}</p>
                      <p className="dropdown-email">{getUserEmail()}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    onClick={() => {
                      setShowEditProfile(true);
                      setDropdownOpen(false);
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button onClick={() => navigate("/orders")}>📦 Orders</button>
                  <button onClick={logout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {mobileNavOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <nav className={`mobile-drawer ${mobileNavOpen ? "open" : ""}`}>
        <button
          className="drawer-close"
          onClick={() => setMobileNavOpen(false)}
        >
          ✕
        </button>

        <a className="drawer-link" onClick={() => goTo("/")}>
          Home
        </a>
        <a className="drawer-link" onClick={() => goTo("/shop")}>
          Shop
        </a>
        <a className="drawer-link" onClick={() => goTo("/shop")}>
          Deals
        </a>
        <a className="drawer-link" onClick={handleAboutUsClick}>
          About Us
        </a>

        {user && (
          <button className="drawer-logout" onClick={logout}>
            🚪 Logout
          </button>
        )}
        {!user && (
          <a className="drawer-link" onClick={() => goTo("/login")}>
            🔑 Login
          </a>
        )}
      </nav>

      {showEditProfile && (
        <EditProfile
          onClose={() => setShowEditProfile(false)}
          onNameUpdated={handleNameUpdate}
        />
      )}
    </>
  );
}
