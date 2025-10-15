import React, { Suspense, useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Environment, useGLTF, OrbitControls, Preload } from "@react-three/drei";
import { useNavigate, useLocation } from "react-router-dom"; // optional if you use react-router

/**
 * PhoneModel component
 * - Reuses your same phone .glb model
 * - Adds a blank / neutral material on the screen where we’ll overlay the YouTube iframe
 */
function PhoneModel({ facingUser, startRotation, onReady }) {
    const gltf = useGLTF("/assets/iphone_6_model.glb", true);
    const group = useRef();
    const readyRef = useRef(false);

    useMemo(() => {
        if (!gltf || !gltf.scene) return;
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.center();
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [gltf]);

    // Initialize starting rotation based on route state or default
    useEffect(() => {
        if (group.current && startRotation) {
            group.current.rotation.set(startRotation.x, startRotation.y, startRotation.z);
        }
    }, [startRotation]);

    // Animate rotation of phone toward camera when facingUser is true
    useFrame((_, dt) => {
        if (!group.current) return;
        const stiffness = 8;
        const targetY = facingUser ? 0 : Math.PI / 1.3;
        group.current.rotation.y = THREE.MathUtils.damp(
            group.current.rotation.y,
            targetY,
            stiffness,
            dt
        );
        // Add a fixed landscape roll around Z
        const targetZ = -Math.PI / 2; // landscape-left; use -Math.PI/2 for landscape-right
        group.current.rotation.z = THREE.MathUtils.damp(
            group.current.rotation.z,
            targetZ,
            stiffness,
            dt
        );

        // Flip about the X axis (180°)
        const targetX = Math.PI;
        group.current.rotation.x = THREE.MathUtils.damp(
            group.current.rotation.x,
            targetX,
            stiffness,
            dt
        );

        const close =
            Math.abs(group.current.rotation.x - targetX) < 0.05 &&
            Math.abs(group.current.rotation.y - targetY) < 0.05 &&
            Math.abs(group.current.rotation.z - targetZ) < 0.05;

        if (!readyRef.current && close) {
            readyRef.current = true;
            onReady?.();
        }
    });

    return (
        <group ref={group} position={[-5, 2, 0]} scale={[40, 40, 40]}>
            <primitive object={gltf.scene} />
        </group>
    );
}

/**
 * CameraRig
 * - Smoothly interpolates the camera toward a “front-facing” position
 * - This gives that cinematic “turn toward screen” effect
 */
function CameraRig({ active }) {
    const { camera } = useThree();
    useFrame((_, dt) => {
        const target = active
            ? new THREE.Vector3(1, 1.5, 4) // front-facing position
            : new THREE.Vector3(-1, 0, 6); // default position
        camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, 4, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, 4, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 4, dt);
        if (active) camera.lookAt(0, 1.5, 0);
    });
    return null;
}

/**
 * Loader fallback component
 * - Simple text while loading assets
 */
function Loader() {
    return (
        <Html center>
            <div className="text-white text-sm">Loading video scene...</div>
        </Html>
    );
}

/**
 * Videos.jsx
 * - The main component for the “Videos” section
 * - Shows the phone rotated to face user
 * - Embeds YouTube playlist in the screen
 * - Includes “Back” button
 */
export default function Videos() {
    const [facingUser] = useState(true);
    const [ready, setReady] = useState(false);
    const navigate = useNavigate(); // optional navigation back to Home
    const { state } = useLocation();
    const startRotation = state?.startRotation || { x: 0, y: Math.PI / 1.3, z: 0 };

    // YouTube Playlist state
    const [videos, setVideos] = useState([]);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [ytError, setYtError] = useState(null);

    // API key; allow override with env var if present
    const apiKey = import.meta?.env?.VITE_YT_API_KEY || "AIzaSyBtwoYiS91VUqmFVAgBVhhQOEZaxhQqtQ4";
    // Default to the playlist already used on this page if none provided
    const playlistId = import.meta?.env?.VITE_YT_PLAYLIST_ID || "PLt0fJ93Y4T4or_SqF7GybIBGZGjK8HG8t";
    const maxResults = 10;

    useEffect(() => {
        let ignore = false;
        async function loadPlaylist() {
            try {
                const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${playlistId}&key=${apiKey}`;
                const res = await fetch(url);
                const data = await res.json();
                if (ignore) return;
                if (data?.items?.length) {
                    setVideos(data.items);
                    setCurrentVideoId(data.items[0].contentDetails.videoId);
                } else {
                    setYtError("No videos found in playlist or API error.");
                }
            } catch (e) {
                if (!ignore) setYtError(e?.message || "Failed to load YouTube playlist.");
            }
        }
        loadPlaylist();
        return () => {
            ignore = true;
        };
    }, [apiKey, playlistId]);

    // This positions the embedded YouTube player within the phone screen
    // Converted to a container with iframe and a clickable playlist.

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
            {/* BACK button overlay */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-5 left-7 text-[40px] font-bold text-[#388B4C] z-20 cursor-pointer bg-transparent"
            >
                ◀ BACK
            </button>

            <Canvas
                shadows
                camera={{ position: [0, 1.5, 6], fov: 70 }}
                className="absolute top-0 left-0 w-full h-full z-0"
            >
                <Suspense fallback={null}>
                    <Preload all />
                    <CameraRig active={facingUser} />

                    {/* Environment HDRI (supernova / stars look) */}
                    <Environment
                        files="/assets/hdri.hdr"
                        background={true}
                        blur={0.1}
                    />

                    {/* Subtle ambient lighting */}
                    <ambientLight color={0x3344ff} intensity={0.3} />
                    <directionalLight
                        color={0x99bbff}
                        intensity={2}
                        position={[10, 10, 10]}
                    />

                    {/* The phone model */}
                    <PhoneModel facingUser={facingUser} startRotation={startRotation} onReady={() => setReady(true)} />

                    {/* YouTube player embedded into the phone screen (playlist rendered separately at right) */}
                    {ready && (
                        <Html
                            position={[-1.5, 2, 0.25]} // adjust for screen position
                            transform
                            distanceFactor={1.2}
                        >
                            {currentVideoId ? (
                                <iframe
                                    id="player"
                                    width="1720"
                                    height="967,50"
                                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=0`}
                                    title="YouTube video player"
                                    style={{ borderRadius: '12px', border: 'none' }}
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : (
                                <div style={{ width: 1200, height: 675, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', background: 'rgba(255,255,255,0.8)', borderRadius: 12 }}>
                                    {ytError ? `Error: ${ytError}` : 'Loading video...'}
                                </div>
                            )}
                        </Html>
                    )}

                    {/* Optional OrbitControls if you want slight interactivity */}
                    <OrbitControls
                        enableDamping
                        enabled={ready}
                        enableZoom={false}
                        enablePan={false}
                        dampingFactor={0.05}
                    />
                </Suspense>
            </Canvas>

            {/* Right-side playlist overlay (always visible) */}
            <div
                className="absolute top-0 right-0 h-full w-[380px] max-w-[45vw] z-20 p-4"
                style={{ pointerEvents: 'auto' }}
            >
                {/* Frosted-glass container with hidden scrollbar */}
                <div
                    className="h-full w-full overflow-y-auto rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md bg-white/25 hide-scrollbar"
                    style={{
                        WebkitBackdropFilter: 'blur(10px)',
                        backdropFilter: 'blur(10px)',
                        msOverflowStyle: 'none', // IE and Edge
                        scrollbarWidth: 'none' // Firefox
                    }}
                >
                    {/* Hide scrollbar for WebKit */}
                    <style>{`.hide-scrollbar::-webkit-scrollbar{display:none;}`}</style>

                    {/* Header: title left, YouTube logo right */}
                    <div className="flex items-center justify-between mb-3 px-2 py-1 bg-white/30 rounded-lg">
                        <h2 className="m-0 text-[12px] font-extrabold uppercase tracking-wider text-slate-900/90">CRTV SHOT IT</h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-red-600/90">
                            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.7 15.4V8.6L15.8 12l-6.1 3.4Z"/>
                        </svg>
                    </div>

                    {ytError && (
                        <div className="text-slate-900 bg-white/60 rounded-md p-3 mb-3 shadow-sm">{ytError}</div>
                    )}
                    {!videos.length && !ytError && (
                        <div className="text-slate-900 bg-white/60 rounded-md p-3 mb-3 shadow-sm">Loading playlist...</div>
                    )}

                    {/* Videos list */}
                    <div className="flex flex-col gap-3">
                        {videos.map((item) => {
                            const videoId = item.contentDetails?.videoId;
                            const title = item.snippet?.title;
                            const thumbnail = item.snippet?.thumbnails?.medium?.url;
                            const active = currentVideoId === videoId;
                            const author = item.snippet?.videoOwnerChannelTitle;
                            return (
                                <button
                                    key={videoId}
                                    onClick={() => setCurrentVideoId(videoId)}
                                    className={`group w-full text-left rounded-xl p-2 transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.08)] ${active ? 'bg-white/80 ring-2 ring-sky-300/60' : 'bg-white/50 hover:bg-white/70 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/60'} hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]`}
                                >
                                    <div className="flex gap-3 items-start">
                                        <img src={thumbnail} alt={title} className="w-[120px] h-[68px] object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="m-0 text-[13px] font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-slate-950">
                                                {title}
                                            </p>
                                            <p className="m-0 mt-1 text-[11px] text-slate-600/90 truncate">
                                                {author || 'Unknown Channel'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
