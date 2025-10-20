import React, { useEffect, useState } from "react";
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";
import "./Gallery.css"; 
import buildApiUrl from "../utils/api";

const Gallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(buildApiUrl('/gallery/list.php'), { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load gallery');
        const data = await res.json();
        if (!cancelled) setImages(Array.isArray(data) ? data.map(it => it.url) : []);
      } catch (e) {
        // Fallback to hardcoded images if backend not available
        if (!cancelled) setImages([
          "/images/gallery4.jpg",
          "/images/gallery5.jpg",
          "/images/gallery7.jpg",
          "/images/gallery8.jpg",
          "/images/gallery9.jpg",
        ]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="gallery-page">
      <Header />

      <div className="gallery-header">
        <h1>GALLERY</h1>
      </div>

      <div className="gallery-grid">
        {images.map((src, idx) => (
          <div className="gallery-item" key={idx}>
            <img src={src} alt={`Gallery ${idx + 1}`} />
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Gallery;
