import { useNavigate } from "react-router-dom";

export default function Payment() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
          animation: "fadeInUp 0.6s ease-out forwards",
        }}
      >
        {/* Animated icon */}
        <div
          style={{
            fontSize: "80px",
            marginBottom: "12px",
            animation: "pulse 2s ease-in-out infinite",
            display: "block",
          }}
        >
          🔒
        </div>

        {/* Badge */}
        <div
          style={{
            display: "inline-block",
            background: "rgba(255,71,87,0.15)",
            border: "1px solid rgba(255,71,87,0.4)",
            color: "#ff6b7a",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "6px 18px",
            borderRadius: "999px",
            marginBottom: "24px",
          }}
        >
          Coming Soon
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 40px)",
            fontWeight: "800",
            color: "#ffffff",
            margin: "0 0 16px 0",
            lineHeight: "1.2",
          }}
        >
          Payments Are{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            On Their Way
          </span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.6)",
            lineHeight: "1.7",
            margin: "0 0 36px 0",
          }}
        >
          We're working hard to bring you a secure and seamless payment
          experience. Stay tuned — it'll be worth the wait!
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          {[
            { icon: "💳", label: "UPI" },
            { icon: "🏦", label: "Net Banking" },
            { icon: "📱", label: "Wallets" },
            { icon: "🔐", label: "Secure Checkout" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "999px",
                padding: "8px 16px",
                color: "rgba(255,255,255,0.75)",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "999px",
            margin: "0 auto 32px",
          }}
        />

        {/* COD note */}
        <div
          style={{
            background: "rgba(76, 175, 80, 0.12)",
            border: "1px solid rgba(76, 175, 80, 0.3)",
            borderRadius: "14px",
            padding: "18px 22px",
            marginBottom: "32px",
            textAlign: "left",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <span style={{ fontSize: "24px", flexShrink: 0 }}>🚚</span>
          <div>
            <p
              style={{
                margin: "0 0 4px 0",
                color: "#81c784",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              Cash on Delivery is Available!
            </p>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.55)",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              You can still place your order and pay when it arrives at your
              doorstep.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.88";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🏠 Back to Home
          </button>

          <button
            onClick={() => navigate("/cart")}
            style={{
              width: "100%",
              padding: "13px",
              background: "transparent",
              color: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "rgba(255,255,255,0.65)";
            }}
          >
            🛒 Back to Cart
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
