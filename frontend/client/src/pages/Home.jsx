// src/components/Home.jsx
import React, { Suspense, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, } from "@react-three/fiber";
import {
    OrbitControls,
    useGLTF,
    Html,
    Environment,
    useTexture,
    Preload,
} from "@react-three/drei";
import { Link } from "react-router-dom";
;

// Preload GLTF and textures so next route has no loader flash
function PreloadAssets() {
    useEffect(() => {
        try {
            useGLTF.preload("/assets/iphone_6_model.glb");
            useTexture.preload("/assets/CRTV_pic.jpg");
        } catch (e) {
            // ignore if already cached or during SSR
        }
    }, []);
    return null;
}

/**
 * Helper: PhoneModel
 * - Loads the GLTF phone model with useGLTF (from @react-three/drei)
 * - Centers / scales / positions the model similar to your original script
 * - Adds a placeholder screen mesh so you can later set a texture (image/video)
 */
function PhoneModel() {
    const gltf = useGLTF("/assets/iphone_6_model.glb", true);
    const group = useRef();
    const screenTexture = useTexture("/assets/CRTV_pic.jpg");

    useMemo(() => {
        if (!gltf || !gltf.scene) return;

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.center();
                child.castShadow = true;
                child.receiveShadow = true;

                //  Apply the texture to likely screen meshes
                const name = child.name.toLowerCase();
                if (
                    name.includes("plane004") ||
                    name.includes("plane005") ||
                    name.includes("plane008")
                ) {
                    child.material = new THREE.MeshStandardMaterial({
                        map: screenTexture,
                        metalness: 0,
                        roughness: 0.4,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.05,
                    });
                }
            }
        });
    }, [gltf, screenTexture]);





    return (
        <group ref={group} position={[2.5, -3, 0]} rotation-y={Math.PI / 1.3} scale={[40, 40, 40]}>
            <primitive object={gltf.scene} />
        </group>
    );
}




/**
 * CameraRig
 * - A convenience component to position and tidily manage the camera.
 * - You can animate the camera here or respond to interactions for parallax effects.
 */
function CameraRig() {
    const { camera } = useThree();

    // initial camera config similar to your original code
    useMemo(() => {
        camera.position.set(-1, 0, 6);
        camera.lookAt(new THREE.Vector3(2, 0, 0));
    }, [camera]);

    return null;
}

/**
 * Loader fallback
 */
function Loader() {
    return (
        <Html center>
            <div className="text-white text-sm">Loading scene...</div>
        </Html>
    );
}

/**
 * Home component - the exported React component that renders the whole landing canvas
 * - Fullscreen Canvas
 * - Environment HDRI
 * - Phone model (with placeholder screen)
 * - Stars and planets
 * - Constrained OrbitControls to allow dragging like the original site
 */
export default function Home() {
    // If you later want to feed a texture to the phone screen (image/video),
    // load it here with useTexture or create a VideoTexture.
    // const screenTexture = useTexture('/assets/myscreen.png');
 //   const screenTexture = useTexture('/assets/CRTV_pic.jpg');

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
            <PreloadAssets />
            {/* Overlay UI (logo, vertical nav, social icons) rendered by React normally */}
            <div className="absolute top-9 left-9 z-20 flex flex-col items-start gap-6 ">
                <img src="/assets/logo.png" alt="logo" className="w-16 h-auto mb-2" />
                <nav className="flex flex-col gap-4 font-sans font-black tracking-wide ">
                    <Link
                        to="/videos"
                        state={{ startRotation: { x: 0, y: Math.PI / 1.3, z: 0 } }}
                        className=" text-[40px] font-black !text-[#388B4C]"
                    >
                        VIDEOS
                    </Link>
                    <a  className=" text-[40px] font-black !text-[#388B4C]">SHOP</a>
                    <a  className=" text-[40px] font-black !text-[#388B4C]">BOOKINGS</a>
                    <a  className=" text-[40px] font-black !text-[#388B4C]">GALLERY</a>
                    <a  className=" text-[40px] font-black !text-[#388B4C]">TESTIMONIALS</a>
                    <a className=" text-[40px] font-black !text-[#388B4C]">ABOUT</a>
                </nav>
            </div>

            {/* Social icons centered bottom */}
            {/*<div style={styles.bottomSocial}>*/}
            {/*    /!* Replace with your SVG icons or <img /> files *!/*/}
            {/*    <span style={styles.socialIcon}>▶</span>*/}
            {/*    <span style={styles.socialIcon}>📸</span>*/}
            {/*    <span style={styles.socialIcon}>🐦</span>*/}
            {/*    <span style={styles.socialIcon}>🎵</span>*/}
            {/*</div>*/}

            {/* The 3D Canvas */}
            <Canvas
                shadows
                camera={{ position: [-1, 0, 6], fov: 75 }}
                className={"absolute top-0 left-0 w-full h-full z-0"
            }
            >
                {/* Suspense allows us to show a loader until async assets (GLB, HDRI) are ready */}
                <Suspense fallback={null}>
                    <Preload all />
                    <CameraRig />

                    {/* Environment HDRI:
              - Use an HDRI file placed in /public/assets/hdri.hdr
              - Environment from drei will apply it as both background and lighting if set.
              - NOTE: three.js must be built with RGBELoader support (drei handles it).
          */}
                    <Environment
                        files="/assets/hdri.hdr"
                        background={true} // set to true if you want the HDRI to replace the scene.background
                        blur={0.1}
                    />

                    {/* subtle ambient to mimic your ambientLight */}
                    <ambientLight color={0x111122} intensity={0.2} />

                    {/* directional light to mimic the 'distant star' */}
                    <directionalLight color={0xffffcc} intensity={2} position={[10, 5, 10]} />

                    {/* optional helper (comment out in production) */}
                    {/* <directionalLightHelper args={[directionalLight, 5]} /> */}

                    {/* Phone model (with placeholder screen) */}
                    <PhoneModel />

                    {/* OrbitControls (constrained) - allows drag to rotate with limits */}
                    <OrbitControls
                        enableDamping={true}
                        enableZoom={true}
                        minDistance={4}
                        maxDistance={10}
                        minAzimuthAngle={-Math.PI / 4}
                        maxAzimuthAngle={Math.PI / 4}
                        minPolarAngle={Math.PI / 3}
                        maxPolarAngle={(2 * Math.PI) / 3}
                        // optional: make rotation feel like drag-only (disables panning)
                        enablePan={false}
                        // damping factor
                        dampingFactor={0.08}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
