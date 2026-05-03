import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import TricycleForeground from "../TricycleForeground";
import type { RoomExploreState, RoomSceneProps } from "../sharedTypes";
import SpaceRoom from "./SpaceRoom.jsx";

const CAMERA_HEIGHT = 1.12;
const SPACE_ROOM_SPAWN = { x: 0, y: CAMERA_HEIGHT, z: -5.8 };
const SPACE_ROOM_BOUNDS = {
  minX: -4.8,
  maxX: 4.8,
  minZ: -6.8,
  maxZ: 7.2,
};

function SpaceRoomModel({ onReady }: { onReady?: () => void }) {
  const { scene } = useGLTF("/models/space_room.glb");

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
    const scale = Math.min(10.5 / safeX, 5 / safeY, 13 / safeZ);

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

function SpaceRoomRig({ input, motion }: RoomSceneProps & { motion: MutableRefObject<RoomExploreState> }) {
  const bob = useRef(SPACE_ROOM_SPAWN.y);
  const sway = useRef(SPACE_ROOM_SPAWN.x);
  const lookTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "arrowup" || key === "w") {
        input.current.forward = true;
        event.preventDefault();
      } else if (key === "arrowdown" || key === "s") {
        input.current.backward = true;
      } else if (key === "arrowleft" || key === "a") {
        input.current.left = true;
        event.preventDefault();
      } else if (key === "arrowright" || key === "d") {
        input.current.right = true;
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
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
  }, [input]);

  useFrame(({ camera, clock }, delta) => {
    const moveInput = Number(input.current.forward) - Number(input.current.backward);
    const turnInput = Number(input.current.left) - Number(input.current.right);
    const elapsed = clock.getElapsedTime();

    motion.current.forwardVelocity = THREE.MathUtils.damp(motion.current.forwardVelocity, moveInput * 2.2, 6, delta);
    motion.current.turnVelocity = THREE.MathUtils.damp(motion.current.turnVelocity, turnInput * 1.8, 8, delta);
    motion.current.yaw += motion.current.turnVelocity * delta;

    motion.current.x = THREE.MathUtils.clamp(
      motion.current.x + Math.sin(motion.current.yaw) * motion.current.forwardVelocity * delta,
      SPACE_ROOM_BOUNDS.minX,
      SPACE_ROOM_BOUNDS.maxX,
    );
    motion.current.z = THREE.MathUtils.clamp(
      motion.current.z + Math.cos(motion.current.yaw) * motion.current.forwardVelocity * delta,
      SPACE_ROOM_BOUNDS.minZ,
      SPACE_ROOM_BOUNDS.maxZ,
    );

    const moving = Math.abs(motion.current.forwardVelocity) > 0.05;
    const targetY =
      SPACE_ROOM_SPAWN.y + (moving ? Math.sin(elapsed * 8) * 0.018 : Math.sin(elapsed * 2.4) * 0.005);

    bob.current = THREE.MathUtils.damp(bob.current, targetY, 9, delta);
    sway.current = THREE.MathUtils.damp(sway.current, motion.current.x, 6, delta);

    camera.position.set(sway.current, bob.current, motion.current.z);
    lookTarget.current.set(
      sway.current + Math.sin(motion.current.yaw) * 4.8,
      CAMERA_HEIGHT + 0.06,
      motion.current.z + Math.cos(motion.current.yaw) * 4.8,
    );
    camera.lookAt(lookTarget.current);
  });

  return null;
}

export default function SpaceRoomSceneContent({ input, onReady }: RoomSceneProps) {
  const motion = useRef<RoomExploreState>({
    x: SPACE_ROOM_SPAWN.x,
    z: SPACE_ROOM_SPAWN.z,
    yaw: 0,
    forwardVelocity: 0,
    turnVelocity: 0,
  });

  return (
    <>
      <color attach="background" args={["#efe8da"]} />
      <fog attach="fog" args={["#efe8da", 14, 34]} />

      <PerspectiveCamera
        makeDefault
        position={[SPACE_ROOM_SPAWN.x, SPACE_ROOM_SPAWN.y, SPACE_ROOM_SPAWN.z]}
        fov={50}
        near={0.1}
        far={80}
      />

      <SpaceRoomRig input={input} motion={motion} />
      <TricycleForeground motion={motion} headingOffset={Math.PI} />

      <ambientLight intensity={1.05} color="#fff5e1" />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#fff4d8" />
      <pointLight position={[0, 3.4, 0]} intensity={14} distance={22} color="#fff2ce" />

      <SpaceRoomModel onReady={onReady} />
      <SpaceRoom />
    </>
  );
}
