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

  // Brand Sections Data
  const brandSections = [
    {
      id: 1,
      name: "Armor",
      tagline: "Perfect For Gaming",
      brandColor: "#ff4757",
      products: [
        {
          id: 5,
          name: "Nike Air Max",
          price: 4999,
          image: "/1.jpg",
          category: "Sports shoes",
        },
        {
          id: 6,
          name: "Nike Dri-FIT Tee",
          price: 1299,
          image: "/6.jpg",
          category: "Apparel",
        },
        {
          id: 7,
          name: "Nike Court Vision",
          price: 3999,
          image: "/7.jpg",
          category: "Casual shoes",
        },
        {
          id: 8,
          name: "Nike Running Shoes",
          price: 4599,
          image: "/8.jpg",
          category: "Sports shoes",
        },
      ],
    },
    {
      id: 2,
      name: "Apple",
      tagline: "Innovative technology at your fingertips",
      brandColor: "#667eea",
      products: [
        {
          id: 9,
          name: "iPhone 15",
          price: 79999,
          image: "/9.jpg",
          category: "iPhone",
        },
        {
          id: 10,
          name: "MacBook Air M2",
          price: 99999,
          image: "/10.jpg",
          category: "MacBook",
        },
        {
          id: 11,
          name: "AirPods Pro 2",
          price: 24999,
          image: "/11.jpg",
          category: "AirPods",
        },
        {
          id: 12,
          name: "iPad Air",
          price: 59999,
          image: "/12.jpg",
          category: "iPad",
        },
      ],
    },
    {
      id: 3,
      name: "Samsung",
      tagline: "Next-generation mobile technology",
      brandColor: "#4caf50",
      products: [
        {
          id: 13,
          name: "Galaxy S24 Ultra",
          price: 129999,
          image: "/13.jpg",
          category: "Galaxy S Series",
        },
        {
          id: 14,
          name: "Galaxy Tab S9",
          price: 79999,
          image: "/14.jpg",
          category: "Tablets",
        },
        {
          id: 15,
          name: "Galaxy Watch 6",
          price: 34999,
          image: "/15.jpg",
          category: "Wearables",
        },
        {
          id: 16,
          name: "Galaxy Buds 2 Pro",
          price: 15999,
          image: "/16.jpg",
          category: "Audio",
        },
      ],
    },
    {
      id: 4,
      name: "Sony",
      tagline: "Premium audio & entertainment",
      brandColor: "#ff9800",
      products: [
        {
          id: 17,
          name: "WH-1000XM5",
          price: 29999,
          image: "/17.jpg",
          category: "Headphones",
        },
        {
          id: 18,
          name: "SRS-XB43 Speaker",
          price: 19999,
          image: "/18.jpg",
          category: "Speakers",
        },
        {
          id: 19,
          name: "PlayStation 5",
          price: 49999,
          image: "/19.jpg",
          category: "Gaming",
        },
        {
          id: 20,
          name: "WF-1000XM5",
          price: 24999,
          image: "/20.jpg",
          category: "Earbuds",
        },
      ],
    },
  ];

  // Component to render each brand section (WITHOUT category tabs)
  const BrandSection = ({ brand }: { brand: (typeof brandSections)[0] }) => (
    <section
      className="brand-section"
      style={{
        background: `linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)`,
      }}
    >
      <div className="brand-container">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-info">
            <h2
              className="brand-name"
              style={{
                background: `linear-gradient(135deg, ${brand.brandColor}, ${brand.brandColor}dd)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {brand.name} now on Skull Cart
            </h2>
            <p className="brand-tagline">{brand.tagline}</p>
          </div>
          <button
            className="shop-all-btn"
            onClick={() => navigate(`/shop?brand=${brand.name}`)}
          >
            Shop all {brand.name} →
          </button>
        </div>

        {/* Category Tabs - REMOVED */}

        {/* Products Grid */}
        <div className="brand-products">
          {brand.products.map((product) => (
            <div key={product.id} className="brand-product-card">
              <div className="product-image-wrapper">
                <img src={product.image} alt={product.name} />
                <div className="product-overlay">
                  <button
                    className="quick-add-btn"
                    onClick={() =>
                      handleAddToCart(product.id, product.name, product.price)
                    }
                  >
                    Quick Add
                  </button>
                </div>
              </div>
              <h4>{product.name}</h4>
              <p className="product-price">₹{product.price.toLocaleString()}</p>
              <p className="product-category">{product.category}</p>
            </div>
          ))}
        </div>

        {/* See All Link */}
        <div className="see-all-container">
          <button
            className="see-all-link"
            onClick={() => navigate(`/shop?brand=${brand.name}`)}
          >
            See all →
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO with background video carousel */}
      <section className="hero hero-with-video">
        <VideoCarousel />

        <div className="hero-left">
          <h1>Smart Tech. Smart Prices.</h1>
          <p>Upgrade your Life with Affordable Gadgets</p>

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

      {/* Render All Brand Sections */}
      {brandSections.map((brand) => (
        <BrandSection key={brand.id} brand={brand} />
      ))}

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
