import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useCart } from "../context/CartContext.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert(`${product.title} added to cart!`);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost/crtv-shots-website/backend/api/products/get_product.php?id=${id}`
        );
        const data = await res.json();
        if (data.error) {
          alert(data.error);
          navigate("/shop");
        } else {
          setProduct(data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">
        Loading product...
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-col md:flex-row items-start justify-center pt-20 pb-10 px-4 sm:px-6 lg:px-8 gap-10">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.title}
          className="w-full md:w-1/3 rounded-lg shadow-lg"
        />

        {/* Product Info */}
        <div className="flex flex-col text-gray-900 w-full md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
          <p className="text-2xl font-semibold mb-4">R{product.price}</p>
          <p className="mb-6">{product.description || "No description available."}</p>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              className="bg-yellow-400 text-black p-3 rounded hover:bg-yellow-500 transition"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            <button
              className="bg-gray-200 text-gray-900 p-3 rounded hover:bg-gray-300 transition"
              onClick={() => navigate("/shop")}
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
