import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { RoomExploreState, RoomSceneProps } from "../sharedTypes";
import StudyRoomAxeArtifact from "./StudyRoomAxeArtifact";
import StudyRoomIntroBookArtifact from "./StudyRoomIntroBookArtifact";
import StudyRoomResumeArtifact from "./StudyRoomResumeArtifact";

const STUDY_CAMERA_HEIGHT = 2.4;
const STUDY_ROOM_SPAWN = { x: 0, y: STUDY_CAMERA_HEIGHT, z: 4.2 };
const STUDY_ROOM_BOUNDS = {
  minX: -4.6,
  maxX: 4.6,
  minZ: -5.2,
  maxZ: 5.4,
};

function StudyRoomModel({ onReady }: { onReady?: () => void }) {
  const { scene } = useGLTF("/models/newstudyroom.glb");

  const prepared = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeX = Math.max(size.x, 0.1);
    const safeY = Math.max(size.y, 0.1);
    const safeZ = Math.max(size.z, 0.1);
    const scale = Math.min(10 / safeX, 4.8 / safeY, 10.6 / safeZ);

    return {
      cloned,
      scale,
      position: new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale),
    };
  }, [scene]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <group position={prepared.position} scale={prepared.scale}>
      <primitive object={prepared.cloned} />
    </group>
  );
}

function StudyRoomRig({
  input,
  motion,
  controlsEnabled = true,
}: RoomSceneProps & {
  motion: MutableRefObject<RoomExploreState>;
  controlsEnabled?: boolean;
}) {
  const bob = useRef(STUDY_ROOM_SPAWN.y);
  const sway = useRef(STUDY_ROOM_SPAWN.x);
  const lookTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!controlsEnabled) {
      input.current.forward = false;
      input.current.backward = false;
      input.current.left = false;
      input.current.right = false;
    }
  }, [controlsEnabled, input]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!controlsEnabled) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "arrowup" || key === "w") {
        input.current.forward = true;
        event.preventDefault();
      } else if (key === "arrowdown" || key === "s") {
        input.current.backward = true;
        event.preventDefault();
      } else if (key === "arrowleft" || key === "a") {
        input.current.left = true;
        event.preventDefault();
      } else if (key === "arrowright" || key === "d") {
        input.current.right = true;
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!controlsEnabled) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "arrowup" || key === "w") {
        input.current.forward = false;
      } else if (key === "arrowdown" || key === "s") {
        input.current.backward = false;
      } else if (key === "arrowleft" || key === "a") {
        input.current.left = false;
      } else if (key === "arrowright" || key === "d") {
        input.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [controlsEnabled, input]);

  useFrame(({ camera, clock }, delta) => {
    const moveInput = controlsEnabled ? Number(input.current.forward) - Number(input.current.backward) : 0;
    const turnInput = controlsEnabled ? Number(input.current.left) - Number(input.current.right) : 0;
    const elapsed = clock.getElapsedTime();

    motion.current.forwardVelocity = THREE.MathUtils.damp(motion.current.forwardVelocity, moveInput * 2.05, 6, delta);
    motion.current.turnVelocity = THREE.MathUtils.damp(motion.current.turnVelocity, turnInput * 1.75, 8, delta);
    motion.current.yaw += motion.current.turnVelocity * delta;

    motion.current.x = THREE.MathUtils.clamp(
      motion.current.x + Math.sin(motion.current.yaw) * motion.current.forwardVelocity * delta,
      STUDY_ROOM_BOUNDS.minX,
      STUDY_ROOM_BOUNDS.maxX,
    );
    motion.current.z = THREE.MathUtils.clamp(
      motion.current.z + Math.cos(motion.current.yaw) * motion.current.forwardVelocity * delta,
      STUDY_ROOM_BOUNDS.minZ,
      STUDY_ROOM_BOUNDS.maxZ,
    );

    const moving = Math.abs(motion.current.forwardVelocity) > 0.05;
    const targetY =
      STUDY_ROOM_SPAWN.y + (moving ? Math.sin(elapsed * 8.1) * 0.018 : Math.sin(elapsed * 2.3) * 0.005);

    bob.current = THREE.MathUtils.damp(bob.current, targetY, 9, delta);
    sway.current = THREE.MathUtils.damp(sway.current, motion.current.x, 6, delta);

    camera.position.set(sway.current, bob.current, motion.current.z);
    lookTarget.current.set(
      sway.current + Math.sin(motion.current.yaw) * 4.4,
      STUDY_CAMERA_HEIGHT + 0.1,
      motion.current.z + Math.cos(motion.current.yaw) * 4.4,
    );
    camera.lookAt(lookTarget.current);
  });

  return null;
}

export default function StudyRoomSceneContent({
  input,
  onReady,
  controlsEnabled = true,
}: RoomSceneProps & { controlsEnabled?: boolean }) {
  const motion = useRef<RoomExploreState>({
    x: STUDY_ROOM_SPAWN.x,
    z: STUDY_ROOM_SPAWN.z,
    yaw: Math.PI,
    forwardVelocity: 0,
    turnVelocity: 0,
  });

  return (
    <>
      <color attach="background" args={["#120f0d"]} />
      <fog attach="fog" args={["#120f0d", 10, 32]} />

      <PerspectiveCamera
        makeDefault
        position={[STUDY_ROOM_SPAWN.x, STUDY_ROOM_SPAWN.y, STUDY_ROOM_SPAWN.z]}
        fov={52}
        near={0.1}
        far={70}
      />

      <StudyRoomRig input={input} motion={motion} controlsEnabled={controlsEnabled} />

      <ambientLight intensity={0.92} color="#ffe9c8" />
      <hemisphereLight intensity={0.32} color="#fff0d7" groundColor="#24150f" />
      <directionalLight position={[4, 6, 5]} intensity={0.95} color="#ffe1b3" />
      <pointLight position={[0, 2.6, 0]} intensity={12} distance={18} color="#ffbd74" />

      <StudyRoomModel onReady={onReady} />
      <StudyRoomAxeArtifact />
      <StudyRoomIntroBookArtifact />
      <StudyRoomResumeArtifact />
    </>
  );
}

useGLTF.preload("/models/newstudyroom.glb");
