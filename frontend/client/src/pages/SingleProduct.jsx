import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import buildApiUrl from '../utils/api';

export default function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(buildApiUrl(`/products/getProduct.php?id=${encodeURIComponent(id)}`), { credentials: 'include' });
        if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        setError(e?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  return (
    <div className="bg-gray-900 flex flex-col min-h-screen">
      <Header />
      <div className="min-h-screen bg-gray-900 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        {loading && <p className="text-center text-gray-400">Loading product…</p>}
        {!loading && error && <p className="text-center text-red-400">{error}</p>}
        {!loading && !error && product && (
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={product.image_url || '/white image.jpeg'}
                alt={product.title || 'Product'}
                className="w-full h-96 object-cover rounded"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{product.title}</h1>
              <p className="text-blue-400 font-bold mt-2">{product.price}</p>
              <p className="text-gray-300 mt-4 whitespace-pre-wrap">{product.description}</p>
              <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Add to Cart</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
