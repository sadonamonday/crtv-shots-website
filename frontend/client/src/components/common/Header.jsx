import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-gray-900 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <a href="#" className="flex items-center">
                            <img
                                className="h-20 w-auto"
                                src="../assets/logo.png"
                                alt="Logo"
                            />
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        <div className="flex items-center space-x-4">
                            <Link to="/shop" className="nav-link text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">Shop</Link>
                            <Link to="/bookings" className="nav-link text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">Bookings</Link>
                            <Link to="/gallery" className="nav-link text-gray-300 hover:text-white px-1 py-2 text-sm font-medium" data-page="gallery">Gallery</Link>
                            <a className="text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">Login</a>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded={mobileOpen}
                            onClick={() => setMobileOpen((v) => !v)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <i data-feather="menu" className="block h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden ${mobileOpen ? '' : 'hidden'}`}>
                <div className="pt-2 pb-3 space-y-1">
                    <Link to="/shop" className="text-gray-300 hover:text-white block pl-3 pr-4 py-2 text-base font-medium">Shop</Link>
                    <Link to="/bookings" className="bg-gray-700 border-blue-500 text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Bookings</Link>
                    <a className="text-gray-300 hover:text-white block pl-3 pr-4 py-2 text-base font-medium" data-page="gallery">Gallery</a>
                    <div className="pt-4 pb-3 border-t border-gray-700">
                        <div className="flex items-center px-4">
                            <div className="ml-3">
                                <div className="text-base font-medium text-white">Login</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <a href="#" className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Book Now</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;