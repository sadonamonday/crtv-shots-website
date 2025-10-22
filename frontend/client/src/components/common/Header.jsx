import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import buildApiUrl from '../../utils/api';

const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
        
        // Listen for storage changes (when user logs in/out in another tab)
        const handleStorageChange = () => {
            checkAuthStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const checkAuthStatus = async () => {
        try {
            const loggedIn = localStorage.getItem('isLoggedIn') === '1';
            setIsLoggedIn(loggedIn);
            
            if (loggedIn) {
                // Fetch user profile data
                try {
                    const response = await fetch(buildApiUrl('/auth/me.php'), {
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setUserProfile(data);
                        setIsAdmin(data.is_admin || false);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            } else {
                setUserProfile(null);
                setIsAdmin(false);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Clear localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('avatarUrl');
            
            // Clear sessionStorage
            sessionStorage.clear();
            
            // Call logout endpoint
            await fetch(buildApiUrl('/config/logout.php'), {
                method: 'POST',
                credentials: 'include'
            });
            
            // Reset state
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUserProfile(null);
            
            // Navigate to home
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
            // Still reset state even if logout request fails
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUserProfile(null);
            navigate('/');
        }
    };

    if (loading) {
        return (
            <nav className="fixed w-full z-50 bg-gray-900 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center">
                                <img
                                    className="h-20 w-auto"
                                    src="../assets/logo.png"
                                    alt="Logo"
                                />
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <div className="animate-pulse bg-gray-700 h-8 w-32 rounded"></div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="fixed w-full z-50 bg-gray-900 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center">
                            <img
                                className="h-20 w-auto"
                                src="../assets/logo.png"
                                alt="Logo"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        <div className="flex items-center space-x-4">
                            <Link to="/shop" className="nav-link text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">Shop</Link>
                            <Link to="/bookings" className="nav-link text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">Bookings</Link>
                            <Link to="/gallery" className="nav-link text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">Gallery</Link>
                            
                            {isLoggedIn ? (
                                <>
                                    <Link to="/profile" className="nav-link text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">Profile</Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="nav-link text-yellow-400 hover:text-yellow-300 px-1 py-2 text-sm font-medium">Admin Dashboard</Link>
                                    )}
                                    <div className="relative group">
                                        <button className="flex items-center space-x-2 text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">
                                            {userProfile?.avatarUrl ? (
                                                <img 
                                                    src={userProfile.avatarUrl} 
                                                    alt="Profile" 
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                                                    <span className="text-xs text-white">
                                                        {userProfile?.firstName ? userProfile.firstName[0].toUpperCase() : 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <span>{userProfile?.firstName || 'User'}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        
                                        {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-40 bg-gray-900 rounded-md shadow-md transform scale-95 opacity-0 invisible group-hover:scale-100 group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out">
                                        <div className="py-1">
                                            <Link 
                                                to="/profile" 
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-200 transition-colors"
                                            >
                                                View Profile
                                            </Link>
                                            <button 
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-200 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>

                                    </div>
                                </>
                            ) : (
                                <Link to="/login" className="nav-link text-gray-300 hover:text-white px-1 py-2 text-sm font-medium">Login</Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
                    <Link to="/bookings" className="text-gray-300 hover:text-white block pl-3 pr-4 py-2 text-base font-medium">Bookings</Link>
                    <Link to="/gallery" className="text-gray-300 hover:text-white block pl-3 pr-4 py-2 text-base font-medium">Gallery</Link>
                    
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" className="text-gray-300 hover:text-white block pl-3 pr-4 py-2 text-base font-medium">Profile</Link>
                            {isAdmin && (
                                <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 block pl-3 pr-4 py-2 text-base font-medium">Admin Dashboard</Link>
                            )}
                        </>
                    ) : (
                        <Link to="/login" className="text-gray-300 hover:text-white block pl-3 pr-4 py-2 text-base font-medium">Login</Link>
                    )}
                    
                    <div className="pt-4 pb-3 border-t border-gray-700">
                        {isLoggedIn ? (
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    {userProfile?.avatarUrl ? (
                                        <img 
                                            src={userProfile.avatarUrl} 
                                            alt="Profile" 
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                                            <span className="text-sm text-white">
                                                {userProfile?.firstName ? userProfile.firstName[0].toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-white">
                                        {userProfile?.firstName || 'User'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center px-4">
                                <div className="ml-3">
                                    <Link to="/login" className="text-base font-medium text-white">Login</Link>
                                </div>
                            </div>
                        )}
                        
                        {isLoggedIn && (
                            <div className="mt-3 space-y-1">
                                <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">View Profile</Link>
                                <button 
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;