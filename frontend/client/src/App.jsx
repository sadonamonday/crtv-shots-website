import {BrowserRouter, Route, Routes} from "react-router-dom";
import React from "react";
import Home from "./pages/Home.jsx";
import Videos from "./pages/Videos.jsx";
import Shop from "./pages/Shop.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import Gallery from "./pages/Gallery.jsx";
import About from "./pages/About.jsx";
import Testimonials from "./pages/Testimonials.jsx";
import Login from "./pages/Login.jsx";
import AddTestimonial from "./pages/AddTestimonial.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";

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
                    <Route path="/bookings" element={<BookingPage/>} />
                    <Route path="/gallery" element={<Gallery/>} />
                    <Route path="/about" element={<About/>} />
                    <Route path="/testimonials" element={<Testimonials/>} />
                    <Route path="/add-testimonial" element={<AddTestimonial />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    {/*<Route path="/admin/orders" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/Orders.jsx').default)}</React.Suspense>} />*/}
                    {/*<Route path="/admin/bookings" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/Bookings.jsx').default)}</React.Suspense>} />*/}
                    {/*<Route path="/admin/products-services" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/ProductsServices.jsx').default)}</React.Suspense>} />*/}
                    {/*<Route path="/admin/content" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/Content.jsx').default)}</React.Suspense>} />*/}
                    {/*<Route path="/admin/reviews" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/Reviews.jsx').default)}</React.Suspense>} />*/}
                    {/*<Route path="/admin/payments" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/Payments.jsx').default)}</React.Suspense>} />*/}
                    {/*<Route path="/admin/analytics" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/Analytics.jsx').default)}</React.Suspense>} />*/}
                    {/*<Route path="/admin/promotions" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/Promotions.jsx').default)}</React.Suspense>} />*/}
                    {/*<Route path="/admin/availability" element={<React.Suspense fallback={<div style={{padding:24,color:'#fff'}}>Loading…</div>}>{React.createElement(require('./pages/admin/Availability.jsx').default)}</React.Suspense>} />*/}
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    );
}

export default App;
