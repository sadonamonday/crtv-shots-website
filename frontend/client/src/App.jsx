import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import React from "react";
import Home from "./pages/Home.jsx";
import Videos from "./pages/Videos.jsx";
import Shop from "./pages/Shop.jsx";
import SingleProduct from "./pages/SingleProduct.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import Gallery from "./pages/Gallery.jsx";
import About from "./pages/About.jsx";
import Testimonials from "./pages/Testimonials.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import AddTestimonial from "./pages/AddTestimonial.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import GalleryAdmin from "./pages/admin/GalleryAdmin.jsx";
import Profile from "./pages/Profile.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminSignup from "./pages/admin/AdminSignup.jsx";
import Verify2FAAdmin from "./pages/admin/Verify2FAAdmin.jsx";

const Orders = React.lazy(() => import('./pages/admin/Orders.jsx'));
const Bookings = React.lazy(() => import('./pages/admin/Bookings.jsx'));
const Products = React.lazy(() => import('./pages/admin/Products.jsx'));
const Services = React.lazy(() => import('./pages/admin/Services.jsx'));
const Categories = React.lazy(() => import('./pages/admin/Categories.jsx'));
const Content = React.lazy(() => import('./pages/admin/Content.jsx'));
const Reviews = React.lazy(() => import('./pages/admin/Reviews.jsx'));
const Payments = React.lazy(() => import('./pages/admin/Payments.jsx'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics.jsx'));
const Promotions = React.lazy(() => import('./pages/admin/Promotions.jsx'));
const Availability = React.lazy(() => import('./pages/admin/Availability.jsx'));
const Coupons = React.lazy(() => import('./pages/admin/Coupons.jsx'));
import Verify2FA from "./pages/Verify2fa.jsx";
import UserProfile from "./pages/UserProfile";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error("ErrorBoundary caught an error:", error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 24, color: "#fff" }}>
                    <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Something went wrong.</h2>
                    <div style={{ opacity: 0.8, fontSize: 14 }}>
                        {this.state.error?.message || "An unexpected error occurred."}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/videos" element={<Videos/>} />
                    <Route path="/shop" element={<Shop/>} />
                    <Route path="/shop/product/:id" element={<SingleProduct/>} />
                    <Route path="/bookings" element={<BookingPage/>} />
                    <Route path="/gallery" element={<Gallery/>} />
                    <Route path="/about" element={<About/>} />
                    <Route path="/testimonials" element={<Testimonials/>} />
                    <Route path="/add-testimonial" element={<AddTestimonial />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/Verify2FA" element={<Verify2FA />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/gallery" element={<GalleryAdmin />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/signup" element={<AdminSignup />} />
                    <Route path="/admin/verify-2fa" element={<Verify2FAAdmin />} />
                    <Route path="/admin/orders" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Orders/></React.Suspense>} />
                    <Route path="/admin/bookings" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Bookings/></React.Suspense>} />
                    <Route path="/admin/products" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Products/></React.Suspense>} />
                    <Route path="/admin/services" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Services/></React.Suspense>} />
                    <Route path="/admin/categories" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Categories/></React.Suspense>} />
                    <Route path="/admin/products-services" element={<Navigate to="/admin/products" replace />} />
                    <Route path="/admin/content" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Content/></React.Suspense>} />
                    <Route path="/admin/reviews" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Reviews/></React.Suspense>} />
                    <Route path="/admin/payments" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Payments/></React.Suspense>} />
                    <Route path="/admin/analytics" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Analytics/></React.Suspense>} />
                    <Route path="/admin/promotions" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Promotions/></React.Suspense>} />
                    <Route path="/admin/availability" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Availability/></React.Suspense>} />
                    <Route path="/admin/coupons" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}><Coupons/></React.Suspense>} />
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    );
}

export default App;
