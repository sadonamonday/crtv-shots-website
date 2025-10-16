import React, { useEffect, useState } from "react";
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";

const Gallery = () => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/backend/get-images.php")
            .then((res) => res.json())
            .then((data) => setImages(data))
            .catch(() => setImages([]));
    }, []);

    return (
        <div className="bg-gray-900 min-h-[100dvh] w-screen box-border pb-10">
            {/* Global header (fixed) */}
            <Header />

            {/* Page header area */}
            <div className="relative flex items-center justify-center pt-24 pb-8 w-screen box-border">
                {/* If you want a logo at left, uncomment and provide src
                <img src="/logo.png" alt="Logo" className="absolute left-10 w-[60px] hover:cursor-pointer" />
                */}
                <h1 className="text-white text-4xl font-bold tracking-[0.125em]">GALLERY</h1>
                {/* Right-side nav replaced by global Header */}
            </div>

            {/* Gallery grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 w-screen max-w-[1200px] mx-auto box-border px-8">
                {images.map((src, idx) => (
                    <div className="gallery-item" key={idx}>
                        <img
                            className="w-full aspect-square object-cover rounded shadow-md bg-[#222]"
                            src={src}
                            alt={`Gallery ${idx + 1}`}
                        />
                    </div>
                ))}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Gallery;