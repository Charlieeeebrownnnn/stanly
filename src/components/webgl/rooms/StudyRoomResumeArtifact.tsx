import { useCursor, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import useIsSafari from "../../useIsSafari";
import ResumePanel from "../../ui/ResumePanel";

const TABLET_POSITION = new THREE.Vector3(1.0, 2.08, -2.9);
const TABLET_ROTATION: [number, number, number] = [-0.3, 0, 0];
const TABLET_SCALE = 0.46;
const INTERACT_DISTANCE = 1.45;
const ARTIFACT_ID = "resume";

function PaperTabletModel() {
  const { scene } = useGLTF("/models/paper_tablet.glb");

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
              material.roughness = Math.min(material.roughness + 0.1, 1);
            }
          });
        } else if ("roughness" in child.material) {
          child.material.roughness = Math.min(child.material.roughness + 0.1, 1);
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeX = Math.max(size.x, 0.1);
    const safeY = Math.max(size.y, 0.1);
    const safeZ = Math.max(size.z, 0.1);
    const scale = Math.min(TABLET_SCALE / safeX, (TABLET_SCALE * 0.7) / safeY, (TABLET_SCALE * 0.64) / safeZ);

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

export default function StudyRoomResumeArtifact() {
  const [hovered, setHovered] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isSafari = useIsSafari();
  const { camera } = useThree();
  const artifactRef = useRef<THREE.Group | null>(null);
  const auraRef = useRef<THREE.Mesh | null>(null);
  const shimmerRef = useRef<THREE.Mesh | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const panelAnchorRef = useRef<THREE.Group | null>(null);
  const panelSettledRef = useRef(false);
  const nearRef = useRef(false);
  const openedRef = useRef(false);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const hotspotWorld = useMemo(() => TABLET_POSITION.clone(), []);
  const cameraPlanar = useMemo(() => new THREE.Vector3(), []);

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
        detail: { roomId: "studyRoom", visible: isNear && !isOpen, sourceId: "studyRoom-resume" },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("room-interaction-prompt", {
          detail: { roomId: "studyRoom", visible: false, sourceId: "studyRoom-resume" },
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
    const pulse = active ? 1.06 + Math.sin(elapsed * 4.8) * 0.03 : 1 + Math.sin(elapsed * 2.4) * 0.01;

    cameraPlanar.copy(camera.position);
    cameraPlanar.y = TABLET_POSITION.y;

    const nearNow = cameraPlanar.distanceTo(hotspotWorld) <= INTERACT_DISTANCE;

    if (nearNow !== nearRef.current) {
      nearRef.current = nearNow;
      setIsNear(nearNow);
    }

    if (artifactRef.current) {
      artifactRef.current.position.y = TABLET_POSITION.y + (active ? Math.sin(elapsed * 2.6) * 0.008 : 0);
      artifactRef.current.scale.setScalar(pulse);
    }

    if (auraRef.current) {
      const material = auraRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = active ? 0.34 : 0.14;
    }

    if (shimmerRef.current) {
      shimmerRef.current.rotation.z = elapsed * 0.45;
      const material = shimmerRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = active ? 0.44 : 0.2;
    }

    if (lightRef.current) {
      lightRef.current.intensity = active ? 3.6 + Math.sin(elapsed * 5.2) * 0.35 : 1.6;
    }

    if (panelAnchorRef.current && isOpen) {
      camera.getWorldDirection(forward);
      right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

      targetPosition
        .copy(camera.position)
        .add(forward.multiplyScalar(2.16))
        .add(right.multiplyScalar(0.18))
        .add(up.multiplyScalar(isSafari ? -0.18 : 0.02));

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
      <pointLight
        ref={lightRef}
        position={[TABLET_POSITION.x, TABLET_POSITION.y + 0.2, TABLET_POSITION.z - 0.04]}
        color="#ffe3b8"
        intensity={1.6}
        distance={2.8}
        decay={2}
      />

      <mesh
        ref={auraRef}
        position={[TABLET_POSITION.x, TABLET_POSITION.y + 0.01, TABLET_POSITION.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={handleHover}
        onPointerOut={handleLeave}
        onClick={handleClick}
      >
        <ringGeometry args={[0.19, 0.34, 48]} />
        <meshBasicMaterial color="#f6d6a8" transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        ref={shimmerRef}
        position={[TABLET_POSITION.x, TABLET_POSITION.y + 0.016, TABLET_POSITION.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.28, 0.31, 48]} />
        <meshBasicMaterial color="#fff0d5" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      <group
        ref={artifactRef}
        position={[TABLET_POSITION.x, TABLET_POSITION.y, TABLET_POSITION.z]}
        rotation={TABLET_ROTATION}
      >
        <group onPointerOver={handleHover} onPointerOut={handleLeave} onClick={handleClick}>
          <PaperTabletModel />
        </group>

        <mesh visible={false} onPointerOver={handleHover} onPointerOut={handleLeave} onClick={handleClick}>
          <boxGeometry args={[0.48, 0.12, 0.34]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      <group ref={panelAnchorRef}>
        <ResumePanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </group>
    </>
  );
}

useGLTF.preload("/models/paper_tablet.glb");
