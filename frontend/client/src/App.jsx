import {BrowserRouter, Route, Routes} from "react-router-dom";
import React from "react";
import Home from "./pages/Home.jsx";
import Videos from "./pages/Videos.jsx";

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
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    );
}

export default App;
