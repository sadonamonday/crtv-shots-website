import React, { useEffect, useState } from "react";
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";
import "./Gallery.css"; 

const Gallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Commented out backend code for now
    /*
    fetch("http://localhost:8000/backend/get-images.php")
        .then((res) => res.json())
        .then((data) => setImages(data))
        .catch(() => setImages([]));
    */

    // Hardcoded images for now
    setImages([
      "https://scontent.cdninstagram.com/v/t51.82787-15/517915870_17940119829040227_4976581710976003649_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=107&ig_cache_key=MzY3NDQ3OTg5NDY4ODQxMzkyNA%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=2B4yNTUHntIQ7kNvwFLmXQf&_nc_oc=AdmTWBlDUphdZbYSG3eMk4vfo08DzF-kgROwQPYxqIl5C7g9Otg4hfvmtbtUZPYUyBo&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=NjUt_rIB-v_KcbZImvCvKg&oh=00_Afd5E73UH6sHGzZkA_z9XnnHoTL1IEaAniWV4uRbIb8Hqg&oe=68F6DFE1",
      "https://scontent.cdninstagram.com/v/t51.75761-15/500710450_17934728799040227_362504132389963373_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&ig_cache_key=MzY0MDM5NTg0MjQ1MTU4ODkzNA%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4OTM0LnNkci5DMyJ9&_nc_ohc=469Kagef-ZQQ7kNvwE_1Idr&_nc_oc=AdkORzHhUAUU2roPpyImBXlIM12DKPO3sGwilycyoOAXn7jUtqvI_B8NyuGEOO9eHaQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=NjUt_rIB-v_KcbZImvCvKg&oh=00_AfesxXUmbTZ4Ex7wOqQwZ_8oNDaE1KtFcq22CeM3lKOg2w&oe=68F6DD6A",
      "https://scontent.cdninstagram.com/v/t51.75761-15/488157093_17929041759040227_4460111122746060403_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ig_cache_key=MzYwMzE3MjczMjA2NjcwNjMyNg%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=U97vkxucCHMQ7kNvwHiQd8G&_nc_oc=Adn0FMU3MZvT-MkTEnFtLxxKm4zwwmXDAH0zKztuVdt2974AR6A60ZyTVtfnCv8C90c&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=1Hg1CQUoQuDvBxpyPyEBZA&oh=00_Afej7ZvSfZPiwMGYGCiiQC_pGfE9kGpCzCaHYDhrcj4Icg&oe=68F6E0B9",
      "/images/gallery4.jpg",
      "/images/gallery5.jpg",
      "https://scontent.cdninstagram.com/v/t51.75761-15/488650193_17929041816040227_2953555505677489923_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110&ig_cache_key=MzYwMzE3MjczMjA4MzQyMDc5OQ%3D%3D.3-ccb1-7&ccb=1-7&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEwODB4MTM1MC5zZHIuQzMifQ%3D%3D&_nc_ohc=3JVVXLQxm-0Q7kNvwEQ_l7I&_nc_oc=AdkPHWGG6K5KoKgr8VkIg9vIZQCjml-W5wccofC_jxPslo18JqPh--nSw1U3pRNyGn4&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=1Hg1CQUoQuDvBxpyPyEBZA&oh=00_AfdXkRh2SLjiFDXTa-P8OCn0qdjUdk-vtmAyrGZRzPbOIg&oe=68F6C07D",
      "/images/gallery7.jpg",
      "/images/gallery8.jpg",
      "/images/gallery9.jpg",
    ]);
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
