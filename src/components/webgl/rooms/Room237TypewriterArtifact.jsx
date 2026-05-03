import { useCursor, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import AiProjectPanel from "../../ui/AiProjectPanel.jsx";

const HOTSPOT_POSITION = new THREE.Vector3(0.02, 0.98, 2.72);
const INTERACT_DISTANCE = 2.18;

function TypewriterModel() {
  const { scene } = useGLTF("/models/typewriter.glb");

  const prepared = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;

        if ("roughness" in child.material) {
          child.material.roughness = 0.42;
          child.material.metalness = 0.16;
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeX = Math.max(size.x, 0.1);
    const safeY = Math.max(size.y, 0.1);
    const safeZ = Math.max(size.z, 0.1);
    const scale = Math.min(0.62 / safeX, 0.32 / safeY, 0.5 / safeZ);

    return {
      cloned,
      scale,
      position: new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale),
    };
  }, [scene]);

  return (
    <group position={prepared.position} scale={prepared.scale}>
      <primitive object={prepared.cloned} />
    </group>
  );
}

export default function Room237TypewriterArtifact() {
  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const { camera } = useThree();
  const artifactRef = useRef(null);
  const auraRef = useRef(null);
  const haloRef = useRef(null);
  const shimmerRef = useRef(null);
  const glowRef = useRef(null);
  const panelAnchorRef = useRef(null);
  const interactLightRef = useRef(null);
  const nearRef = useRef(false);
  const sparkRefs = useRef([]);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const hotspotWorld = useMemo(() => HOTSPOT_POSITION.clone(), []);
  const cameraPlanar = useMemo(() => new THREE.Vector3(), []);
  const sparkAngles = useMemo(
    () => [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3],
    [],
  );

  useCursor(hovered);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Enter" || !nearRef.current) {
        return;
      }

      event.preventDefault();
      setIsOpen((value) => !value);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("room-interaction-prompt", {
        detail: { roomId: "room237", visible: isNear && !isOpen },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("room-interaction-prompt", {
          detail: { roomId: "room237", visible: false },
        }),
      );
    };
  }, [isNear, isOpen]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const active = hovered || isNear;
    const lift = Math.sin(elapsed * 1.7) * 0.042;
    const pulse = active ? 1.06 + Math.sin(elapsed * 4.2) * 0.08 : 1.01 + Math.sin(elapsed * 2.1) * 0.03;

    cameraPlanar.copy(camera.position);
    cameraPlanar.y = HOTSPOT_POSITION.y;

    const nearNow = cameraPlanar.distanceTo(hotspotWorld) <= INTERACT_DISTANCE;

    if (nearNow !== nearRef.current) {
      nearRef.current = nearNow;
      setIsNear(nearNow);
    }

    if (artifactRef.current) {
      artifactRef.current.position.set(HOTSPOT_POSITION.x, HOTSPOT_POSITION.y + lift, HOTSPOT_POSITION.z);
      artifactRef.current.rotation.y = elapsed * 0.52;
      artifactRef.current.rotation.x = Math.sin(elapsed * 1.6) * 0.04;
      artifactRef.current.scale.setScalar(pulse);
    }

    if (auraRef.current) {
      auraRef.current.material.opacity = active ? 0.56 : 0.24;
      auraRef.current.scale.setScalar(active ? 1.26 + Math.sin(elapsed * 4.4) * 0.08 : 1.08);
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = elapsed * 1.12;
      haloRef.current.material.opacity = active ? 0.42 : 0.16;
    }

    if (shimmerRef.current) {
      shimmerRef.current.rotation.z = -elapsed * 0.84;
      shimmerRef.current.material.opacity = active ? 0.32 : 0.12;
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = active ? 0.72 : 0.32;
      glowRef.current.scale.setScalar(active ? 1.24 + Math.sin(elapsed * 5.2) * 0.1 : 1.08);
    }

    if (interactLightRef.current) {
      interactLightRef.current.intensity = active ? 3.8 + Math.sin(elapsed * 6.2) * 0.8 : 1.7 + Math.sin(elapsed * 2.4) * 0.18;
    }

    sparkRefs.current.forEach((spark, index) => {
      if (!spark) {
        return;
      }

      const orbit = sparkAngles[index] + elapsed * 1.5;
      const radius = active ? 0.22 + Math.sin(elapsed * 3.6 + index) * 0.03 : 0.17 + Math.sin(elapsed * 2.1 + index) * 0.014;
      spark.position.set(
        Math.cos(orbit) * radius,
        0.08 + Math.sin(elapsed * 4.8 + index * 0.85) * 0.06,
        Math.sin(orbit) * radius,
      );
      spark.scale.setScalar(active ? 1.12 + Math.sin(elapsed * 7.6 + index) * 0.16 : 0.88);
      spark.material.opacity = active ? 0.88 : 0.38;
    });

    if (panelAnchorRef.current && isOpen) {
      camera.getWorldDirection(forward);
      right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

      targetPosition
        .copy(camera.position)
        .add(forward.multiplyScalar(1.95))
        .add(right.multiplyScalar(0.34))
        .add(up.multiplyScalar(0.08));

      panelAnchorRef.current.position.lerp(targetPosition, 0.18);
      targetQuaternion.copy(camera.quaternion);
      panelAnchorRef.current.quaternion.slerp(targetQuaternion, 0.22);
    }
  });

  const handleHover = (event) => {
    event.stopPropagation();
    setHovered(true);
  };

  const handleLeave = (event) => {
    event.stopPropagation();
    setHovered(false);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    setIsOpen((value) => !value);
  };

  return (
    <>
      <pointLight
        ref={interactLightRef}
        position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y + 0.22, HOTSPOT_POSITION.z]}
        color="#a8ffd4"
        intensity={1.7}
        distance={3}
        decay={2}
      />

      <mesh
        ref={glowRef}
        position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y - 0.34, HOTSPOT_POSITION.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.36, 40]} />
        <meshBasicMaterial color="#56ffb4" transparent opacity={0.32} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        ref={auraRef}
        position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y - 0.32, HOTSPOT_POSITION.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={handleHover}
        onPointerOut={handleLeave}
        onClick={handleClick}
      >
        <ringGeometry args={[0.24, 0.38, 64]} />
        <meshBasicMaterial color="#9ef7d0" transparent opacity={0.24} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        ref={haloRef}
        position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y - 0.31, HOTSPOT_POSITION.z]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={handleHover}
        onPointerOut={handleLeave}
        onClick={handleClick}
      >
        <torusGeometry args={[0.3, 0.018, 16, 64]} />
        <meshBasicMaterial color="#d6fff1" transparent opacity={0.16} />
      </mesh>

      <mesh ref={shimmerRef} position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y - 0.3, HOTSPOT_POSITION.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 64]} />
        <meshBasicMaterial color="#d6fff1" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      <group ref={artifactRef}>
        <group onPointerOver={handleHover} onPointerOut={handleLeave} onClick={handleClick}>
          <TypewriterModel />
        </group>

        {sparkAngles.map((_, index) => (
          <mesh
            key={index}
            ref={(element) => {
              sparkRefs.current[index] = element;
            }}
          >
            <sphereGeometry args={[0.016, 10, 10]} />
            <meshBasicMaterial color={index % 2 === 0 ? "#b3ffd8" : "#dffff0"} transparent opacity={0.42} />
          </mesh>
        ))}

        <mesh visible={false} onPointerOver={handleHover} onPointerOut={handleLeave} onClick={handleClick}>
          <boxGeometry args={[0.74, 0.42, 0.64]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      <group ref={panelAnchorRef}>
        <AiProjectPanel isOpen={isOpen} onClose={() => setIsOpen(false)} projectKey="entropy" />
      </group>
    </>
  );
}

useGLTF.preload("/models/typewriter.glb");
