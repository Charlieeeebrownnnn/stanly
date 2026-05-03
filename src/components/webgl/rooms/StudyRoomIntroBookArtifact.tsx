import { useCursor, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import StorybookIntroPanel from "../../ui/StorybookIntroPanel";

const BOOK_POSITION = new THREE.Vector3(1.4, 2.1, 0.9);
const BOOK_ROTATION: [number, number, number] = [-1.6, 0.62, 2.4];
const BOOK_SCALE = 0.6;
const INTERACT_DISTANCE = 1.45;
const ARTIFACT_ID = "book";

function DrawingBookModel() {
  const { scene } = useGLTF("/models/drawingbook.glb");

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
              material.roughness = Math.min(material.roughness + 0.08, 1);
            }
          });
        } else if ("roughness" in child.material) {
          child.material.roughness = Math.min(
            child.material.roughness + 0.08,
            1,
          );
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeX = Math.max(size.x, 0.1);
    const safeY = Math.max(size.y, 0.1);
    const safeZ = Math.max(size.z, 0.1);
    const scale = Math.min(
      BOOK_SCALE / safeX,
      (BOOK_SCALE * 0.44) / safeY,
      (BOOK_SCALE * 0.72) / safeZ,
    );

    return {
      cloned,
      scale,
      position: new THREE.Vector3(
        -center.x * scale,
        -box.min.y * scale,
        -center.z * scale,
      ),
    };
  }, [scene]);

  return (
    <group position={prepared.position} scale={prepared.scale}>
      <primitive object={prepared.cloned} />
    </group>
  );
}

export default function StudyRoomIntroBookArtifact() {
  const [hovered, setHovered] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { camera } = useThree();
  const artifactRef = useRef<THREE.Group | null>(null);
  const auraRef = useRef<THREE.Mesh | null>(null);
  const glowRef = useRef<THREE.Mesh | null>(null);
  const panelAnchorRef = useRef<THREE.Group | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const nearRef = useRef(false);
  const openedRef = useRef(false);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const hotspotWorld = useMemo(() => BOOK_POSITION.clone(), []);
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
        detail: {
          roomId: "studyRoom",
          visible: isNear && !isOpen,
          sourceId: "studyRoom-book",
        },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("room-interaction-prompt", {
          detail: {
            roomId: "studyRoom",
            visible: false,
            sourceId: "studyRoom-book",
          },
        }),
      );
    };
  }, [isNear, isOpen]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const active = hovered || isNear;

    cameraPlanar.copy(camera.position);
    cameraPlanar.y = BOOK_POSITION.y;

    const nearNow = cameraPlanar.distanceTo(hotspotWorld) <= INTERACT_DISTANCE;

    if (nearNow !== nearRef.current) {
      nearRef.current = nearNow;
      setIsNear(nearNow);
    }

    if (artifactRef.current) {
      artifactRef.current.position.y =
        BOOK_POSITION.y + (active ? Math.sin(elapsed * 2.2) * 0.005 : 0);
      artifactRef.current.rotation.z =
        BOOK_ROTATION[2] + (active ? Math.sin(elapsed * 1.2) * 0.04 : 0);
    }

    if (auraRef.current) {
      const material = auraRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = active ? 0.3 : 0.12;
    }

    if (glowRef.current) {
      glowRef.current.rotation.z = -elapsed * 0.26;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = active ? 0.3 : 0.14;
    }

    if (lightRef.current) {
      lightRef.current.intensity = active
        ? 3.2 + Math.sin(elapsed * 3.2) * 0.28
        : 1.4;
    }

    if (panelAnchorRef.current && isOpen) {
      camera.getWorldDirection(forward);
      right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

      targetPosition
        .copy(camera.position)
        .add(forward.multiplyScalar(2.14))
        .add(right.multiplyScalar(0.1))
        .add(up.multiplyScalar(0.02));

      panelAnchorRef.current.position.lerp(targetPosition, 0.18);
      targetQuaternion.copy(camera.quaternion);
      panelAnchorRef.current.quaternion.slerp(targetQuaternion, 0.22);
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
        position={[BOOK_POSITION.x, BOOK_POSITION.y + 0.18, BOOK_POSITION.z]}
        color="#ffd9ae"
        intensity={1.4}
        distance={2.4}
        decay={2}
      />

      <mesh
        ref={auraRef}
        position={[BOOK_POSITION.x, BOOK_POSITION.y + 0.006, BOOK_POSITION.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={handleHover}
        onPointerOut={handleLeave}
        onClick={handleClick}
      >
        <ringGeometry args={[0.17, 0.3, 48]} />
        <meshBasicMaterial
          color="#efc79e"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        ref={glowRef}
        position={[BOOK_POSITION.x, BOOK_POSITION.y + 0.012, BOOK_POSITION.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.25, 0.28, 48]} />
        <meshBasicMaterial
          color="#fff0d9"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group
        ref={artifactRef}
        position={[BOOK_POSITION.x, BOOK_POSITION.y, BOOK_POSITION.z]}
        rotation={BOOK_ROTATION}
      >
        <group
          onPointerOver={handleHover}
          onPointerOut={handleLeave}
          onClick={handleClick}
        >
          <DrawingBookModel />
        </group>

        <mesh
          visible={false}
          onPointerOver={handleHover}
          onPointerOut={handleLeave}
          onClick={handleClick}
        >
          <boxGeometry args={[0.48, 0.14, 0.38]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      <group ref={panelAnchorRef}>
        <StorybookIntroPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </group>
    </>
  );
}

useGLTF.preload("/models/drawingbook.glb");
