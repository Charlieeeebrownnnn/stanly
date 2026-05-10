import { useCursor, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import useIsSafari from "../../useIsSafari";
import AiProjectPanel from "../../ui/AiProjectPanel.jsx";

const HOTSPOT_POSITION = new THREE.Vector3(1.541, 0.54, 1.145);
const INTERACT_DISTANCE = 2.2;

function ChinaPorcelain() {
  const { scene } = useGLTF("/models/china.glb");

  const prepared = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;

        if ("roughness" in child.material) {
          child.material.roughness = 0.34;
          child.material.metalness = 0.08;
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeX = Math.max(size.x, 0.1);
    const safeY = Math.max(size.y, 0.1);
    const safeZ = Math.max(size.z, 0.1);
    const scale = Math.min(0.34 / safeX, 0.43 / safeY, 0.34 / safeZ);

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

export default function OrangeRoomArtifact() {
  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const isSafari = useIsSafari();
  const { camera } = useThree();
  const artifactRef = useRef(null);
  const auraRef = useRef(null);
  const haloRef = useRef(null);
  const glowRef = useRef(null);
  const panelAnchorRef = useRef(null);
  const panelSettledRef = useRef(false);
  const interactLightRef = useRef(null);
  const rimLightRef = useRef(null);
  const nearRef = useRef(false);
  const sparkRefs = useRef([]);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const hotspotWorld = useMemo(() => HOTSPOT_POSITION.clone(), []);
  const cameraPlanar = useMemo(() => new THREE.Vector3(), []);
  const warmGlow = useMemo(() => new THREE.Color("#ffd8af"), []);
  const coolPorcelain = useMemo(() => new THREE.Color("#d7efff"), []);
  const sparkAngles = useMemo(() => [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3], []);

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
        detail: { roomId: "orangeRoom", visible: isNear && !isOpen },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("room-interaction-prompt", {
          detail: { roomId: "orangeRoom", visible: false },
        }),
      );
    };
  }, [isNear, isOpen]);

  useEffect(() => {
    panelSettledRef.current = false;
  }, [isOpen, isSafari]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const active = hovered || isNear;
    const lift = Math.sin(elapsed * 2.4) * 0.022;
    const pulse = active ? 1.14 + Math.sin(elapsed * 7.4) * 0.11 : 1.05 + Math.sin(elapsed * 4.2) * 0.05;

    cameraPlanar.copy(camera.position);
    cameraPlanar.y = HOTSPOT_POSITION.y;

    const nearNow = cameraPlanar.distanceTo(hotspotWorld) <= INTERACT_DISTANCE;

    if (nearNow !== nearRef.current) {
      nearRef.current = nearNow;
      setIsNear(nearNow);
    }

    if (artifactRef.current) {
      artifactRef.current.position.set(HOTSPOT_POSITION.x, HOTSPOT_POSITION.y + lift, HOTSPOT_POSITION.z);
      artifactRef.current.rotation.y = 0.22 + Math.sin(elapsed * 1.25) * 0.18;
      artifactRef.current.scale.setScalar(pulse);
    }

    if (auraRef.current) {
      auraRef.current.material.opacity = active ? 0.76 : 0.4;
      auraRef.current.scale.setScalar(active ? 1.36 + Math.sin(elapsed * 6.2) * 0.06 : 1.14);
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = elapsed * 1.45;
      haloRef.current.material.opacity = active ? 0.72 : 0.3;
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = active ? 0.92 : 0.46;
      glowRef.current.scale.setScalar(active ? 1.28 + Math.sin(elapsed * 8.4) * 0.12 : 1.08 + Math.sin(elapsed * 3.4) * 0.05);
    }

    if (interactLightRef.current) {
      interactLightRef.current.intensity = active ? 5.6 + Math.sin(elapsed * 9.2) * 1.15 : 2.6 + Math.sin(elapsed * 4.4) * 0.35;
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity = active ? 2.2 + Math.sin(elapsed * 8.6) * 0.5 : 0.9 + Math.sin(elapsed * 3.6) * 0.16;
    }

    sparkRefs.current.forEach((spark, index) => {
      if (!spark) {
        return;
      }

      const orbit = sparkAngles[index] + elapsed * (active ? 2.8 : 1.6);
      const radius = active ? 0.19 + Math.sin(elapsed * 5.2 + index) * 0.035 : 0.15 + Math.sin(elapsed * 2.8 + index) * 0.015;
      spark.position.set(
        Math.cos(orbit) * radius,
        0.07 + Math.sin(elapsed * 6.4 + index * 0.8) * 0.06,
        Math.sin(orbit) * radius,
      );
      spark.scale.setScalar(active ? 1.22 + Math.sin(elapsed * 9.4 + index) * 0.22 : 0.9);
      spark.material.opacity = active ? 0.92 : 0.48;
    });

    if (panelAnchorRef.current && isOpen) {
      camera.getWorldDirection(forward);
      right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

      targetPosition
        .copy(camera.position)
        .add(forward.multiplyScalar(2.05))
        .add(right.multiplyScalar(0.34))
        .add(up.multiplyScalar(0.1));

      targetQuaternion.copy(camera.quaternion);

      if (isSafari) {
        if (!panelSettledRef.current) {
          panelAnchorRef.current.position.copy(targetPosition);
          panelAnchorRef.current.quaternion.copy(targetQuaternion);
          panelSettledRef.current = true;
        }
      } else {
        panelAnchorRef.current.position.lerp(targetPosition, 0.18);
        panelAnchorRef.current.quaternion.slerp(targetQuaternion, 0.22);
      }
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
        position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y + 0.26, HOTSPOT_POSITION.z]}
        color="#ffd4a8"
        intensity={2.6}
        distance={3.6}
        decay={2}
      />

      <pointLight
        ref={rimLightRef}
        position={[HOTSPOT_POSITION.x - 0.06, HOTSPOT_POSITION.y + 0.18, HOTSPOT_POSITION.z + 0.04]}
        color="#8ecfff"
        intensity={0.9}
        distance={2.2}
        decay={2}
      />

      <mesh
        ref={glowRef}
        position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y + 0.01, HOTSPOT_POSITION.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.32, 40]} />
        <meshBasicMaterial color="#f7b36f" transparent opacity={0.46} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        ref={auraRef}
        position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y + 0.012, HOTSPOT_POSITION.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={handleHover}
        onPointerOut={handleLeave}
        onClick={handleClick}
      >
        <ringGeometry args={[0.22, 0.36, 64]} />
        <meshBasicMaterial color={warmGlow} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        ref={haloRef}
        position={[HOTSPOT_POSITION.x, HOTSPOT_POSITION.y + 0.022, HOTSPOT_POSITION.z]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={handleHover}
        onPointerOut={handleLeave}
        onClick={handleClick}
      >
        <torusGeometry args={[0.28, 0.02, 16, 64]} />
        <meshBasicMaterial color={coolPorcelain} transparent opacity={0.3} />
      </mesh>

      <group ref={artifactRef}>
        <group onPointerOver={handleHover} onPointerOut={handleLeave} onClick={handleClick}>
          <ChinaPorcelain />
        </group>

        {sparkAngles.map((_, index) => (
          <mesh
            key={index}
            ref={(element) => {
              sparkRefs.current[index] = element;
            }}
          >
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshBasicMaterial color={index % 2 === 0 ? "#ffe6c8" : "#b8e5ff"} transparent opacity={0.5} />
          </mesh>
        ))}

        <mesh visible={false} onPointerOver={handleHover} onPointerOut={handleLeave} onClick={handleClick}>
          <boxGeometry args={[0.5, 0.54, 0.5]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      <group ref={panelAnchorRef}>
        <AiProjectPanel isOpen={isOpen} onClose={() => setIsOpen(false)} projectKey="museum" />
      </group>
    </>
  );
}

useGLTF.preload("/models/china.glb");
