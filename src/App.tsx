import "./styles.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Cart from "./pages/cart";
import Navbar from "./components/Navbar";
import VideoCarousel from "./components/VideoCarousel";
import { addToCart } from "./cart";
import Orders from "./pages/orders";
import Address from "./pages/address";
import Payment from "./pages/payment";
import Shop from "./pages/shop";

function Home() {
  const navigate = useNavigate();

  const handleAddToCart = (id: number, name: string, price: number) => {
    addToCart({
      id,
      title: name,
      price,
      image: `/${id}.jpg`,
      images: [`/${id}.jpg`],
      description: `${name} - High quality product`,
      category: "General",
      rating: 4.0,
    });
    alert(`${name} added to cart!`);
  };

  return (
    <div className="page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO with background video carousel - Changes every 5 seconds */}
      <section className="hero hero-with-video">
        {/* Video Carousel Component */}
        <VideoCarousel />

        {/* Hero Content */}
        <div className="hero-left">
          <h1>Smart Tech. Smart Prices.</h1>
          <p>Upgrade your Life with Affordable Gadgets</p>

          {/* SEARCH BAR REMOVED - Only Shop Now button remains */}
          <div className="shop-now-container">
            <button className="shop-btn" onClick={() => navigate("/shop")}>
              Shop Now
            </button>
          </div>

          <div className="features">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="hero-right">
          <img src="/skullcart.png" className="hero-image" alt="Skull Cart" />
        </div>
      </section>

      {/* BOTTOM FEATURES */}
      <section className="features-container">
        <div className="feature-item">🚚 Cash on Delivery</div>
        <div className="feature-item">🔄 Easy Returns</div>
        <div className="feature-item">🚀 Fast Shipping</div>
        <div className="feature-item">🔒 Secure Payments</div>
      </section>

      {/* MAIN SECTIONS */}
      <section className="main-sections">
        <h2 className="section-title">Best Sellers</h2>

        <div className="products">
          <div className="product-card">
            <span className="tag">Trending</span>
            <img src="/1.jpg" alt="product" className="product-img" />
            <h3>Smart LED Sensor Light</h3>
            <p className="price">₹649</p>

            <div className="product-buttons">
              <button className="cart">🛒</button>
              <button
                className="add"
                onClick={() =>
                  handleAddToCart(1, "Smart LED Sensor Light", 649)
                }
              >
                Add to Cart
              </button>
            </div>
          </div>

          <div className="product-card">
            <span className="tag">Trending</span>
            <img src="/2.jpg" alt="product" className="product-img" />
            <h3>3-in-1 Fast Charging</h3>
            <p className="price">₹449</p>

            <div className="product-buttons">
              <button className="cart">🛒</button>
              <button
                className="add"
                onClick={() => handleAddToCart(2, "3-in-1 Fast Charging", 449)}
              >
                Add to Cart
              </button>
            </div>
          </div>

          <div className="product-card">
            <span className="tag">Trending</span>
            <img src="/3.jpg" alt="product" className="product-img" />
            <h3>Mini Bluetooth Speaker</h3>
            <p className="price">₹899</p>

            <div className="product-buttons">
              <button className="cart">🛒</button>
              <button
                className="add"
                onClick={() =>
                  handleAddToCart(3, "Mini Bluetooth Speaker", 899)
                }
              >
                Add to Cart
              </button>
            </div>
          </div>

          <div className="product-card">
            <span className="tag">Trending</span>
            <img src="/4.jpg" alt="product" className="product-img" />
            <h3>Laptop Cooling Pad</h3>
            <p className="price">₹999</p>

            <div className="product-buttons">
              <button className="cart">🛒</button>
              <button
                className="add"
                onClick={() => handleAddToCart(4, "Laptop Cooling Pad", 999)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        <h2 className="section-title">Why Skull Cart?</h2>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon">₹</div>
            <h3>Affordable Prices</h3>
            <p>Budget-friendly tech for everyone</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">✔</div>
            <h3>Quality Checked</h3>
            <p>Tested & trusted products</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🎧</div>
            <h3>24/7 Support</h3>
            <p>Always here to help you</p>
          </div>
        </div>

        <h2 className="section-title">Customer Reviews</h2>

        <div className="reviews-container">
          <div className="review-card">
            <div className="review-header">
              <img src="/skullcart.jpg" alt="Priya" className="review-img" />
              <div>
                <h4>Priya Sharma</h4>
                <div className="stars">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
            <p>
              "The sensor light is perfect for our hallway. Great quality and
              price."
            </p>
          </div>

          <div className="review-card">
            <div className="review-header">
              <img src="/skullcart.jpg" alt="Ravi" className="review-img" />
              <div>
                <h4>Ravi Kumar</h4>
                <div className="stars">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
            <p>"Loved the charging cable combo! Very useful and affordable."</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>About Skullcart</h3>
            <p>
              Smart tech at smart prices. Innovative, affordable gadgets for
              everyday life.
            </p>
          </div>
          <div className="footer-section founder">
            <h3>CEO & Founder</h3>
            <p>Manohar Reddy.G</p>
            <p className="founder-title">Tech enthusiast & innovator</p>
          </div>
          <div className="footer-section social">
            <h3>Social Media</h3>
            <a
              href="https://instagram.com/skullcartofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-link"
            >
              📷 @skullcartofficial
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Skullcart. All rights reserved.
            <a
              href="https://instagram.com/skullcartofficial"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", marginLeft: "8px" }}
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/address" element={<Address />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
    </BrowserRouter>
  );
}
