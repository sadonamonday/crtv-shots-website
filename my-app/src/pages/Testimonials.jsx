import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";

function clampRating(value) {
    const n = Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 0;
    return Math.max(0, Math.min(5, n));
}

function StarRating({ rating }) {
    const r = clampRating(rating);
    const full = '★'.repeat(r);
    const empty = '☆'.repeat(5 - r);
    return (
        <div className="text-[#FFD700] mb-2 text-base" aria-label={`Rating: ${r} out of 5`}>
            {full}{empty}
        </div>
    );
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Check auth (adjust to your backend)
                // Expect 200 when logged in; ignore body for simplicity
                try {
                    const me = await fetch('/api/auth/me', { credentials: 'include' });
                    setUserLoggedIn(me.ok);
                } catch {
                    setUserLoggedIn(false);
                }

                // Fetch testimonials
                const res = await fetch('http://localhost/finalyearproject/my-app/backend/testimonials.php', { credentials: 'include' });


                if (!res.ok) throw new Error(`Failed to load testimonials (${res.status})`);
                const data = await res.json();
                // Expect an array of { id?, name, rating, message }
                setTestimonials(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e?.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <div className="bg-gray-900 min-h-[100dvh] w-screen box-border pb-10 text-white">
            <Header />

            <main className="max-w-[900px] mx-auto p-5 pt-32">
                <h2 className="text-center mb-6 text-[1.6rem] text-white">Testimonials</h2>

                {userLoggedIn && (
                    <div className="mb-5 text-center">
                         <Link to="/add-testimonial" className="bg-[#06d6a0] text-black p-2 rounded">
  Add Testimonial
</Link>
                    </div>
                )}

                {loading && (
                    <p className="text-center text-gray-400">Loading testimonials…</p>
                )}

                {!loading && error && (
                    <p className="text-center text-red-400">{error}</p>
                )}

                {!loading && !error && testimonials.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">No testimonials yet. Be the first to add one!</p>
                )}

                {!loading && !error && testimonials.length > 0 && (
                    <div className="space-y-4">
                        {testimonials.map((t, idx) => {
                            const name = t?.name?.toString().trim() || 'Anonymous';
                            const rating = clampRating(t?.rating ?? 5);
                            const message = t?.message?.toString() || '';
                            const key = t?.id ?? idx;

                            return (
                                <div key={key} className="bg-[#fffdfd] rounded-xl p-5 shadow-md">
                                    <h4 className="m-0 mb-1.5 text-[1.1rem] font-bold text-black">{name}</h4>
                                    <StarRating rating={rating} />
                                    <p className="m-0 text-[#0a0a0a] whitespace-pre-wrap leading-6 break-words">
                                        {message}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}