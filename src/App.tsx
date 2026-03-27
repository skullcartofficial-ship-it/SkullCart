import { useEffect, useState } from "react";
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

const useScrollAnimation = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -30px 0px",
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, 100);
        }
      });
    }, observerOptions);
    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach((el) => observer.observe(el));
    return () => {
      fadeElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
};

function Home() {
  const navigate = useNavigate();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  useScrollAnimation();

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

  const brandSections = [
    {
      id: 1,
      name: "Armor Space",
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

  const BrandSection = ({ brand }: { brand: (typeof brandSections)[0] }) => (
    <section
      className="brand-section fade-in"
      style={{
        background: `linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)`,
        width: "100%",
        margin: 0,
        padding: "60px 0",
        opacity: 0,
        transform: "translateY(30px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      <div style={{ width: "100%", padding: "0 5%", boxSizing: "border-box" }}>
        {/* Brand Header */}
        <div className="brand-header-row" style={{ marginBottom: "32px" }}>
          <div>
            <h2
              style={{
                fontSize: "clamp(20px, 5vw, 28px)",
                fontWeight: "bold",
                margin: "0 0 8px 0",
                background: `linear-gradient(135deg, ${brand.brandColor}, ${brand.brandColor}dd)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {brand.name} now on ArmorX
            </h2>
            <p style={{ fontSize: "15px", color: "#666", margin: 0 }}>
              {brand.tagline}
            </p>
          </div>
          <button
            onClick={() => navigate(`/shop?brand=${brand.name}`)}
            className="brand-shop-btn"
            style={{
              padding: "10px 20px",
              backgroundColor: brand.brandColor,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            Shop all {brand.name} →
          </button>
        </div>

        {/* Product Grid */}
        <div className="product-grid" style={{ marginBottom: "32px" }}>
          {brand.products.map((product, productIndex) => (
            <div
              key={product.id}
              className="product-card-hover"
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                opacity: 0,
                transform: "translateY(20px)",
                animation: `fadeInUp 0.5s ease-out ${
                  productIndex * 0.1
                }s forwards`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  paddingTop: "100%",
                  overflow: "hidden",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                />
                <div
                  className="product-hover-overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0";
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id, product.name, product.price);
                    }}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: brand.brandColor,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
              <div style={{ padding: "12px" }}>
                <h4
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    lineHeight: "1.3",
                  }}
                >
                  {product.name}
                </h4>
                <p
                  style={{
                    margin: "0 0 3px 0",
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#ff4757",
                  }}
                >
                  ₹{product.price.toLocaleString()}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#999" }}>
                  {product.category}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate(`/shop?brand=${brand.name}`)}
            style={{
              background: "none",
              border: "none",
              color: brand.brandColor,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              padding: "8px 16px",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            See all →
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div
      style={{
        width: "100%",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <Navbar />

      {/* HERO */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: "500px",
          maxHeight: "800px",
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <VideoCarousel />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
            padding: "0 5%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ flex: 1, animation: "fadeInLeft 1s ease-out" }}>
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 56px)",
                fontWeight: "bold",
                margin: "0 0 16px 0",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Smart Tech.
              <br />
              Smart Prices.
            </h1>
            <p
              style={{
                fontSize: "clamp(13px, 2vw, 18px)",
                color: "rgba(255,255,255,0.95)",
                margin: "0 0 32px 0",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              Upgrade your Life with Affordable Gadgets
            </p>
            <button
              onClick={() => navigate("/shop")}
              style={{
                padding: "12px 32px",
                backgroundColor: "white",
                color: "#667eea",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              Shop Now
            </button>
          </div>
          <div className="hero-image-wrapper">
            <img
              src="/orangecatfinals.png"
              alt="Skull Cart"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "380px",
                animation: "float 3s ease-in-out infinite",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Brand Sections */}
      {brandSections.map((brand) => (
        <BrandSection key={brand.id} brand={brand} />
      ))}

      {/* FEATURES */}
      <section
        className="fade-in"
        style={{
          width: "100%",
          margin: 0,
          padding: "60px 5%",
          backgroundColor: "#f8f9fa",
          boxSizing: "border-box",
          opacity: 0,
          transform: "translateY(30px)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        <div className="features-grid">
          {[
            { icon: "🚚", text: "Cash on Delivery", delay: 0 },
            { icon: "🔄", text: "Easy Returns", delay: 0.1 },
            { icon: "🚀", text: "Fast Shipping", delay: 0.2 },
            { icon: "🔒", text: "Secure Payments", delay: 0.3 },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                padding: "20px 12px",
                fontSize: "14px",
                fontWeight: "500",
                background: "white",
                borderRadius: "12px",
                textAlign: "center",
                transition: "all 0.3s ease",
                opacity: 0,
                transform: "translateY(20px)",
                animation: `fadeInUp 0.5s ease-out ${feature.delay}s forwards`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                {feature.icon}
              </span>
              {feature.text}
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section
        className="fade-in"
        style={{
          padding: "60px 5%",
          boxSizing: "border-box",
          width: "100%",
          opacity: 0,
          transform: "translateY(30px)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        <h2 className="section-title">Best Sellers</h2>
        <div className="product-grid" style={{ marginBottom: "60px" }}>
          {[
            {
              id: 1,
              name: "Smart LED Sensor Light",
              price: 649,
              img: "/1.jpg",
            },
            { id: 2, name: "3-in-1 Fast Charging", price: 449, img: "/2.jpg" },
            {
              id: 3,
              name: "Mini Bluetooth Speaker",
              price: 899,
              img: "/3.jpg",
            },
            { id: 4, name: "Laptop Cooling Pad", price: 999, img: "/4.jpg" },
          ].map((product, idx) => (
            <div
              key={product.id}
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                opacity: 0,
                transform: "translateY(20px)",
                animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s forwards`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  backgroundColor: "#ff4757",
                  color: "white",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "500",
                  zIndex: 1,
                }}
              >
                Trending
              </span>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                  src={product.img}
                  alt="product"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0";
                  }}
                >
                  <button
                    onClick={() =>
                      handleAddToCart(product.id, product.name, product.price)
                    }
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#667eea",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
              <div style={{ padding: "12px" }}>
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "14px",
                    lineHeight: "1.3",
                  }}
                >
                  {product.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#ff4757",
                  }}
                >
                  ₹{product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* WHY ARMORX */}
        <h2 className="section-title">Why ArmorX?</h2>
        <div className="why-grid" style={{ marginBottom: "60px" }}>
          {[
            {
              icon: "₹",
              title: "Affordable Prices",
              desc: "Budget-friendly tech for everyone",
            },
            {
              icon: "✔",
              title: "Quality Checked",
              desc: "Tested & trusted products",
            },
            {
              icon: "🎧",
              title: "24/7 Support",
              desc: "Always here to help you",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                textAlign: "center",
                padding: "32px 24px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: 0,
                transform: "translateY(20px)",
                animation: `fadeInUp 0.5s ease-out ${
                  idx * 0.15 + 0.3
                }s forwards`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                {feature.icon}
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "20px" }}>
                {feature.title}
              </h3>
              <p style={{ margin: 0, color: "#666" }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* REVIEWS */}
        <h2 className="section-title">Customer Reviews</h2>
        <div className="reviews-grid">
          {[
            {
              name: "Priya Sharma",
              review:
                "The sensor light is perfect for our hallway. Great quality and price.",
              stars: 5,
            },
            {
              name: "Ravi Kumar",
              review:
                "Loved the charging cable combo! Very useful and affordable.",
              stars: 5,
            },
          ].map((review, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: 0,
                transform: "translateY(20px)",
                animation: `fadeInUp 0.5s ease-out ${
                  idx * 0.2 + 0.5
                }s forwards`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <img
                  src="/skullcart.jpg"
                  alt={review.name}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
                    {review.name}
                  </h4>
                  <div style={{ color: "#ffc107" }}>
                    {"⭐".repeat(review.stars)}
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, color: "#666", lineHeight: "1.6" }}>
                "{review.review}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="fade-in"
        style={{
          width: "100%",
          margin: 0,
          backgroundColor: "#1a1a2e",
          color: "white",
          opacity: 0,
          transform: "translateY(30px)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        <div className="footer-grid">
          <div>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
              About ArmorX
            </h3>
            <p style={{ margin: 0, lineHeight: "1.6", color: "#ccc" }}>
              Smart tech at smart prices. Innovative, affordable gadgets for
              everyday life.
            </p>
          </div>
          <div>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
              CEO & Founder
            </h3>
            <p style={{ margin: "0 0 4px 0" }}>Manohar Reddy.G</p>
            <p style={{ margin: 0, color: "#ccc" }}>
              Tech enthusiast & innovator
            </p>
          </div>
          <div>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
              Social Media
            </h3>
            <a
              href="https://instagram.com/skullcartofficial"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#ccc",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#e4405f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#ccc";
              }}
            >
              📷 @skullcartofficial
            </a>
          </div>
        </div>
        <div
          style={{
            padding: "20px 5%",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <p style={{ margin: 0, color: "#ccc" }}>
            &copy; {new Date().getFullYear()} ArmorX. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        /* ── Animations ── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-20px); }
        }

        html { scroll-behavior: smooth; }

        .fade-in { transition: opacity 0.6s ease-out, transform 0.6s ease-out !important; }
        .fade-in.visible { opacity: 1 !important; transform: translateY(0) !important; }

        /* ── Section title ── */
        .section-title {
          font-size: clamp(22px, 5vw, 32px);
          font-weight: bold;
          text-align: center;
          margin: 0 0 40px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Desktop grids ── */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          padding: 60px 5%;
          box-sizing: border-box;
        }

        /* ── Brand header ── */
        .brand-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        /* ── Hero cat image ── */
        .hero-image-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          animation: fadeInRight 1s ease-out;
        }

        /* ── Product card hover ── */
        .product-card-hover:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
        }

        /* ════════════════════════
           MOBILE  ≤ 600px
        ════════════════════════ */
        @media (max-width: 600px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .why-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .reviews-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 40px 5%;
          }
          .brand-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .brand-shop-btn {
            width: 100%;
            text-align: center;
          }
          /* Hide cat on small screens so text has full width */
          .hero-image-wrapper {
            display: none;
          }
        }

        /* ════════════════════════
           TABLET  601px – 900px
        ════════════════════════ */
        @media (min-width: 601px) and (max-width: 900px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .why-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .reviews-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          .brand-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .brand-shop-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
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
