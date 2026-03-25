import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./shop.css";
import { getCart, addToCart as addItemToCart, CartItem } from "../cart";
import Navbar from "../components/Navbar";
import ProductDetails from "./ProductsDetails";
import { Product } from "../types";

const productList: Product[] = [
  {
    id: 1,
    title: "Wireless Earbuds",
    price: 129,
    originalPrice: 249,
    image: "/2.jpg",
    images: ["1.jpg", "2.jpg", "4.jpg"],
    description:
      "High quality wireless earbuds with noise cancellation and fast charging.",
    category: "Accessories",
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
      "Experience true wireless freedom with premium sound quality and active noise cancellation for immersive audio.",
  },
  {
    id: 2,
    title: "Smart Sensor Light Pro",
    price: 199,
    originalPrice: 399,
    image: "/1.jpg",
    images: ["/watch/1.jpg", "/watch/2.jpg", "/watch/3.jpg"],
    description:
      "Advanced smartwatch with health tracking, GPS, and 7-day battery life.",
    category: "Wearables",
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
    title: "Gaming Laptop",
    price: 1299,
    originalPrice: 2499,
    image: "4.jpg",
    images: ["/laptop/1.jpg", "/laptop/2.jpg", "/laptop/3.jpg"],
    description:
      "Powerful gaming laptop with RTX graphics, 16GB RAM and high refresh display.",
    category: "Laptops",
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

// Add more products with various prices for better filtering demo
const additionalProducts: Product[] = [
  {
    id: 4,
    title: "Premium Wireless Headphones",
    price: 24999,
    originalPrice: 49999,
    image: "/headphones.jpg",
    images: [],
    description: "High-end wireless headphones with noise cancellation",
    category: "Accessories",
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
    title: "Smart Fitness Band",
    price: 3999,
    originalPrice: 7999,
    image: "/fitness.jpg",
    images: [],
    description: "Track your fitness goals with this smart band",
    category: "Wearables",
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
    title: "Ultrabook Laptop",
    price: 84999,
    originalPrice: 119999,
    image: "/ultrabook.jpg",
    images: [],
    description: "Lightweight ultrabook for professionals",
    category: "Laptops",
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

// Price range options
const PRICE_RANGES = [
  { label: "Up to ₹15,000", min: 0, max: 15000 },
  { label: "₹15,000 - ₹27,000", min: 15000, max: 27000 },
  { label: "₹27,000 - ₹42,500", min: 27000, max: 42500 },
  { label: "Over ₹42,500", min: 42500, max: Infinity },
];

export default function Shop() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    null
  );

  const addToCart = (product: Product) => {
    addItemToCart(product);
    setCart(getCart());
    alert(`${product.title} added to cart!`);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (product: Product) => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
    }
    return 0;
  };

  // Get price range for a product
  const getPriceRange = (price: number): string => {
    if (price <= 15000) return "Up to ₹15,000";
    if (price <= 27000) return "₹15,000 - ₹27,000";
    if (price <= 42500) return "₹27,000 - ₹42,500";
    return "Over ₹42,500";
  };

  const filteredProducts = allProducts.filter((p) => {
    const matchCategory = category === "All" || p.category === category;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchPriceRange = selectedPriceRange
      ? getPriceRange(p.price) === selectedPriceRange
      : true;
    return matchCategory && matchSearch && matchPriceRange;
  });

  // Get price range statistics
  const getPriceRangeCount = (rangeLabel: string) => {
    return allProducts.filter((p) => getPriceRange(p.price) === rangeLabel)
      .length;
  };

  return (
    <div className="shop-page">
      <Navbar />

      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-to-home-btn" onClick={() => navigate("/")}>
          ← Home
        </button>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="shop-main-layout">
        {/* Left Sidebar - Filters */}
        <aside className="shop-sidebar">
          {/* Search Bar */}
          <div className="sidebar-search">
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
          <div className="sidebar-section">
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

          {/* Price Filter Section - Now on Left Side */}
          <div className="sidebar-section">
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
        </aside>

        {/* Right Content - Products Grid */}
        <main className="shop-main-content">
          {/* Products Grid */}
          <div className="products">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const discountPercent = getDiscountPercentage(p);

                return (
                  <div
                    className="product-card"
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                  >
                    {/* Image Container with Badges */}
                    <div className="product-image-container">
                      <img src={p.image} alt={p.title} />

                      {/* Sale Badge */}
                      {p.sale && <div className="sale-badge">SALE</div>}

                      {/* Limited Time Offer Badge */}
                      {p.limitedTimeOffer && (
                        <div className="limited-offer-badge">
                          ⏰ LIMITED TIME OFFER
                        </div>
                      )}
                    </div>

                    <h3>{p.title}</h3>

                    {/* Price Section */}
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
              <p className="no-products">No products found</p>
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
    </div>
  );
}
