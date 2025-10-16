import React from 'react';
import PropTypes from 'prop-types';

const ProductCard = ({ title, price, imageSrc, ctaLabel = 'Add to Cart', onAddToCart }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <img
                src={imageSrc}
                alt={title}
                className="w-full h-80 object-cover rounded"
            />
            <div className="mt-4">
                <h3 className="text-white font-semibold text-lg">{title}</h3>
                <p className="text-blue-400 font-bold mt-2">{price}</p>
                <button
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                    onClick={onAddToCart}
                >
                    {ctaLabel}
                </button>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imageSrc: PropTypes.string.isRequired,
    ctaLabel: PropTypes.string,
    onAddToCart: PropTypes.func,
};

export default ProductCard;