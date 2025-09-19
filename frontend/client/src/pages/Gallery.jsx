import React from "react";
import "./Gallery.css"; // Create this CSS file for styles

const images = [
  "/images/img1.jpg",
  "/images/img2.jpg",
  "/images/img3.jpg",
  "/images/img4.jpg",
  "/images/img5.jpg",
  "/images/img6.jpg",
  "/images/img7.jpg",
  "/images/img8.jpg",
  "/images/img9.jpg",
];

const Gallery = () => (
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

export default Gallery;