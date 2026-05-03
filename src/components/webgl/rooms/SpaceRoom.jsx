import { Html, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import AiProjectPanel from "../../ui/AiProjectPanel.jsx";

const HOTSPOT_POSITION = new THREE.Vector3(2.1, 0.82, 1.5);
const TILE_POSITION = [2.1, 0.03, 1.5];
const INTERACT_DISTANCE = 2.2;

export default function SpaceRoom() {
  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const { camera } = useThree();
  const coreRef = useRef(null);
  const auraRef = useRef(null);
  const haloRef = useRef(null);
  const panelAnchorRef = useRef(null);
  const interactLightRef = useRef(null);
  const nearRef = useRef(false);
  const shimmerRef = useRef(null);
  const particleRefs = useRef([]);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const hotspotWorld = useMemo(() => HOTSPOT_POSITION.clone(), []);
  const cameraPlanar = useMemo(() => new THREE.Vector3(), []);
  const particleAngles = useMemo(() => [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3], []);

  useCursor(hovered);

  const color = useMemo(() => new THREE.Color("#89d4ff"), []);
  const warmGlow = useMemo(() => new THREE.Color("#dce9ff"), []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Enter") {
        return;
      }

      if (!nearRef.current) {
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
        detail: { roomId: "spaceRoom", visible: isNear && !isOpen },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("room-interaction-prompt", {
          detail: { roomId: "spaceRoom", visible: false },
        }),
      );
    };
  }, [isNear, isOpen]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const lift = Math.sin(elapsed * 1.8) * 0.05;
    const active = hovered || isNear;
    const pulse = active ? 1.16 + Math.sin(elapsed * 3.5) * 0.14 : 1.02 + Math.sin(elapsed * 2.1) * 0.06;
    const haloScale = active ? 1.36 + Math.sin(elapsed * 3.1) * 0.18 : 1.08 + Math.sin(elapsed * 1.7) * 0.08;
    const flicker = 0.92 + Math.sin(elapsed * 5.8) * 0.16 + Math.sin(elapsed * 12.8) * 0.08;

    cameraPlanar.copy(camera.position);
    cameraPlanar.y = HOTSPOT_POSITION.y;

    const nearNow = cameraPlanar.distanceTo(hotspotWorld) <= INTERACT_DISTANCE;

    if (nearNow !== nearRef.current) {
      nearRef.current = nearNow;
      setIsNear(nearNow);
    }

    if (coreRef.current) {
      coreRef.current.position.y = HOTSPOT_POSITION.y + lift;
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.material.emissiveIntensity = active ? 3 * flicker : 1.95 * flicker;
    }

    if (auraRef.current) {
      auraRef.current.position.y = HOTSPOT_POSITION.y + lift - 0.02;
      auraRef.current.scale.setScalar(haloScale);
      auraRef.current.material.opacity = active ? 0.52 : 0.26;
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = elapsed * 0.72;
      haloRef.current.material.opacity = active ? 0.46 : 0.16;
    }

    if (shimmerRef.current) {
      shimmerRef.current.rotation.z = -elapsed * 1.1;
      shimmerRef.current.scale.setScalar(active ? 1.14 + Math.sin(elapsed * 4.2) * 0.08 : 1);
      shimmerRef.current.material.opacity = active ? 0.34 : 0.14;
    }

    particleRefs.current.forEach((particle, index) => {
      if (!particle) {
        return;
      }

      const orbit = particleAngles[index] + elapsed * 0.9;
      const radius = active ? 0.44 + Math.sin(elapsed * 2.4 + index) * 0.03 : 0.38 + Math.sin(elapsed * 1.5 + index) * 0.02;
      particle.position.set(Math.cos(orbit) * radius, Math.sin(elapsed * 2 + index) * 0.03, Math.sin(orbit) * radius);
      particle.material.opacity = active ? 0.78 : 0.42;
      particle.scale.setScalar(active ? 1.08 : 0.92);
    });

    if (interactLightRef.current) {
      interactLightRef.current.intensity = active ? 3.25 + Math.sin(elapsed * 4.6) * 0.7 : 1.55 + Math.sin(elapsed * 2.8) * 0.18;
    }

    if (panelAnchorRef.current && isOpen) {
      // Keep the panel in front of the active camera so it reads like a narrative overlay,
      // while still existing inside the 3D world via Html transform.
      camera.getWorldDirection(forward);
      right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

      targetPosition
        .copy(camera.position)
        .add(forward.multiplyScalar(2.1))
        .add(right.multiplyScalar(0.34))
        .add(up.multiplyScalar(0.12));

      panelAnchorRef.current.position.lerp(targetPosition, 0.18);
      targetQuaternion.copy(camera.quaternion);
      panelAnchorRef.current.quaternion.slerp(targetQuaternion, 0.22);
    }
  });

  return (
    <>
      <group position={HOTSPOT_POSITION}>
        <mesh position={[0, -0.72, 0]} receiveShadow>
          <cylinderGeometry args={[0.52, 0.52, 0.04, 6]} />
          <meshStandardMaterial color="#f4ecd9" emissive="#9ccfff" emissiveIntensity={0.18} />
        </mesh>

        <pointLight
          ref={interactLightRef}
          position={[0, 0.16, 0]}
          color="#8bdcff"
          intensity={1.45}
          distance={2.8}
          decay={2}
        />

        <mesh
          ref={auraRef}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerOver={(event) => {
            // R3F pointer events need stopPropagation so the room model behind the hotspot
            // does not also receive the hover/click and steal the interaction state.
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            setHovered(false);
          }}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((value) => !value);
          }}
        >
          <ringGeometry args={[0.25, 0.52, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} side={THREE.DoubleSide} />
        </mesh>

        <mesh
          ref={haloRef}
          rotation={[Math.PI / 2, 0, 0]}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            setHovered(false);
          }}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((value) => !value);
          }}
        >
          <torusGeometry args={[0.34, 0.028, 16, 48]} />
          <meshBasicMaterial color={warmGlow} transparent opacity={0.2} />
        </mesh>

        <mesh ref={shimmerRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.47, 64]} />
          <meshBasicMaterial color="#c9ecff" transparent opacity={0.14} side={THREE.DoubleSide} />
        </mesh>

        <mesh
          ref={coreRef}
          castShadow
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            setHovered(false);
          }}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((value) => !value);
          }}
        >
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial
            color="#f7fbff"
            emissive="#7fd6ff"
            emissiveIntensity={1.7}
            roughness={0.16}
            metalness={0.38}
          />
        </mesh>

        {particleAngles.map((_, index) => (
          <mesh
            key={index}
            ref={(element) => {
              particleRefs.current[index] = element;
            }}
          >
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshBasicMaterial color="#dff7ff" transparent opacity={0.42} />
          </mesh>
        ))}

        {/* Invisible click volume makes the hotspot forgiving without forcing the visible mesh to be large. */}
        <mesh
          visible={false}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            setHovered(false);
          }}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((value) => !value);
          }}
        >
          <boxGeometry args={[0.9, 1.1, 0.9]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      <mesh position={TILE_POSITION} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.78, 40]} />
        <meshStandardMaterial
          color="#f3efe4"
          emissive="#8fd3ff"
          emissiveIntensity={hovered || isNear ? 0.34 : 0.1}
        />
      </mesh>

      <group ref={panelAnchorRef}>
        <AiProjectPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </group>
    </>
  );
}
