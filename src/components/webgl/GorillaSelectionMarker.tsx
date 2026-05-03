import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function MarkerScene() {
  const markerRef = useRef<THREE.Mesh | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const haloRef = useRef<THREE.Mesh | null>(null);
  const warmGold = useMemo(() => new THREE.Color("#f4cf63"), []);
  const hotGold = useMemo(() => new THREE.Color("#fff6bf"), []);
  const flareGold = useMemo(() => new THREE.Color("#ffd24d"), []);
  const glowColor = useMemo(() => new THREE.Color("#fff6cf"), []);
  const workingColor = useMemo(() => new THREE.Color(), []);
  const workingEmissive = useMemo(() => new THREE.Color(), []);
  const markerGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.44);
    shape.lineTo(-0.32, 0.18);
    shape.lineTo(0.32, 0.18);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: false,
      steps: 1,
    });

    geometry.center();
    return geometry;
  }, []);
  const haloGeometry = useMemo(() => {
    const outerShape = new THREE.Shape();
    outerShape.moveTo(0, -0.6);
    outerShape.lineTo(-0.44, 0.27);
    outerShape.lineTo(0.44, 0.27);
    outerShape.closePath();

    const innerPath = new THREE.Path();
    innerPath.moveTo(0, -0.42);
    innerPath.lineTo(0.28, 0.15);
    innerPath.lineTo(-0.28, 0.15);
    innerPath.closePath();

    outerShape.holes.push(innerPath);

    const geometry = new THREE.ShapeGeometry(outerShape);
    geometry.center();
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const floatY = Math.sin(elapsed * 2.8) * 0.11;
    const flicker = 0.96 + Math.sin(elapsed * 7.6) * 0.28 + Math.sin(elapsed * 18.4) * 0.12;
    const colorPulse = 0.56 + Math.sin(elapsed * 4.6) * 0.34 + Math.sin(elapsed * 11.8) * 0.12;
    const flarePulse = 0.5 + Math.sin(elapsed * 3.8) * 0.34 + Math.sin(elapsed * 9.4) * 0.12;

    if (markerRef.current) {
      markerRef.current.position.y = floatY;
      markerRef.current.rotation.x = 0.1 + Math.sin(elapsed * 1.6) * 0.05;
      markerRef.current.rotation.y = Math.sin(elapsed * 2.8) * 0.62;
      markerRef.current.rotation.z = Math.sin(elapsed * 2.2) * 0.12;
      markerRef.current.scale.setScalar(1 + Math.sin(elapsed * 5.2) * 0.035);

      const material = markerRef.current.material as THREE.MeshStandardMaterial;
      workingColor
        .copy(warmGold)
        .lerp(hotGold, THREE.MathUtils.clamp(colorPulse, 0, 1))
        .lerp(flareGold, THREE.MathUtils.clamp(flarePulse * 0.4, 0, 1));
      workingEmissive
        .copy(glowColor)
        .lerp(hotGold, THREE.MathUtils.clamp(colorPulse, 0, 1))
        .lerp(flareGold, THREE.MathUtils.clamp(flarePulse * 0.24, 0, 1));
      material.color.copy(workingColor);
      material.emissive.copy(workingEmissive);
      material.emissiveIntensity = 1.18 * flicker;
    }

    if (pointLightRef.current) {
      pointLightRef.current.intensity = 3.1 + Math.sin(elapsed * 7.4) * 0.68 + Math.sin(elapsed * 14.8) * 0.28;
    }

    if (haloRef.current) {
      haloRef.current.position.y = floatY * 0.7;
      haloRef.current.rotation.z = elapsed * 0.46;
      haloRef.current.scale.setScalar(1.02 + Math.sin(elapsed * 3.4) * 0.14);
      const haloMaterial = haloRef.current.material as THREE.MeshBasicMaterial;
      haloMaterial.opacity = 0.18 + Math.sin(elapsed * 6.2) * 0.06 + Math.sin(elapsed * 14.4) * 0.03;
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} color="#fff4d2" />
      <directionalLight position={[2.4, 3.2, 2]} intensity={1.5} color="#fff7df" />
      <pointLight
        ref={pointLightRef}
        position={[0, 0.7, 1.8]}
        intensity={3.1}
        color="#ffd95e"
        distance={7}
        decay={2}
      />

      <mesh ref={haloRef} position={[0, 0, -0.05]} rotation={[0, 0, 0]} geometry={haloGeometry}>
        <meshBasicMaterial color="#ffe27e" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={markerRef} position={[0, 0, 0]} geometry={markerGeometry}>
        <meshStandardMaterial
          color={warmGold}
          emissive="#fff0b5"
          emissiveIntensity={0.42}
          roughness={0.22}
          metalness={0.14}
          flatShading
        />
      </mesh>
    </>
  );
}

export default function GorillaSelectionMarker() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 2.4], fov: 34, near: 0.1, far: 20 }}
    >
      <MarkerScene />
    </Canvas>
  );
}
