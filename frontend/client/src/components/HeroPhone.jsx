// src/components/HeroPhone.jsx
import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Phone model with video screen
function PhoneModel({ videoSrc }) {
    const { nodes, materials } = useGLTF("/assets/iphone_6_model.glb");
    const videoRef = useRef();
    const [video] = useState(() => {
        const vid = document.createElement("video");
        vid.src = videoSrc;
        vid.crossOrigin = "Anonymous";
        vid.loop = true;
        vid.muted = true;
        return vid;
    });

    React.useEffect(() => {
        video.play();
    }, [video]);

    // Create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    // Clone materials to avoid modifying the original
    const screenMaterial = materials.screen.clone();
    screenMaterial.map = videoTexture;
    screenMaterial.emissive = new THREE.Color(0xffffff);
    screenMaterial.emissiveMap = videoTexture;

    return (
        <group dispose={null}>
            <mesh
                geometry={nodes.body.geometry}
                material={materials.body}
                castShadow
                receiveShadow
            />
            <mesh
                geometry={nodes.screen.geometry}
                material={screenMaterial}
                castShadow
                receiveShadow
            />
            {/* Add other phone parts as needed */}
        </group>
    );
}

// Main component
const HeroPhone = ({ videoSrc = "/path/to/your/video.mp4" }) => {
    return (
        <div className="hero-phone-container w-full h-full">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <PhoneModel videoSrc={videoSrc} />
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
};

export default HeroPhone;