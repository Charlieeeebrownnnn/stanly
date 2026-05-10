import { useCursor, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import useIsSafari from "../../useIsSafari";
import ProjectLorePanel from "../../ui/ProjectLorePanel";

const COVER_POSITION = new THREE.Vector3(-1.6, 2.9, -0.9);
const COVER_ROTATION: [number, number, number] = [0, 1.5, 0];
const COVER_SIZE: [number, number, number] = [1.21, 1.11, 0.06];
const FRAME_SIZE: [number, number, number] = [1.29, 1.19, 0.08];
const AXE_POSITION = new THREE.Vector3(-1.2, 2.85, -0.9);
const AXE_BASE_ROTATION: [number, number, number] = [0.18, 1.6, -0.79];
const AXE_PIVOT_ROTATION: [number, number, number] = [0, 1.8, 0];
const AXE_SCALE = 0.92;
const INTERACT_DISTANCE = 1.45;
const AXE_PIVOT_OFFSET = new THREE.Vector3(0.24, -0.06, 0.02);
const ARTIFACT_ID = "axe";

function AxeModel() {
  const { scene } = useGLTF("/models/simple_axe.glb");

  const prepared = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;

        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            if ("roughness" in material) {
              material.roughness = Math.min(material.roughness + 0.12, 1);
            }
          });
        } else if ("roughness" in child.material) {
          child.material.roughness = Math.min(child.material.roughness + 0.12, 1);
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeX = Math.max(size.x, 0.1);
    const safeY = Math.max(size.y, 0.1);
    const safeZ = Math.max(size.z, 0.1);
    const scale = Math.min(AXE_SCALE / safeX, (AXE_SCALE * 1.2) / safeY, (AXE_SCALE * 0.42) / safeZ);

    return {
      cloned,
      scale,
      position: new THREE.Vector3(-center.x * scale, -center.y * scale, -center.z * scale),
    };
  }, [scene]);

  return (
    <group
      position={[
        prepared.position.x + AXE_PIVOT_OFFSET.x,
        prepared.position.y + AXE_PIVOT_OFFSET.y,
        prepared.position.z + AXE_PIVOT_OFFSET.z,
      ]}
      scale={prepared.scale}
    >
      <primitive object={prepared.cloned} />
    </group>
  );
}

export default function StudyRoomAxeArtifact() {
  const [hovered, setHovered] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isSafari = useIsSafari();
  const { camera } = useThree();
  const axeRef = useRef<THREE.Group | null>(null);
  const panelAnchorRef = useRef<THREE.Group | null>(null);
  const panelSettledRef = useRef(false);
  const accentLightRef = useRef<THREE.PointLight | null>(null);
  const nearRef = useRef(false);
  const openedRef = useRef(false);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const cameraPlanar = useMemo(() => new THREE.Vector3(), []);
  const hotspotWorld = useMemo(() => AXE_POSITION.clone(), []);

  useCursor(hovered);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
    if (isOpen) {
      openedRef.current = true;
    }

    window.dispatchEvent(
      new CustomEvent("study-room-artifact-state", {
        detail: {
          artifactId: ARTIFACT_ID,
          isOpen,
          opened: openedRef.current,
        },
      }),
    );
  }, [isOpen]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("room-interaction-prompt", {
        detail: { roomId: "studyRoom", visible: isNear && !isOpen, sourceId: "studyRoom-axe" },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("room-interaction-prompt", {
          detail: { roomId: "studyRoom", visible: false, sourceId: "studyRoom-axe" },
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

    cameraPlanar.copy(camera.position);
    cameraPlanar.y = AXE_POSITION.y;

    const nearNow = cameraPlanar.distanceTo(hotspotWorld) <= INTERACT_DISTANCE;

    if (nearNow !== nearRef.current) {
      nearRef.current = nearNow;
      setIsNear(nearNow);
    }

    if (axeRef.current) {
      axeRef.current.rotation.z =
        AXE_PIVOT_ROTATION[2] + (active ? Math.sin(elapsed * 2.4) * 0.085 : 0);
    }

    if (accentLightRef.current) {
      accentLightRef.current.intensity = active ? 2.6 + Math.sin(elapsed * 4.2) * 0.25 : 1.05;
    }

    if (panelAnchorRef.current && isOpen) {
      camera.getWorldDirection(forward);
      right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

      targetPosition
        .copy(camera.position)
        .add(forward.multiplyScalar(2.18))
        .add(right.multiplyScalar(0.08))
        .add(up.multiplyScalar(isSafari ? -0.14 : 0.06));

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

  const handleHover = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setHovered(true);
  };

  const handleLeave = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setHovered(false);
  };

  const handleClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setIsOpen((value) => !value);
  };

  return (
    <>
      <group position={COVER_POSITION} rotation={COVER_ROTATION}>
        <mesh>
          <boxGeometry args={FRAME_SIZE} />
          <meshStandardMaterial color="#5b4330" roughness={0.84} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={COVER_SIZE} />
          <meshStandardMaterial color="#f6f3ed" roughness={0.98} metalness={0.01} />
        </mesh>
      </group>

      <pointLight
        ref={accentLightRef}
        position={[
          AXE_POSITION.x + 0.12,
          AXE_POSITION.y + 0.2,
          AXE_POSITION.z + 0.12,
        ]}
        color="#ffd7ae"
        intensity={1.05}
        distance={2.8}
        decay={2}
      />

      <group
        position={[AXE_POSITION.x, AXE_POSITION.y, AXE_POSITION.z]}
        rotation={AXE_BASE_ROTATION}
      >
        <group ref={axeRef} rotation={AXE_PIVOT_ROTATION}>
          <group onPointerOver={handleHover} onPointerOut={handleLeave} onClick={handleClick}>
            <AxeModel />
          </group>

          <mesh visible={false} onPointerOver={handleHover} onPointerOut={handleLeave} onClick={handleClick}>
            <boxGeometry args={[0.82, 1.12, 0.36]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      </group>

      <group ref={panelAnchorRef}>
        <ProjectLorePanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </group>
    </>
  );
}

useGLTF.preload("/models/simple_axe.glb");
