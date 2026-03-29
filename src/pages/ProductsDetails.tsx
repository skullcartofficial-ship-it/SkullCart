import React, { useState, useEffect, useCallback } from "react";
import "./ProductsDetails.css";
import { Product } from "../types";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductDetailsProps = {
  product: Product | null;
  addToCart: (product: Product) => void;
  onClose: () => void;
};

type Offer = {
  pack: number;
  price: number;
  originalPrice: number;
  savePercent: number;
  label: string;
  badge?: string;
};

type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: any;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultFeatures = {
  subtitle:
    "Built for every lifestyle — hang it, paste it, place it, or hold it.",
  items: [
    {
      icon: "🔋",
      title: "Long Battery Life",
      description: "Up to 7 days on a single charge",
    },
    {
      icon: "💧",
      title: "Water Resistant",
      description: "IP68 rated — perfect for daily use",
    },
    {
      icon: "📱",
      title: "Smart Connectivity",
      description: "Bluetooth 5.0 & app integration",
    },
    {
      icon: "⚡",
      title: "Fast Charging",
      description: "80% charge in just 30 minutes",
    },
    {
      icon: "🎵",
      title: "Built-in Speaker",
      description: "Crystal-clear audio quality",
    },
    {
      icon: "📊",
      title: "Health Tracking",
      description: "Heart rate, steps, sleep monitoring",
    },
  ],
};

const defaultSpecifications = [
  { label: "Model", value: "Smart Sensor Light Pro" },
  { label: "Material", value: "Premium ABS + Silicone" },
  { label: "Weight", value: "150 grams" },
  { label: "Color", value: "Black / White / Blue" },
  { label: "Compatibility", value: "iOS & Android" },
  { label: "Warranty", value: "1 Year Manufacturer Warranty" },
];

const defaultWhatsInBox = [
  "Main Device",
  "Charging Cable (Type-C)",
  "User Manual",
  "Warranty Card",
  "Free Protective Case",
];

const defaultLightDescription =
  "Advanced smartwatch with health tracking, GPS, and 7-day battery life.";

// ─── Star Display ─────────────────────────────────────────────────────────────

const StarDisplay = ({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) => {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div className={`spd-stars spd-stars--${size}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="spd-star-wrap">
          <span className="spd-star-bg">★</span>
          <span
            className="spd-star-fg"
            style={{
              width:
                s <= full
                  ? "100%"
                  : s === full + 1
                  ? `${partial * 100}%`
                  : "0%",
            }}
          >
            ★
          </span>
        </span>
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  addToCart,
  onClose,
}) => {
  const navigate = useNavigate();

  // ── Derived base price (safe before null check) ───────────────────────────
  const basePrice = product?.price ?? 0;

  const buildOffers = (bp: number): Offer[] => [
    {
      pack: 1,
      price: bp,
      originalPrice: bp,
      savePercent: 0,
      label: "Pack of 1",
    },
    {
      pack: 2,
      price: bp * 2 * 0.9,
      originalPrice: bp * 2,
      savePercent: 10,
      label: "Pack of 2",
      badge: "MOST POPULAR",
    },
    {
      pack: 3,
      price: bp * 3 * 0.8,
      originalPrice: bp * 3,
      savePercent: 20,
      label: "Pack of 3",
      badge: "BEST DEAL",
    },
  ];

  // ── All hooks — BEFORE early return ──────────────────────────────────────
  const [mainImage, setMainImage] = useState<string>(product?.image ?? "");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer>(
    buildOffers(basePrice)[0]
  );
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "inbox">(
    "features"
  );
  const [toastMsg, setToastMsg] = useState<string>("");

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      setMainImage(product.image);
      setSelectedOffer(buildOffers(product.price)[0]);
      setActiveTab("features");
    }
  }, [product?.id]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Close review context menu on outside click
  useEffect(() => {
    const h = () => setActiveMenu(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  };

  const fetchReviews = useCallback(async () => {
    if (!product) return;
    try {
      const q = query(
        collection(db, "reviews"),
        where("productId", "==", String(product.id))
      );
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Early return — AFTER all hooks ───────────────────────────────────────
  if (!product) return null;

  // ── Derived data ─────────────────────────────────────────────────────────
  const productFeatures = product.features || defaultFeatures;
  const productSpecifications = product.specifications || defaultSpecifications;
  const productWhatsInBox = product.whatsInBox || defaultWhatsInBox;
  const productLightDescription =
    product.lightDescription || defaultLightDescription;

  const offers = buildOffers(product.price);

  const allImages = [
    product.image,
    ...(product.images ?? []).filter((img) => img && img !== product.image),
  ].filter(Boolean);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: selectedOffer.price,
      originalPrice: selectedOffer.originalPrice,
      quantity: selectedOffer.pack,
      offerLabel: selectedOffer.label,
    } as Product);
    showToast("🛒 Added to cart!");
  };

  const handleBuyNow = () => {
    const user = auth.currentUser;
    if (!user) {
      showToast("⚠️ Please login first");
      return;
    }

    const purchaseItem = {
      product: {
        id: product.id,
        title: product.title,
        price: selectedOffer.price,
        originalPrice: selectedOffer.originalPrice,
        image: product.image,
        description: product.description,
        quantity: selectedOffer.pack,
        offerLabel: selectedOffer.label,
      },
      quantity: selectedOffer.pack,
      totalPrice: selectedOffer.price,
    };

    localStorage.setItem("purchaseItem", JSON.stringify(purchaseItem));
    onClose();
    navigate("/address", {
      state: { purchaseItem, total: selectedOffer.price },
    });
  };

  const handleReviewSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      showToast("⚠️ Please login first");
      return;
    }
    if (!rating || !comment.trim()) {
      showToast("⚠️ Please provide rating and comment");
      return;
    }

    setLoading(true);
    try {
      let userName = user.displayName;
      if (!userName?.trim()) {
        const en = user.email?.split("@")[0] ?? "user";
        userName = en.charAt(0).toUpperCase() + en.slice(1);
      }
      await addDoc(collection(db, "reviews"), {
        productId: String(product.id),
        userId: user.uid,
        userName,
        userEmail: user.email,
        rating,
        comment,
        createdAt: Timestamp.now(),
      });
      setRating(0);
      setComment("");
      fetchReviews();
      showToast("✅ Review submitted!");
    } catch (err) {
      console.error("Error submitting review:", err);
      showToast("❌ Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const user = auth.currentUser;
    if (!user) {
      showToast("⚠️ Please login first");
      return;
    }
    const target = reviews.find((r) => r.id === reviewId);
    if (target && target.userId !== user.uid) {
      showToast("⚠️ You can only delete your own reviews");
      return;
    }
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      fetchReviews();
      setActiveMenu(null);
      showToast("🗑️ Review deleted");
    } catch (err) {
      console.error("Error deleting review:", err);
      showToast("❌ Failed to delete review");
    }
  };

  const formatName = (name: string) => {
    let n = name;
    if (n?.includes("@")) n = n.split("@")[0];
    if (!n || n === "null" || n === "undefined") n = "User";
    return n.charAt(0).toUpperCase() + n.slice(1);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toast */}
      {toastMsg && <div className="spd-toast">{toastMsg}</div>}

      {/* Backdrop */}
      <div className="spd-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="spd-modal">
        {/* Close */}
        <button className="spd-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Breadcrumb */}
        <nav className="spd-breadcrumb">
          <span className="spd-bc-link" onClick={onClose}>
            Shop
          </span>
          <span className="spd-bc-sep">›</span>
          <span className="spd-bc-link">{product.category}</span>
          <span className="spd-bc-sep">›</span>
          <span className="spd-bc-current">{product.title}</span>
        </nav>

        {/* ─── Responsive layout ─── */}
        <div className="spd-layout">
          {/* ══ COL 1: Images ══ */}
          <div className="spd-col-images">
            {/* Badges */}
            <div className="spd-badges">
              {product.sale && (
                <span className="spd-badge spd-badge--sale">SALE</span>
              )}
              {product.limitedTimeOffer && (
                <span className="spd-badge spd-badge--limited">
                  ⏰ LIMITED OFFER
                </span>
              )}
            </div>

            {/* Main image */}
            <div className="spd-main-img-wrap">
              <img
                className="spd-main-img"
                src={mainImage}
                alt={product.title}
              />
              <p className="spd-zoom-hint">🔍 Tap to zoom</p>
            </div>

            {/* Thumbnails — shown below image on mobile */}
            {allImages.length > 1 && (
              <div className="spd-thumbs">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    className={`spd-thumb ${
                      mainImage === src ? "spd-thumb--active" : ""
                    }`}
                    onClick={() => setMainImage(src)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt={`view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ══ COL 2: Info ══ */}
          <div className="spd-col-info">
            <span className="spd-category-pill">{product.category}</span>
            <h1 className="spd-title">{product.title}</h1>

            {/* Rating row */}
            <div className="spd-rating-row">
              <StarDisplay
                rating={averageRating || product.rating || 0}
                size="md"
              />
              <span className="spd-rating-num">
                {(averageRating || product.rating || 0).toFixed(1)}
              </span>
              {reviews.length > 0 && (
                <span className="spd-review-count">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              )}
            </div>

            {/* Light description */}
            <p className="spd-light-desc">{productLightDescription}</p>

            <div className="spd-divider" />

            {/* Price */}
            <div className="spd-price-row">
              {discount > 0 && (
                <span className="spd-discount-pill">-{discount}%</span>
              )}
              <span className="spd-price">
                <sup>₹</sup>
                {product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="spd-original-price">
                    M.R.P. ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
            </div>
            <p className="spd-tax-note">Inclusive of all taxes</p>

            <div className="spd-divider" />

            {/* Tabs */}
            <div className="spd-tabs">
              {(["features", "specs", "inbox"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`spd-tab ${
                    activeTab === tab ? "spd-tab--active" : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "features"
                    ? "✦ Features"
                    : tab === "specs"
                    ? "📋 Specs"
                    : "📦 In Box"}
                </button>
              ))}
            </div>

            <div className="spd-tab-panel">
              {/* Features */}
              {activeTab === "features" && (
                <div className="spd-features">
                  {productFeatures.subtitle && (
                    <p className="spd-features-subtitle">
                      {productFeatures.subtitle}
                    </p>
                  )}
                  {(productFeatures.items?.length ?? 0) > 0 ? (
                    <div className="spd-features-grid">
                      {productFeatures.items.map((f, i) => (
                        <div key={i} className="spd-feature-card">
                          <span className="spd-feature-icon">{f.icon}</span>
                          <div>
                            <p className="spd-feature-title">{f.title}</p>
                            <p className="spd-feature-desc">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="spd-empty">{product.description}</p>
                  )}
                </div>
              )}

              {/* Specs */}
              {activeTab === "specs" && (
                <div className="spd-specs">
                  {(productSpecifications?.length ?? 0) > 0 ? (
                    <table className="spd-specs-table">
                      <tbody>
                        {productSpecifications.map((s, i) => (
                          <tr
                            key={i}
                            className={i % 2 === 0 ? "spd-spec-even" : ""}
                          >
                            <td className="spd-spec-label">{s.label}</td>
                            <td className="spd-spec-value">{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="spd-empty">No specifications available.</p>
                  )}
                </div>
              )}

              {/* What's in Box */}
              {activeTab === "inbox" && (
                <ul className="spd-inbox-list">
                  {productWhatsInBox.length > 0 ? (
                    productWhatsInBox.map((item, i) => (
                      <li key={i} className="spd-inbox-item">
                        <span className="spd-inbox-check">✓</span> {item}
                      </li>
                    ))
                  ) : (
                    <p className="spd-empty">Box contents not listed.</p>
                  )}
                </ul>
              )}
            </div>

            <div className="spd-divider" />

            {/* ─── Reviews ─── */}
            <div className="spd-reviews">
              <h2 className="spd-section-title">⭐ Reviews &amp; Ratings</h2>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <div className="spd-review-summary">
                  <div className="spd-summary-score">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="spd-summary-right">
                    <StarDisplay rating={averageRating} size="lg" />
                    <span className="spd-summary-count">
                      Based on {reviews.length} review
                      {reviews.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Write a review */}
              <div className="spd-write-review">
                <h4 className="spd-write-title">Write a Review</h4>
                <div className="spd-interactive-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`spd-istar ${
                        star <= (hoveredRating || rating) ? "spd-istar--on" : ""
                      }`}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="spd-rating-label">
                      {
                        ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                          rating
                        ]
                      }
                    </span>
                  )}
                </div>
                <textarea
                  className="spd-review-textarea"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
                <button
                  className="spd-submit-review-btn"
                  onClick={handleReviewSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spd-spinner">◌ Submitting…</span>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>

              {/* Review list */}
              <div className="spd-review-list">
                {reviews.length === 0 ? (
                  <div className="spd-no-reviews">
                    <span className="spd-no-reviews-icon">💬</span>
                    <p>No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  reviews.map((review) => {
                    const name = formatName(review.userName);
                    const firstName = name.split(" ")[0];
                    const isMe = auth.currentUser?.uid === review.userId;
                    const initials = firstName.slice(0, 2).toUpperCase();

                    return (
                      <div key={review.id} className="spd-review-card">
                        <div className="spd-review-top">
                          <div className="spd-reviewer-left">
                            <div className="spd-avatar">{initials}</div>
                            <div>
                              <div className="spd-reviewer-name">
                                {firstName}
                                {isMe && (
                                  <span className="spd-you-tag">You</span>
                                )}
                              </div>
                              <div className="spd-review-date">
                                {review.createdAt
                                  ?.toDate()
                                  .toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                              </div>
                            </div>
                          </div>
                          <div className="spd-review-right">
                            <StarDisplay rating={review.rating} size="sm" />
                            <div className="spd-menu-wrap">
                              <button
                                className="spd-menu-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenu(
                                    activeMenu === review.id ? null : review.id
                                  );
                                }}
                                aria-label="Review options"
                              >
                                ⋮
                              </button>
                              {activeMenu === review.id && (
                                <div className="spd-review-menu">
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(review.id)
                                    }
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="spd-review-comment">{review.comment}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ══ COL 3: Buy Box ══ */}
          <div className="spd-col-buy">
            <div className="spd-buy-box">
              {/* Price */}
              <div className="spd-bb-price">
                <sup className="spd-bb-rupee">₹</sup>
                <span className="spd-bb-amount">
                  {selectedOffer.price.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {selectedOffer.savePercent > 0 && (
                <p className="spd-bb-savings">
                  You save ₹
                  {(
                    selectedOffer.originalPrice - selectedOffer.price
                  ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}{" "}
                  ({selectedOffer.savePercent}% off)
                </p>
              )}

              {/* Stock */}
              <div className="spd-stock-row">
                <span className="spd-stock-dot" />
                <span className="spd-in-stock">In Stock</span>
              </div>

              {/* Delivery */}
              <div className="spd-delivery-card">
                <div className="spd-delivery-row">
                  <span className="spd-delivery-icon">🚚</span>
                  <div>
                    <p className="spd-delivery-main">
                      <strong>FREE Delivery</strong> on this order
                    </p>
                    <p className="spd-delivery-sub">
                      Delivered within 3–5 business days
                    </p>
                  </div>
                </div>
                <div className="spd-delivery-row">
                  <span className="spd-delivery-icon">🔄</span>
                  <p className="spd-delivery-main">7-Day hassle-free returns</p>
                </div>
              </div>

              {/* Offer selector */}
              <div className="spd-offer-section">
                <p className="spd-offer-heading">Choose your pack</p>
                <div className="spd-offer-grid">
                  {offers.map((offer) => (
                    <button
                      key={offer.pack}
                      className={`spd-offer-btn ${
                        selectedOffer.pack === offer.pack
                          ? "spd-offer-btn--active"
                          : ""
                      }`}
                      onClick={() => setSelectedOffer(offer)}
                    >
                      {offer.badge && (
                        <span className="spd-offer-badge">{offer.badge}</span>
                      )}
                      <span className="spd-offer-label">{offer.label}</span>
                      <span className="spd-offer-price">
                        ₹
                        {offer.price.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                      {offer.savePercent > 0 && (
                        <span className="spd-offer-save">
                          Save {offer.savePercent}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fulfillment */}
              <div className="spd-fulfill-table">
                <div className="spd-fulfill-row">
                  <span className="spd-fulfill-label">Ships from</span>
                  <span className="spd-fulfill-val">Our Warehouse</span>
                </div>
                <div className="spd-fulfill-row">
                  <span className="spd-fulfill-label">Payment</span>
                  <span className="spd-fulfill-val">🔒 Secure transaction</span>
                </div>
              </div>

              {/* CTAs — visible on tablet/desktop */}
              <button
                className="spd-btn spd-btn--cart"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </button>
              <button className="spd-btn spd-btn--buy" onClick={handleBuyNow}>
                ⚡ Buy it now
              </button>
              <button className="spd-wishlist-btn">♡ Add to Wish List</button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Sticky CTA bar — mobile only (hidden on tablet/desktop via CSS) ══ */}
      <div className="spd-mobile-cta">
        <button className="spd-btn spd-btn--cart" onClick={handleAddToCart}>
          🛒 Add to Cart
        </button>
        <button className="spd-btn spd-btn--buy" onClick={handleBuyNow}>
          ⚡ Buy Now
        </button>
      </div>
    </>
  );
};

export default ProductDetails;
