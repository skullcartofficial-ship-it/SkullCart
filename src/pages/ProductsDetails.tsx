import React, { useState, useEffect } from "react";
import "./ProductsDetails.css";
import { Product } from "../types"; // ✅ Make sure this path is correct
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

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  addToCart,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!product) return null;

  const [mainImage, setMainImage] = useState<string>(product.image);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer>({
    pack: 1,
    price: product.price,
    originalPrice: product.price,
    savePercent: 0,
    label: "Pack of 1",
  });

  const basePrice = product.price;

  const offers: Offer[] = [
    {
      pack: 1,
      price: basePrice,
      originalPrice: basePrice,
      savePercent: 0,
      label: "Pack of 1",
    },
    {
      pack: 2,
      price: basePrice * 2 * 0.9,
      originalPrice: basePrice * 2,
      savePercent: 10,
      label: "Pack of 2",
      badge: "MOST POPULAR",
    },
    {
      pack: 3,
      price: basePrice * 3 * 0.8,
      originalPrice: basePrice * 3,
      savePercent: 20,
      label: "Pack of 3",
      badge: "BEST DEAL",
    },
  ];

  // Default fallback data
  const defaultFeatures = {
    subtitle: "Can be hung / can be pasted / can be placed / can be hand-held",
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
    "Smart Sensor Light Device",
    "Charging Cable (Type-C)",
    "User Manual",
    "Warranty Card",
    "Free Protective Case",
  ];

  const defaultLightDescription =
    "Advanced smartwatch with health tracking, GPS, and 7-day battery life.";

  // Use product data with fallbacks
  const productFeatures = product.features || defaultFeatures;
  const productSpecifications = product.specifications || defaultSpecifications;
  const productWhatsInBox = product.whatsInBox || defaultWhatsInBox;
  const productLightDescription =
    product.lightDescription || defaultLightDescription;

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, where("productId", "==", String(product.id)));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleReviewSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    if (!rating || !comment.trim()) {
      alert("Please provide both rating and comment");
      return;
    }

    setLoading(true);

    try {
      let userName = user.displayName;

      if (userName && userName.trim() !== "") {
        // Use display name as is
      } else if (user.email) {
        const emailName = user.email.split("@")[0];
        userName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      } else {
        userName = "User";
      }

      await addDoc(collection(db, "reviews"), {
        productId: String(product.id),
        userId: user.uid,
        userName: userName,
        userEmail: user.email,
        rating,
        comment,
        createdAt: Timestamp.now(),
      });

      setRating(0);
      setComment("");
      fetchReviews();
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const user = auth.currentUser;
    const reviewToDelete = reviews.find((r) => r.id === reviewId);

    if (!user) {
      alert("Please login first");
      return;
    }

    if (reviewToDelete && reviewToDelete.userId !== user.uid) {
      alert("You can only delete your own reviews");
      return;
    }

    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteDoc(doc(db, "reviews", reviewId));
        fetchReviews();
        setActiveMenu(null);
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("Failed to delete review");
      }
    }
  };

  const handleAddToCart = () => {
    const productWithOffer = {
      ...product,
      price: selectedOffer.price,
      originalPrice: selectedOffer.originalPrice,
      quantity: selectedOffer.pack,
      offerLabel: selectedOffer.label,
    };
    addToCart(productWithOffer);
  };

  const handleBuyNow = () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first to continue with purchase");
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
      state: {
        purchaseItem: purchaseItem,
        total: selectedOffer.price,
      },
    });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="overlay">
      <div className="product-modal">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <div className="modal-content">
          {/* LEFT COLUMN */}
          <div className="left-column">
            <div className="main-image">
              <img src={mainImage} alt={product.title} />
            </div>
            <div className="thumbnail-list">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="thumbnail"
                  onClick={() => setMainImage(img)}
                  className={mainImage === img ? "active" : ""}
                />
              ))}
            </div>
            <div className="product-description">
              <h2>{product.title}</h2>
              <p>{product.description}</p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            {/* PRICE SECTION */}
            <div className="price-section">
              <div className="price-container">
                <span className="current-price">
                  ₹{selectedOffer.price.toFixed(2)}
                </span>
                {selectedOffer.savePercent > 0 && (
                  <>
                    <span className="original-price">
                      ₹{selectedOffer.originalPrice.toFixed(2)}
                    </span>
                    <span className="discount-badge">
                      Save {selectedOffer.savePercent}%
                    </span>
                  </>
                )}
              </div>

              <div className="offer-selector">
                <h4>Choose your offer</h4>
                <div className="offer-buttons">
                  {offers.map((offer) => (
                    <button
                      key={offer.pack}
                      className={`offer-btn ${
                        selectedOffer.pack === offer.pack ? "active" : ""
                      }`}
                      onClick={() => setSelectedOffer(offer)}
                    >
                      <div className="offer-pack">{offer.label}</div>
                      <div className="offer-price">
                        ₹{offer.price.toFixed(2)}
                      </div>
                      {offer.badge && (
                        <span className="offer-badge">{offer.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="action-buttons">
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  🛒 Add to Cart
                </button>
                <button className="buy-now-btn" onClick={handleBuyNow}>
                  ⚡ Buy it now
                </button>
              </div>

              <div className="delivery-info">
                <span>🚚 Delivery in 3–5 days</span>
                <span>🔄 7 Days Return</span>
              </div>
            </div>

            {/* PRODUCT FEATURES SECTION */}
            <div className="features-section">
              <h3>✨ Product Features</h3>
              {productFeatures.subtitle && (
                <div className="feature-subtitle">
                  <p>{productFeatures.subtitle}</p>
                </div>
              )}
              <div className="features-grid">
                {productFeatures.items && productFeatures.items.length > 0 ? (
                  productFeatures.items.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">{feature.icon}</span>
                      <div className="feature-text">
                        <strong>{feature.title}</strong>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No features available</p>
                )}
              </div>
            </div>

            {/* TECHNICAL SPECIFICATIONS SECTION */}
            <div className="specs-section">
              <h3>📋 Technical Specifications</h3>
              <div className="specs-list">
                {productSpecifications.map((spec, index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-label">{spec.label}:</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LIGHT DESCRIPTION */}
            <div className="light-description">
              <p>{productLightDescription}</p>
            </div>

            {/* WHAT'S IN THE BOX SECTION */}
            <div className="box-section">
              <h3>📦 What's in the Box</h3>
              <ul className="box-list">
                {productWhatsInBox.map((item, index) => (
                  <li key={index}>
                    <span className="check-icon">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* REVIEWS SECTION */}
            <div className="reviews-section">
              <h3>⭐ Reviews & Comments</h3>

              <div className="rating-input">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= rating ? "star active" : "star"}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <textarea
                  placeholder="Write your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  className="submit-review-btn"
                  onClick={handleReviewSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
              </div>

              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <p className="no-reviews">
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  reviews.map((review) => {
                    let displayName = review.userName;
                    if (displayName && displayName.includes("@")) {
                      displayName = displayName.split("@")[0];
                      displayName =
                        displayName.charAt(0).toUpperCase() +
                        displayName.slice(1);
                    }
                    if (
                      !displayName ||
                      displayName === "null" ||
                      displayName === "undefined"
                    ) {
                      displayName = "User";
                    }
                    const firstName = displayName.split(" ")[0];
                    const isCurrentUser =
                      auth.currentUser?.uid === review.userId;

                    return (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <strong>{firstName}</strong>
                            {isCurrentUser && (
                              <span className="you-tag">You</span>
                            )}
                          </div>
                          <div className="review-menu-container">
                            <button
                              className="menu-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(
                                  activeMenu === review.id ? null : review.id
                                );
                              }}
                            >
                              ⋮
                            </button>
                            {activeMenu === review.id && (
                              <div className="review-menu">
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                >
                                  🗑️ Delete Review
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="review-stars">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < review.rating ? "star active" : "star"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        <div className="review-date">
                          {review.createdAt
                            ?.toDate()
                            .toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
