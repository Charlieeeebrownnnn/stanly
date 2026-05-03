import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import TricycleForeground from "../TricycleForeground";
import type { RoomExploreState, RoomSceneProps } from "../sharedTypes";
import Room237TypewriterArtifact from "./Room237TypewriterArtifact.jsx";

const CAMERA_HEIGHT = 1.12;
const ROOM_237_SPAWN = { x: 0, y: CAMERA_HEIGHT, z: -2.55 };
const ROOM_237_BOUNDS = {
  minX: -2.25,
  maxX: 2.25,
  minZ: -2.95,
  maxZ: 3.22,
};
const ROOM_237_PLAYER_RADIUS = 0.16;
const ROOM_237_OBSTACLE_PADDING = 0.02;
const ROOM_237_WALKABLE_ZONES = [{ minX: -1.6, maxX: 1.6, minZ: -2.95, maxZ: 3.12 }];
const ROOM_237_OBSTACLES = [
  { minX: -2.55, maxX: -1.28, minZ: -0.95, maxZ: 1.3 },
  { minX: 1.45, maxX: 2.68, minZ: -1.05, maxZ: 1.18 },
];

function isInsideRoom237Bounds(x: number, z: number, padding = ROOM_237_PLAYER_RADIUS) {
  return (
    x >= ROOM_237_BOUNDS.minX + padding &&
    x <= ROOM_237_BOUNDS.maxX - padding &&
    z >= ROOM_237_BOUNDS.minZ + padding &&
    z <= ROOM_237_BOUNDS.maxZ - padding
  );
}

function isInsideRoom237WalkableZone(x: number, z: number, padding = ROOM_237_PLAYER_RADIUS) {
  return ROOM_237_WALKABLE_ZONES.some(
    (zone) =>
      x >= zone.minX + padding &&
      x <= zone.maxX - padding &&
      z >= zone.minZ + padding &&
      z <= zone.maxZ - padding,
  );
}

function collidesWithRoom237Obstacle(x: number, z: number, padding = ROOM_237_OBSTACLE_PADDING) {
  return ROOM_237_OBSTACLES.some(
    (obstacle) =>
      x > obstacle.minX - padding &&
      x < obstacle.maxX + padding &&
      z > obstacle.minZ - padding &&
      z < obstacle.maxZ + padding,
  );
}

function isRoom237Blocked(x: number, z: number) {
  return (
    !isInsideRoom237Bounds(x, z) ||
    !isInsideRoom237WalkableZone(x, z) ||
    collidesWithRoom237Obstacle(x, z)
  );
}

function resolveRoom237Movement(currentX: number, currentZ: number, targetX: number, targetZ: number) {
  const totalDistance = Math.hypot(targetX - currentX, targetZ - currentZ);
  const steps = Math.max(1, Math.ceil(totalDistance / 0.08));
  const stepX = (targetX - currentX) / steps;
  const stepZ = (targetZ - currentZ) / steps;

  let resolvedX = currentX;
  let resolvedZ = currentZ;

  for (let step = 0; step < steps; step += 1) {
    const nextX = resolvedX + stepX;
    const nextZ = resolvedZ + stepZ;

    if (!isRoom237Blocked(nextX, nextZ)) {
      resolvedX = nextX;
      resolvedZ = nextZ;
      continue;
    }

    if (!isRoom237Blocked(nextX, resolvedZ)) {
      resolvedX = nextX;
    }

    if (!isRoom237Blocked(resolvedX, nextZ)) {
      resolvedZ = nextZ;
    }
  }

  return { x: resolvedX, z: resolvedZ };
}

function Room237Model({ onReady }: { onReady?: () => void }) {
  const { scene } = useGLTF("/models/room-237.glb");

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
    const scale = Math.min(7 / safeX, 4.1 / safeY, 7 / safeZ);

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

function Room237Rig({ input, motion }: RoomSceneProps & { motion: MutableRefObject<RoomExploreState> }) {
  const bob = useRef(ROOM_237_SPAWN.y);
  const sway = useRef(ROOM_237_SPAWN.x);
  const lookTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

    motion.current.forwardVelocity = THREE.MathUtils.damp(motion.current.forwardVelocity, moveInput * 1.9, 6, delta);
    motion.current.turnVelocity = THREE.MathUtils.damp(motion.current.turnVelocity, turnInput * 1.9, 8, delta);
    motion.current.yaw += motion.current.turnVelocity * delta;

    const proposedX = THREE.MathUtils.clamp(
      motion.current.x + Math.sin(motion.current.yaw) * motion.current.forwardVelocity * delta,
      ROOM_237_BOUNDS.minX + ROOM_237_PLAYER_RADIUS,
      ROOM_237_BOUNDS.maxX - ROOM_237_PLAYER_RADIUS,
    );
    const proposedZ = THREE.MathUtils.clamp(
      motion.current.z + Math.cos(motion.current.yaw) * motion.current.forwardVelocity * delta,
      ROOM_237_BOUNDS.minZ + ROOM_237_PLAYER_RADIUS,
      ROOM_237_BOUNDS.maxZ - ROOM_237_PLAYER_RADIUS,
    );

    const resolvedPosition = resolveRoom237Movement(motion.current.x, motion.current.z, proposedX, proposedZ);
    motion.current.x = resolvedPosition.x;
    motion.current.z = resolvedPosition.z;

    const moving = Math.abs(motion.current.forwardVelocity) > 0.05;
    const targetY =
      ROOM_237_SPAWN.y + (moving ? Math.sin(elapsed * 8.8) * 0.02 : Math.sin(elapsed * 2.6) * 0.006);

    bob.current = THREE.MathUtils.damp(bob.current, targetY, 9, delta);
    sway.current = THREE.MathUtils.damp(sway.current, motion.current.x, 6, delta);

    camera.position.set(sway.current, bob.current, motion.current.z);
    lookTarget.current.set(
      sway.current + Math.sin(motion.current.yaw) * 3.4,
      CAMERA_HEIGHT + 0.03,
      motion.current.z + Math.cos(motion.current.yaw) * 3.4,
    );
    camera.lookAt(lookTarget.current);
  });

  return null;
}

export default function Room237SceneContent({ input, onReady }: RoomSceneProps) {
  const motion = useRef<RoomExploreState>({
    x: ROOM_237_SPAWN.x,
    z: ROOM_237_SPAWN.z,
    yaw: 0,
    forwardVelocity: 0,
    turnVelocity: 0,
  });

  return (
    <>
      <color attach="background" args={["#09110d"]} />
      <fog attach="fog" args={["#09110d", 10, 28]} />

      <PerspectiveCamera
        makeDefault
        position={[ROOM_237_SPAWN.x, ROOM_237_SPAWN.y, ROOM_237_SPAWN.z]}
        fov={53}
        near={0.1}
        far={60}
      />

      <Room237Rig input={input} motion={motion} />
      <TricycleForeground motion={motion} headingOffset={Math.PI} />

      <ambientLight intensity={1.15} color="#d3f6db" />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#f5ffe1" />
      <pointLight position={[0, 2.6, 1.6]} intensity={18} distance={16} color="#c5ffda" />
      <pointLight position={[0, 1.2, -2.8]} intensity={7} distance={12} color="#7effb7" />

      <Room237Model onReady={onReady} />
      <Room237TypewriterArtifact />
    </>
  );
}
