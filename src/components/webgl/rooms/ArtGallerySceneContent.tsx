import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import TricycleForeground from "../TricycleForeground";
import ArtGalleryExhibition from "./ArtGalleryExhibition";
import type { RoomExploreState, RoomSceneProps } from "../sharedTypes";

const GALLERY_FLOOR_Y = 0;
const GALLERY_CAMERA_HEIGHT = 0.6;
const GALLERY_SPAWN = { x: 0, y: GALLERY_FLOOR_Y + GALLERY_CAMERA_HEIGHT, z: 2.85 };
const GALLERY_BOUNDS = {
  minX: -3.78,
  maxX: 3.78,
  minZ: -3.92,
  maxZ: 3.92,
};
const GALLERY_PLAYER_RADIUS = 0.16;
const GALLERY_OBSTACLE_PADDING = 0.04;
const GALLERY_OBSTACLES = [{ minX: -0.62, maxX: 0.62, minZ: -0.92, maxZ: 0.92 }];
const GALLERY_MODEL_ROTATION: [number, number, number] = [0, 0, 0];
const IGNORE_RAYCAST = () => null;

function isInsideGalleryBounds(x: number, z: number, padding = GALLERY_PLAYER_RADIUS) {
  return (
    x >= GALLERY_BOUNDS.minX + padding &&
    x <= GALLERY_BOUNDS.maxX - padding &&
    z >= GALLERY_BOUNDS.minZ + padding &&
    z <= GALLERY_BOUNDS.maxZ - padding
  );
}

function collidesWithGalleryObstacle(x: number, z: number, padding = GALLERY_OBSTACLE_PADDING) {
  return GALLERY_OBSTACLES.some(
    (obstacle) =>
      x > obstacle.minX - padding &&
      x < obstacle.maxX + padding &&
      z > obstacle.minZ - padding &&
      z < obstacle.maxZ + padding,
  );
}

function isGalleryBlocked(x: number, z: number) {
  return !isInsideGalleryBounds(x, z) || collidesWithGalleryObstacle(x, z);
}

function resolveGalleryMovement(currentX: number, currentZ: number, targetX: number, targetZ: number) {
  const totalDistance = Math.hypot(targetX - currentX, targetZ - currentZ);
  const steps = Math.max(1, Math.ceil(totalDistance / 0.08));
  const stepX = (targetX - currentX) / steps;
  const stepZ = (targetZ - currentZ) / steps;

  let resolvedX = currentX;
  let resolvedZ = currentZ;

  for (let step = 0; step < steps; step += 1) {
    const nextX = resolvedX + stepX;
    const nextZ = resolvedZ + stepZ;

    if (!isGalleryBlocked(nextX, nextZ)) {
      resolvedX = nextX;
      resolvedZ = nextZ;
      continue;
    }

    if (!isGalleryBlocked(nextX, resolvedZ)) {
      resolvedX = nextX;
    }

    if (!isGalleryBlocked(resolvedX, nextZ)) {
      resolvedZ = nextZ;
    }
  }

  return { x: resolvedX, z: resolvedZ };
}

function GalleryEnvironment({
  onReady,
}: {
  onReady?: () => void;
}) {
  const { scene } = useGLTF("/models/art_gallery.glb");

  const prepared = useMemo(() => {
    const model = scene.clone(true);
    const measurement = scene.clone(true);

    measurement.rotation.set(...GALLERY_MODEL_ROTATION);

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.raycast = IGNORE_RAYCAST;

        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            if ("roughness" in material) {
              material.roughness = Math.min(material.roughness + 0.08, 1);
            }
          });
        } else if ("roughness" in child.material) {
          child.material.roughness = Math.min(child.material.roughness + 0.08, 1);
        }
      }
    });

    const box = new THREE.Box3().setFromObject(measurement);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeX = Math.max(size.x, 0.1);
    const safeY = Math.max(size.y, 0.1);
    const safeZ = Math.max(size.z, 0.1);
    const scale = Math.min(8.2 / safeX, 6.1 / safeY, 8.2 / safeZ);

    return {
      model,
      scale,
      position: new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale),
    };
  }, [scene]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
      <group position={prepared.position} scale={prepared.scale}>
      <group rotation={GALLERY_MODEL_ROTATION}>
        <primitive object={prepared.model} />
        <ArtGalleryExhibition />
      </group>
    </group>
  );
}

function GalleryRig({ input, motion }: RoomSceneProps & { motion: MutableRefObject<RoomExploreState> }) {
  const bob = useRef(GALLERY_SPAWN.y);
  const sway = useRef(GALLERY_SPAWN.x);
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
    motion.current.turnVelocity = THREE.MathUtils.damp(motion.current.turnVelocity, turnInput * 1.8, 8, delta);
    motion.current.yaw += motion.current.turnVelocity * delta;

    const proposedX = motion.current.x + Math.sin(motion.current.yaw) * motion.current.forwardVelocity * delta;
    const proposedZ = motion.current.z + Math.cos(motion.current.yaw) * motion.current.forwardVelocity * delta;
    const resolvedPosition = resolveGalleryMovement(motion.current.x, motion.current.z, proposedX, proposedZ);

    motion.current.x = resolvedPosition.x;
    motion.current.z = resolvedPosition.z;

    const moving = Math.abs(motion.current.forwardVelocity) > 0.05;
    const targetY =
      GALLERY_SPAWN.y + (moving ? Math.sin(elapsed * 8.4) * 0.018 : Math.sin(elapsed * 2.4) * 0.006);

    bob.current = THREE.MathUtils.damp(bob.current, targetY, 9, delta);
    sway.current = THREE.MathUtils.damp(sway.current, motion.current.x, 6, delta);

    camera.position.set(sway.current, bob.current, motion.current.z);
    lookTarget.current.set(
      sway.current + Math.sin(motion.current.yaw) * 3.8,
      GALLERY_FLOOR_Y + GALLERY_CAMERA_HEIGHT + 0.08,
      motion.current.z + Math.cos(motion.current.yaw) * 3.8,
    );
    camera.lookAt(lookTarget.current);
  });

  return null;
}

export default function ArtGallerySceneContent({ input, onReady }: RoomSceneProps) {
  const motion = useRef<RoomExploreState>({
    x: GALLERY_SPAWN.x,
    z: GALLERY_SPAWN.z,
    yaw: Math.PI / 2,
    forwardVelocity: 0,
    turnVelocity: 0,
  });

  return (
    <>
      <color attach="background" args={["#efe9df"]} />
      <fog attach="fog" args={["#efe9df", 9, 28]} />

      <PerspectiveCamera
        makeDefault
        position={[GALLERY_SPAWN.x, GALLERY_SPAWN.y, GALLERY_SPAWN.z]}
        fov={53}
        near={0.1}
        far={60}
      />

      <GalleryRig input={input} motion={motion} />
      <TricycleForeground motion={motion} headingOffset={Math.PI} verticalOffset={0.2} />

      <ambientLight intensity={1.18} color="#fff4e6" />
      <hemisphereLight intensity={0.42} color="#fff7eb" groundColor="#d7c4a9" />
      <directionalLight position={[4, 7, 5]} intensity={0.82} color="#fff7eb" />

      <GalleryEnvironment onReady={onReady} />
    </>
  );
}

useGLTF.preload("/models/art_gallery.glb");
