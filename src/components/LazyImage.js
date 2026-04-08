import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, className, style, imgClassName, imgStyle, onMouseOver, onMouseOut }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // load shortly before it scrolls into view
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={imgRef} 
      className={className} 
      style={{ 
        ...style, 
        position: "relative", 
        backgroundColor: "#f0f2f5", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        width: "100%",
        height: "100%"
      }}
    >
      {!isLoaded && (
        <div style={{ position: "absolute", zIndex: 1 }} className="spinner-border text-primary spinner-border-sm mb-0" role="status">
           <span className="visually-hidden">Loading...</span>
        </div>
      )}
      {isIntersecting && (
        <img
          src={src}
          alt={alt}
          className={imgClassName}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{ 
            ...imgStyle, 
            opacity: isLoaded ? 1 : 0, 
            transition: 'opacity 0.4s ease-in, transform 0.5s',
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        />
      )}
    </div>
  );
};

export default LazyImage;
