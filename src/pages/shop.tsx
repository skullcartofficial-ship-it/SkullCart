import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./shop.css";
import { getCart, addToCart as addItemToCart, CartItem } from "../cart";
import Navbar from "../components/Navbar";
import ProductDetails from "./ProductsDetails";
import { Product } from "../types";

// ─── Scroll Animation Hook ────────────────────────────────────────────────────

const useShopScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("shop-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe all animatable elements
    const elements = document.querySelectorAll(
      ".shop-fade-in, .shop-slide-left, .shop-slide-right, .shop-card-animate"
    );
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  });
};

// ─── Static Data ──────────────────────────────────────────────────────────────

const productList: Product[] = [
  {
    id: 1,
    title: "Armor Version.H1 Wired Headphones",
    price: 4999,
    originalPrice: 249,
    image: "/headphone.jpg",
    images: ["1.jpg", "2.jpg", "4.jpg"],
    description:
      "High quality wireless earbuds with noise cancellation and fast charging.",
    category: "Wearables",
    rating: 4.5,
    sale: false,
    limitedTimeOffer: true,
    features: {
      subtitle: "True wireless freedom with premium audio experience",
      items: [
        {
          icon: "🎧",
          title: "Active Noise Cancellation",
          description: "Block out ambient noise for immersive audio",
        },
        {
          icon: "🔋",
          title: "30 Hours Playback",
          description: "Long-lasting battery with charging case",
        },
        {
          icon: "🎵",
          title: "Hi-Fi Audio",
          description: "Rich bass and crystal clear treble",
        },
        {
          icon: "📞",
          title: "Clear Calls",
          description: "Dual microphone with noise reduction",
        },
        {
          icon: "⚡",
          title: "Quick Charge",
          description: "10 min charge = 2 hours playback",
        },
        {
          icon: "💧",
          title: "Sweat Resistant",
          description: "IPX4 rated for workouts",
        },
      ],
    },
    specifications: [
      { label: "Driver Size", value: "10mm Dynamic Driver" },
      { label: "Bluetooth", value: "5.2 with aptX Support" },
      { label: "Battery Life", value: "8 hours (earbuds), 30 hours (case)" },
      { label: "Charging", value: "USB-C Fast Charging" },
      { label: "Water Resistance", value: "IPX4" },
      { label: "Weight", value: "4.5g per earbud" },
      { label: "Warranty", value: "1 Year Warranty" },
    ],
    whatsInBox: [
      "Wireless Earbuds (Left & Right)",
      "Charging Case",
      "USB-C Charging Cable",
      "Silicone Ear Tips (S/M/L)",
      "User Manual",
      "Warranty Card",
    ],
    lightDescription:
      "Experience true wireless freedom with premium sound quality and active noise cancellation.",
  },
  {
    id: 2,
    title: "Apple 2026 MacBook Neo 13″ Laptop",
    price: 66900,
    originalPrice: 399,
    image: "/11.jpg",
    images: ["/watch/1.jpg", "/watch/2.jpg", "/watch/3.jpg"],
    description:
      "The MacBook Neo (2026) is Apple’s new budget MacBook, designed mainly for students and everyday users—not heavy creators.",
    category: "Laptop",
    rating: 4.2,
    sale: true,
    limitedTimeOffer: false,
    features: {
      subtitle:
        "Can be hung / can be pasted / can be placed / can be hand-held",
      items: [
        {
          icon: "🔋",
          title: "Long Battery Life",
          description: "Up to 7 days on a single charge",
        },
        {
          icon: "💧",
          title: "Water Resistant",
          description: "IP68 rated - Perfect for daily use",
        },
        {
          icon: "📱",
          title: "Smart Connectivity",
          description: "Bluetooth 5.0 & App Integration",
        },
        {
          icon: "⚡",
          title: "Fast Charging",
          description: "80% charge in just 30 minutes",
        },
        {
          icon: "🎵",
          title: "Built-in Speaker",
          description: "Crystal clear audio quality",
        },
        {
          icon: "📊",
          title: "Health Tracking",
          description: "Heart rate, steps, sleep monitoring",
        },
      ],
    },
    specifications: [
      { label: "Model", value: "Smart Sensor Light Pro" },
      { label: "Material", value: "Premium ABS + Silicone" },
      { label: "Weight", value: "150 grams" },
      { label: "Color", value: "Black / White / Blue" },
      { label: "Display", value: "1.3 inch AMOLED" },
      { label: "Battery", value: "400 mAh" },
      { label: "Compatibility", value: "iOS & Android" },
      { label: "Warranty", value: "1 Year Manufacturer Warranty" },
    ],
    whatsInBox: [
      "Smart Sensor Light Device",
      "Magnetic Charging Cable (Type-C)",
      "User Manual",
      "Warranty Card",
      "Free Protective Case",
      "Screen Protector",
    ],
    lightDescription:
      "Advanced smartwatch with health tracking, GPS, and 7-day battery life.",
  },
  {
    id: 3,
    title: "Elgato Stream Deck Mk.2",
    price: 18129,
    originalPrice: 2499,
    image: "10.jpg",
    images: ["/laptop/1.jpg", "/laptop/2.jpg", "/laptop/3.jpg"],
    description:
      "The Elgato Stream Deck Mk.2 is one of the most popular tools for streamers, YouTubers, and productivity users. Think of it as a shortcut control panel for your PC.",
    category: "Accessories",
    rating: 4.8,
    sale: false,
    limitedTimeOffer: true,
    features: {
      subtitle: "Ultimate gaming performance with cutting-edge technology",
      items: [
        {
          icon: "🎮",
          title: "RTX Graphics",
          description: "NVIDIA GeForce RTX 4060 for smooth gameplay",
        },
        {
          icon: "💨",
          title: "High Refresh Rate",
          description: "144Hz display for fluid motion",
        },
        {
          icon: "🔥",
          title: "Advanced Cooling",
          description: "Dual fans with liquid metal thermal compound",
        },
        {
          icon: "⚡",
          title: "Fast Performance",
          description: "Intel Core i7 with 16GB DDR5 RAM",
        },
        {
          icon: "💾",
          title: "Ample Storage",
          description: "1TB NVMe SSD for quick loading",
        },
        {
          icon: "🔋",
          title: "Long Battery",
          description: "6-8 hours gaming battery life",
        },
      ],
    },
    specifications: [
      { label: "Processor", value: "Intel Core i7-13700H" },
      { label: "Graphics", value: "NVIDIA RTX 4060 8GB" },
      { label: "RAM", value: "16GB DDR5 (Upgradeable to 32GB)" },
      { label: "Storage", value: "1TB NVMe SSD" },
      { label: "Display", value: '15.6" FHD 144Hz IPS' },
      { label: "Keyboard", value: "RGB Backlit with Number Pad" },
      { label: "Weight", value: "2.3 kg" },
      { label: "Warranty", value: "2 Year Warranty" },
    ],
    whatsInBox: [
      "Gaming Laptop",
      "230W Power Adapter",
      "User Manual",
      "Warranty Card",
      "Gaming Mouse",
      "Laptop Bag",
    ],
    lightDescription:
      "Experience next-level gaming with RTX graphics, high refresh rate display, and powerful cooling system.",
  },
];

const additionalProducts: Product[] = [
  {
    id: 4,
    title: "Apple 2026 MacBook Pro",
    price: 499900,
    originalPrice: 49999,
    image: "/laptop.png",
    images: [],
    description:
      "The 2026 MacBook Pro is Apple’s most powerful laptop yet, built for professionals, developers, video editors, and heavy users.",
    rating: 4.7,
    sale: true,
    limitedTimeOffer: false,
    features: { subtitle: "", items: [] },
    specifications: [],
    whatsInBox: [],
    lightDescription: "",
  },
  {
    id: 5,
    title: "Samsung Galaxy Book 4",
    price: 57790,
    originalPrice: 7999,
    image: "/samsunglaptop.png",
    images: [],
    description:
      "The Samsung Galaxy Book 4 is a budget-to-midrange laptop designed for students, office work, and everyday use—similar to MacBook Neo but on Windows.",
    category: "Laptop",
    rating: 4.3,
    sale: true,
    limitedTimeOffer: false,
    features: { subtitle: "", items: [] },
    specifications: [],
    whatsInBox: [],
    lightDescription: "",
  },
  {
    id: 6,
    title: "Boat Wired Headphone",
    price: 3999,
    originalPrice: 119999,
    image: "/boatheadphone.png",
    images: [],
    description: "Lightweight ultrabook for professionals",
    category: "Wearables",
    rating: 4.6,
    sale: false,
    limitedTimeOffer: true,
    features: { subtitle: "", items: [] },
    specifications: [],
    whatsInBox: [],
    lightDescription: "",
  },
];

const allProducts = [...productList, ...additionalProducts];

const PRICE_RANGES = [
  { label: "Up to ₹15,000", min: 0, max: 15000 },
  { label: "₹15,000 - ₹27,000", min: 15000, max: 27000 },
  { label: "₹27,000 - ₹42,500", min: 27000, max: 42500 },
  { label: "Over ₹42,500", min: 42500, max: Infinity },
];

type SortOption =
  | "price-low-high"
  | "price-high-low"
  | "newest-arrivals"
  | "best-sellers"
  | "limited-time-deals"
  | "offers";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "newest-arrivals", label: "Newest Arrivals" },
  { value: "best-sellers", label: "Best Sellers" },
  { value: "limited-time-deals", label: "Limited Time Deals" },
  { value: "offers", label: "Offers" },
];

function getDiscountPercentage(product: Product): number {
  if (product.originalPrice && product.originalPrice > product.price) {
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  }
  return 0;
}

function getPriceRange(price: number): string {
  if (price <= 15000) return "Up to ₹15,000";
  if (price <= 27000) return "₹15,000 - ₹27,000";
  if (price <= 42500) return "₹27,000 - ₹42,500";
  return "Over ₹42,500";
}

function getPriceRangeCount(rangeLabel: string): number {
  return allProducts.filter((p) => getPriceRange(p.price) === rangeLabel)
    .length;
}

function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case "price-low-high":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high-low":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest-arrivals":
      return sorted.sort((a, b) => Number(b.id) - Number(a.id));
    case "best-sellers":
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "limited-time-deals":
      return sorted.sort((a, b) => {
        if (a.limitedTimeOffer && !b.limitedTimeOffer) return -1;
        if (!a.limitedTimeOffer && b.limitedTimeOffer) return 1;
        return 0;
      });
    case "offers":
      return sorted.sort(
        (a, b) => getDiscountPercentage(b) - getDiscountPercentage(a)
      );
    default:
      return sorted;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Shop() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<SortOption>("price-low-high");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Run scroll animation observer after every render so new cards get observed
  useShopScrollAnimation();

  const addToCart = useCallback((product: Product) => {
    addItemToCart(product);
    setCart(getCart());
    alert(`${product.title} added to cart!`);
  }, []);

  const filteredProducts = allProducts.filter((p) => {
    const matchCategory = category === "All" || p.category === category;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchPriceRange = selectedPriceRange
      ? getPriceRange(p.price) === selectedPriceRange
      : true;
    return matchCategory && matchSearch && matchPriceRange;
  });

  const sortedAndFilteredProducts = sortProducts(filteredProducts, sortBy);

  return (
    <div className="shop-page">
      <Navbar />

      {/* Back button animates in from left */}
      <div className="back-button-container shop-slide-left">
        <button className="back-to-home-btn" onClick={() => navigate("/")}>
          ← Home
        </button>
      </div>

      <div className="shop-main-layout">
        {/* Sidebar slides in from left */}
        <aside className="shop-sidebar shop-slide-left">
          {/* Search */}
          <div className="sidebar-search shop-fade-in">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sidebar-search-input"
            />
            {search && (
              <button
                className="clear-search-sidebar"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories */}
          <div
            className="sidebar-section shop-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <h3>Categories</h3>
            <div className="categories-list">
              {["All", "Laptops", "Wearables", "Accessories"].map((c) => (
                <button
                  key={c}
                  className={`category-btn ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div
            className="sidebar-section shop-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="price-filter-header">
              <h3>Price</h3>
              {selectedPriceRange && (
                <button
                  className="clear-filter-btn"
                  onClick={() => setSelectedPriceRange(null)}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="price-ranges">
              {PRICE_RANGES.map((range) => {
                const count = getPriceRangeCount(range.label);
                const isActive = selectedPriceRange === range.label;
                return (
                  <button
                    key={range.label}
                    className={`price-range-btn ${isActive ? "active" : ""}`}
                    onClick={() =>
                      setSelectedPriceRange(isActive ? null : range.label)
                    }
                  >
                    <span className="range-label">{range.label}</span>
                    <span className="range-count">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div
            className="sidebar-section sort-by-section shop-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div
              className="sort-by-header clickable"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            >
              <h3>SORT BY</h3>
              <span
                className={`dropdown-arrow ${isSortDropdownOpen ? "open" : ""}`}
              >
                ▼
              </span>
            </div>
            <div
              className={`sort-dropdown-container ${
                isSortDropdownOpen ? "open" : ""
              }`}
            >
              <div className="sort-options-list">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`sort-option-item ${
                      sortBy === option.value ? "active" : ""
                    }`}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    <span className="sort-option-label">{option.label}</span>
                    {sortBy === option.value && (
                      <span className="active-indicator">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="sort-results-info">
                <span className="sort-results-count">
                  {sortedAndFilteredProducts.length}
                </span>
                <span className="sort-results-text">product(s) found</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="shop-main-content">
          <div className="products">
            {sortedAndFilteredProducts.length > 0 ? (
              sortedAndFilteredProducts.map((p, index) => {
                const discountPercent = getDiscountPercentage(p);
                return (
                  <div
                    className="product-card shop-card-animate"
                    key={p.id}
                    style={{ animationDelay: `${(index % 4) * 0.08}s` }}
                    onClick={() => setSelectedProduct(p)}
                  >
                    <div className="product-image-container">
                      <img src={p.image} alt={p.title} />
                      {p.sale && <div className="sale-badge">SALE</div>}
                      {p.limitedTimeOffer && (
                        <div className="limited-offer-badge">
                          ⏰ LIMITED TIME OFFER
                        </div>
                      )}
                    </div>

                    <h3>{p.title}</h3>

                    <div className="price-section">
                      {p.originalPrice && p.originalPrice > p.price ? (
                        <>
                          <span className="current-price">₹{p.price}</span>
                          <span className="original-price">
                            ₹{p.originalPrice}
                          </span>
                          {discountPercent > 0 && (
                            <span className="discount-percent">
                              ({discountPercent}% OFF)
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="current-price">₹{p.price}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="no-products shop-fade-in">No products found</p>
            )}
          </div>
        </main>
      </div>

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          addToCart={addToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ── Animation styles injected here so no extra CSS file needed ── */}
      <style>{`
        /* ── Base states (hidden before scroll triggers) ── */
        .shop-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s ease-out, transform 0.55s ease-out;
        }
        .shop-slide-left {
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 0.55s ease-out, transform 0.55s ease-out;
        }
        .shop-slide-right {
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.55s ease-out, transform 0.55s ease-out;
        }
        .shop-card-animate {
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }

        /* ── Visible state (added by IntersectionObserver) ── */
        .shop-fade-in.shop-visible,
        .shop-slide-left.shop-visible,
        .shop-slide-right.shop-visible {
          opacity: 1;
          transform: translate(0, 0);
        }
        .shop-card-animate.shop-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* ── Staggered delays for sidebar sections ── */
        .shop-fade-in:nth-child(1) { transition-delay: 0s; }
        .shop-fade-in:nth-child(2) { transition-delay: 0.08s; }
        .shop-fade-in:nth-child(3) { transition-delay: 0.16s; }
        .shop-fade-in:nth-child(4) { transition-delay: 0.24s; }

        /* ── Hover lift on product cards ── */
        .product-card {
          transition:
            transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.5s ease-out !important;
        }
        .product-card:hover {
          transform: translateY(-8px) scale(1.02) !important;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.14) !important;
        }

        /* ── Smooth image zoom on card hover ── */
        .product-image-container {
          overflow: hidden;
        }
        .product-image-container img {
          transition: transform 0.5s ease;
        }
        .product-card:hover .product-image-container img {
          transform: scale(1.07);
        }

        /* ── Category + price buttons pulse on click ── */
        .category-btn,
        .price-range-btn {
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .category-btn:active,
        .price-range-btn:active {
          transform: scale(0.95);
        }

        /* ── Add to Cart button animation ── */
        .product-card button {
          transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .product-card button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .product-card button:active {
          transform: scale(0.96);
        }

        /* ── Sidebar slide-in gets a slight delay so it feels staged ── */
        .shop-sidebar.shop-slide-left {
          transition-delay: 0.05s;
        }
        .back-button-container.shop-slide-left {
          transition-delay: 0s;
        }
      `}</style>
    </div>
  );
}
