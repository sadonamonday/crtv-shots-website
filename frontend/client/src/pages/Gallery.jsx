import React, { useEffect, useState } from "react";
import "./Gallery.css";

const Gallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/backend/get-images.php")
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch(() => setImages([]));
  }, []);

  return (
    <div className="gallery-page">
      <header className="gallery-header">
        <img src="/logo.png" alt="Logo" className="gallery-logo" />
        <h1>GALLERY</h1>
        <div className="gallery-nav">
          <span>BOOKINGS</span>
          <span>LOGIN</span>
          <span className="gallery-toggle"></span>
        </div>
      </header>
      <div className="gallery-grid">
        {images.map((src, idx) => (
          <div className="gallery-item" key={idx}>
            <img src={src} alt={`Gallery ${idx + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;