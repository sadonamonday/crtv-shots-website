import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx"; // ✅ Import cart context
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const navigate = useNavigate();
  const { addToCart } = useCart(); // ✅ Access the addToCart function

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "http://localhost/crtv-shots-website/backend/api/products/get_products.php"
        );
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header />

      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-10 text-center">SHOP</h1>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10">
          <input
            type="text"
            placeholder="Search products..."
            className="p-2 rounded-lg border border-gray-300 w-full md:w-1/3 bg-white text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-900 w-full md:w-1/3"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <p className="text-gray-900 text-center">Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-gray-900 font-bold text-xl mb-2">{p.title}</h2>
                  <p className="text-gray-700 mb-4">R{p.price}</p>

                  <div className="mt-auto flex gap-2">
                    {/* View More button */}
                    <button
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 p-2 rounded font-semibold transition"
                    >
                      View More
                    </button>

                    {/* ✅ Add to Cart button */}
                    <button
                      onClick={() => {
                        addToCart(p);
                        alert(`${p.title} added to cart!`);
                      }}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded font-semibold transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-900 text-center">No products found.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
