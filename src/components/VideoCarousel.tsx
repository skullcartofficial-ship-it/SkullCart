import React, { useState, useEffect, useRef } from "react";

interface Video {
  src: string;
  title?: string;
  subtitle?: string;
}

const VideoCarousel: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // FIXED: Use ReturnType for better compatibility with Netlify/Node environment
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // List of your videos - Add your video paths here
  const videos: Video[] = [
    { src: "/buds.mp4", title: "Smart Tech", subtitle: "Smart Prices" },
    { src: "/headphones.mp4", title: "Skull Car", subtitle: "Launching Sale" },
    { src: "/mouse.mp4", title: "Stay go", subtitle: "For Anything" },
    { src: "/bluethooth.mp4", title: "Stay go", subtitle: "For Anything" },
  ];

  // Auto-rotate videos every 5 seconds
  useEffect(() => {
    startAutoRotate();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startAutoRotate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      nextVideo();
    }, 7000); // Change video every 5 seconds
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
    // Reset auto-rotate timer
    startAutoRotate();
  };

  return (
    <div className="video-carousel-container">
      {/* Current Video */}
      <video
        key={currentVideoIndex}
        autoPlay
        loop
        muted
        playsInline
        className={`hero-video ${isTransitioning ? "fade-out" : "fade-in"}`}
      >
        <source src={videos[currentVideoIndex].src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better text readability */}
      <div className="hero-video-overlay"></div>

      {/* Video Indicators/Dots */}
      <div className="video-indicators">
        {videos.map((_, index) => (
          <button
            key={index}
            className={`video-dot ${
              index === currentVideoIndex ? "active" : ""
            }`}
            onClick={() => goToVideo(index)}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>

      {/* Optional: Navigation Arrows */}
      <button
        className="video-nav prev"
        onClick={prevVideo}
        aria-label="Previous video"
      >
        ‹
      </button>
      <button
        className="video-nav next"
        onClick={nextVideo}
        aria-label="Next video"
      >
        ›
      </button>
    </div>
  );
};

export default VideoCarousel;
