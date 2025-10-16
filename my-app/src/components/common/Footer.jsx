import React from 'react';

const Footer = () => {
    return (
        <footer className="full-width-footer text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/shop" className="text-gray-300 hover:text-white transition" data-page="shop">Shop</a>
                            </li>
                            <li>
                                <a href="/bookings" className="text-blue-400 hover:text-white transition" data-page="bookings">Bookings</a>
                            </li>
                            <li>
                                <a href="/gallery" className="text-gray-300 hover:text-white transition" data-page="gallery">Gallery</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <p className="text-gray-300">123 Mandela Drive</p>
                        <p className="text-gray-300">Alberton, 1447</p>
                        <p className="text-gray-300">crtvshots1@gmail.com</p>
                        <p className="text-gray-300">0737446515</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                             
                            <a href="https://www.facebook.com/share/1ERLPSToCi/s" className="text-gray-300 hover:text-white transition">
                                <i data-feather="facebook" className="w-5 h-5" />
                            </a>
                            
                            <a  className="text-gray-300 hover:text-white transition">
                                 <img src="/icons/icons8-tiktok-50.png" alt="TikTok" className="h-8 w-8 object-contain opacity-90 hover:opacity-100 transition" />

                            </a>
                            
                            <a href="https://www.instagram.com/crtvshots?igsh=MXU5Znk2bW55aXoybQ==" className="text-gray-300 hover:text-white transition">
                                <img  src="/icons/instagram.png" alt="Instagram" className="h-8 w-8 object-contain opacity-90 hover:opacity-100 transition" />
                            </a>
                            <a href="https://www.youtube.com/@CRTVSHOTS" className="text-gray-300 hover:text-white transition">
                                 <img  src="/icons/icons8-youtube-50.png" alt="YouTube" className="h-8 w-8 object-contain opacity-90 hover:opacity-100 transition" />
                             </a> 
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>© 2025 CRTV SHOTS. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;