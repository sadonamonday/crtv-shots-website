import React, { useEffect, useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductCard from '../components/shop/ProductCard';
import buildApiUrl from '../utils/api';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(buildApiUrl('/products/getProducts.php'), { credentials: 'include' });
                if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e?.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAddToCart = (product) => { console.log('Add to cart', product); };

    return (
        <div className="bg-gray-900 flex flex-col min-h-screen">
            <Header />

            {/* Shop Page */}
            <div id="shop-page" className="page active">
                <div className="min-h-screen bg-gray-900 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
                    <div className="">
                        <h1 className="text-3xl font-bold text-white mb-10 text-center">SHOP</h1>

                        {loading && (
                            <p className="text-center text-gray-400">Loading products…</p>
                        )}

                        {!loading && error && (
                            <p className="text-center text-red-400">{error}</p>
                        )}

                        {!loading && !error && products.length === 0 && (
                            <p className="text-center text-gray-500">No products available right now.</p>
                        )}

                        {!loading && !error && products.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((p, idx) => {
                                    const title = p?.title || p?.name || 'Untitled';
                                    const price = p?.price ?? '';
                                    const imageSrc = p?.imageSrc || p?.image_url || p?.image || '/white image.jpeg';
                                    const key = p?.id ?? idx;
                                    return (
                                        <ProductCard
                                            key={key}
                                            title={title}
                                            price={price}
                                            imageSrc={imageSrc}
                                            onAddToCart={() => handleAddToCart(p)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Shop;