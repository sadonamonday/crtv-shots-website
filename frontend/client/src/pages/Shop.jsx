import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductCard from '../components/shop/ProductCard';

const Shop = () => {
    const products = new Array(6).fill(null).map(() => ({ title: 'OLI TRACKSUIT', price: 'R1000', imageSrc: '/white image.jpeg' }));
    const handleAddToCart = (product) => { console.log('Add to cart', product); };
    return (
        <div className="bg-gray-900 flex flex-col min-h-screen">
            <Header />

            {/* Shop Page */}
            <div id="shop-page" className="page active">
                <div className="min-h-screen bg-gray-900 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
                    <div className="">
                        <h1 className="text-3xl font-bold text-white mb-10 text-center">SHOP</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((p, idx) => (
                                <ProductCard
                                    key={idx}
                                    title={p.title}
                                    price={p.price}
                                    imageSrc={p.imageSrc}
                                    onAddToCart={() => handleAddToCart(p)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Shop;