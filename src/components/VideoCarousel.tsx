import React, { useState, useEffect, useRef } from "react";

interface Video {
  src: string;
  title?: string;
  subtitle?: string;
}

const VideoCarousel: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videos: Video[] = [
    { src: "/buds.mp4", title: "Smart Tech", subtitle: "Smart Prices" },
    { src: "/headphones.mp4", title: "Skull Car", subtitle: "Launching Sale" },
    { src: "/mouse.mp4", title: "Stay go", subtitle: "For Anything" },
    { src: "/bluethooth.mp4", title: "Stay go", subtitle: "For Anything" },
  ];

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startAutoRotate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      nextVideo();
    }, 7000);
  };

  const nextVideo = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
      setIsTransitioning(false);
    }, 500);
  };

  const prevVideo = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex(
        (prev) => (prev - 1 + videos.length) % videos.length
      );
      setIsTransitioning(false);
    }, 500);
  };

  const goToVideo = (index: number) => {
    if (index === currentVideoIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex(index);
      setIsTransitioning(false);
    }, 500);
    startAutoRotate();
  };

  return (
    // ✅ FIX: Container fills parent absolutely, overflow hidden clips the video
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {/* ✅ FIX: Video positioned absolutely, centered, covers entire area */}
      <video
        key={currentVideoIndex}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          minWidth: "100%",
          minHeight: "100%",
          width: "auto",
          height: "auto",
          objectFit: "cover",
          objectPosition: "center center",
          opacity: isTransitioning ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <source src={videos[currentVideoIndex].src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Video Indicators/Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 10,
        }}
      >
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToVideo(index)}
            aria-label={`Go to video ${index + 1}`}
            style={{
              width: index === currentVideoIndex ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              border: "none",
              backgroundColor:
                index === currentVideoIndex ? "white" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevVideo}
        aria-label="Previous video"
        style={{
          position: "absolute",
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
        }}
      >
        ‹
      </button>

      <button
        onClick={nextVideo}
        aria-label="Next video"
        style={{
          position: "absolute",
          right: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
        }}
      >
        ›
      </button>
    </div>
  );
};

export default VideoCarousel;
