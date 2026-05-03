import { PerspectiveCamera, useGLTF, useProgress, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import TricycleForeground from "./TricycleForeground";
import type { RideInputState, RideMotionState } from "./sharedTypes";

const Room237SceneContent = lazy(() => import("./rooms/Room237SceneContent"));
const SpaceRoomSceneContent = lazy(() => import("./rooms/SpaceRoomSceneContent"));
const OrangeRoomSceneContent = lazy(() => import("./rooms/OrangeRoomSceneContent"));
const ArtGallerySceneContent = lazy(() => import("./rooms/ArtGallerySceneContent"));
const StudyRoomSceneContent = lazy(() => import("./rooms/StudyRoomSceneContent"));

const CORRIDOR_WIDTH = 8.8;
const CORRIDOR_HEIGHT = 4.4;
const SEGMENT_LENGTH = 8.5;
const SEGMENT_COUNT = 10;
const LOOP_LENGTH = SEGMENT_LENGTH * SEGMENT_COUNT;
const CAMERA_HEIGHT = 1.12;
const CAMERA_START_Z = 6;
const CAMERA_END_TRAVEL = LOOP_LENGTH + SEGMENT_LENGTH * 1.35;
const CAMERA_MIN_Z = CAMERA_START_Z - CAMERA_END_TRAVEL;
const CAMERA_MAX_Z = CAMERA_START_Z + 2;
const FLOOR_LENGTH = LOOP_LENGTH + SEGMENT_LENGTH * 4;
const FLOOR_CENTER_Z = CAMERA_START_Z - FLOOR_LENGTH / 2;
const CORRIDOR_END_WALL_Z = CAMERA_START_Z - LOOP_LENGTH - 12;
const ROOM_237_DOOR_Z = 2 - SEGMENT_LENGTH * 2;
const SPACE_ROOM_DOOR_Z = 2 - SEGMENT_LENGTH * 4;
const ORANGE_ROOM_DOOR_Z = 2 - SEGMENT_LENGTH * 6;
const ART_GALLERY_DOOR_Z = 2 - SEGMENT_LENGTH * 8;
const STUDY_ROOM_DOOR_Z = CORRIDOR_END_WALL_Z + 0.16;
const ROOM_PROMPT_X = CORRIDOR_WIDTH / 2 - 2.65;
const SPACE_ROOM_PROMPT_X = -CORRIDOR_WIDTH / 2 + 2.65;
const ORANGE_ROOM_PROMPT_X = CORRIDOR_WIDTH / 2 - 2.65;
const ART_GALLERY_PROMPT_X = -CORRIDOR_WIDTH / 2 + 2.65;
const DOOR_PROMPT_Z_RANGE = 4.2;
const END_DOOR_PROMPT_Z_RANGE = 5.2;

type SideRoomId = "room237" | "spaceRoom" | "orangeRoom" | "artGallery";
type CorridorRoomId = SideRoomId | "studyRoom";
type DoorSide = "left" | "right";
type StudyArtifactId = "axe" | "book" | "resume";
type StudyArtifactProgress = Record<StudyArtifactId, { opened: boolean; isOpen: boolean }>;
type StudySequencePhase = "idle" | "closingToVideo" | "video" | "closingToEnding" | "ending";
const SIDE_ROOM_IDS: SideRoomId[] = ["room237", "spaceRoom", "orangeRoom", "artGallery"];
const VISITABLE_ROOM_IDS: CorridorRoomId[] = [...SIDE_ROOM_IDS, "studyRoom"];
const STUDY_ARTIFACT_IDS: StudyArtifactId[] = ["axe", "book", "resume"];
const STUDY_VIDEO_PATH = "/videos/ApeToHuman.mp4";
const STUDY_RESUME_PDF_PATH = "/data/Yu%20Nien%20Liu.pdf";
const STUDY_CURTAIN_DURATION_MS = 920;
const STUDY_ENDING_ACTION_DELAY_MS = 2400;
const HALLWAY_AUDIO_PATH = "/assets/music/hallway.m4a?v=20260502";
const ROOM_237_AUDIO_PATH = "/assets/music/room237.mp4";
const SPACE_ROOM_AUDIO_PATH = "/assets/music/spaceroom.m4a";
const ORANGE_ROOM_AUDIO_PATH = "/assets/music/singing.m4a";
const ART_GALLERY_AUDIO_PATH = "/assets/music/nojabe.m4a";
const STUDY_ROOM_AUDIO_PATH = "/assets/music/studyroom.m4a";
const STUDY_ENDING_AUDIO_PATH = "/assets/music/str.m4a";
const STUDY_ACTIONS_AUDIO_PATH = "/assets/music/TENET.mp3";
const TWINS_TEXTURE_PATH = "/assets/bonus/twins.png";
const GRANDMAS_TV_MODEL_PATH = "/models/grandmas_tv.glb";
const TWINS_DOOR_Z = STUDY_ROOM_DOOR_Z + 0.32;
const TWINS_TRIGGER_CAMERA_Z = TWINS_DOOR_Z + 18;
const TWINS_DURATION_MS = 3600;
const TWINS_FADE_IN_MS = 220;
const TWINS_HOLD_MS = 2800;
const TWINS_MAX_OPACITY = 1;
const TWINS_DEBUG_ALWAYS_VISIBLE = false;
const CORRIDOR_AMBIENT_INTENSITY = 0.7;
const CORRIDOR_DIRECTIONAL_INTENSITY = 0.7;
const GRANDMAS_TV_DEBUG_ALWAYS_VISIBLE = true;
const GRANDMAS_TV_POSITION: [number, number, number] = [2.7, 0.96, ROOM_237_DOOR_Z + 1.1];
const GRANDMAS_TV_ROTATION_Y = -2.25;
const GRANDMAS_TV_TARGET_HEIGHT = 2.4;
type DoorVariant = "default" | "room237" | "spaceRoom" | "orangeRoom" | "artGallery";
type EtchingStroke = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};
const INITIAL_STUDY_ARTIFACT_PROGRESS: StudyArtifactProgress = {
  axe: { opened: false, isOpen: false },
  book: { opened: false, isOpen: false },
  resume: { opened: false, isOpen: false },
};

function getRoomLabel(roomId: CorridorRoomId) {
  if (roomId === "room237") {
    return "Room 237";
  }

  if (roomId === "spaceRoom") {
    return "Monolith Suite";
  }

  if (roomId === "artGallery") {
    return "Memory Gallery";
  }

  if (roomId === "studyRoom") {
    return "Study Room";
  }

  return "Korova Suite";
}

function getCorridorMemoryCopy(visitedCount: number, totalRoomCount: number) {
  if (visitedCount <= 0) {
    return `${totalRoomCount} Rooms Await`;
  }

  if (visitedCount >= totalRoomCount) {
    return "The Hotel Remembers";
  }

  if (visitedCount === totalRoomCount - 1) {
    return `${visitedCount} Of ${totalRoomCount} Rooms Remembered`;
  }

  if (visitedCount === 1) {
    return `1 Of ${totalRoomCount} Rooms Remembered`;
  }

  return `${visitedCount} Of ${totalRoomCount} Rooms Remembered`;
}

function getStudyRoomArtifactCopy(
  exploredCount: number,
  totalArtifactCount: number,
  hasOpenArtifact: boolean,
  sequencePhase: StudySequencePhase,
) {
  if (sequencePhase === "ending") {
    return "Instinct Becomes Intention";
  }

  if (exploredCount <= 0) {
    return `${totalArtifactCount} Interactive Artifacts Await`;
  }

  if (exploredCount >= totalArtifactCount && hasOpenArtifact) {
    return "Close The Final Window";
  }

  if (exploredCount >= totalArtifactCount) {
    return `All ${totalArtifactCount} Artifacts Explored`;
  }

  if (exploredCount === 1) {
    return `1 Of ${totalArtifactCount} Artifacts Explored`;
  }

  return `${exploredCount} Of ${totalArtifactCount} Artifacts Explored`;
}

function getDoorEtchingColor(variant: DoorVariant) {
  if (variant === "room237") {
    return {
      color: "#dfffe6",
      emissive: "#8ff2be",
      glow: "#78e3b0",
    };
  }

  if (variant === "spaceRoom") {
    return {
      color: "#fff8df",
      emissive: "#fff1b4",
      glow: "#f4e3ab",
    };
  }

  if (variant === "orangeRoom") {
    return {
      color: "#fff0dc",
      emissive: "#ffc882",
      glow: "#ffbf75",
    };
  }

  if (variant === "artGallery") {
    return {
      color: "#fff3e5",
      emissive: "#ffd9a8",
      glow: "#ffd1a0",
    };
  }

  return {
    color: "#f5eadc",
    emissive: "#e9d0a7",
    glow: "#e4c798",
  };
}

function getDoorEtchingStrokes(variant: DoorVariant): EtchingStroke[] {
  if (variant === "room237") {
    return [
      { position: [-0.08, 2.32, 0.148], rotation: [0, 0, -0.36], scale: [0.72, 1.26, 1] },
      { position: [-0.005, 2.25, 0.148], rotation: [0, 0, -0.28], scale: [0.7, 1.18, 1] },
      { position: [0.07, 2.18, 0.148], rotation: [0, 0, -0.2], scale: [0.68, 1.1, 1] },
      { position: [0.14, 2.11, 0.148], rotation: [0, 0, -0.14], scale: [0.64, 0.98, 1] },
    ];
  }

  if (variant === "spaceRoom") {
    return [
      { position: [-0.1, 2.28, 0.148], rotation: [0, 0, -0.32], scale: [0.68, 1.22, 1] },
      { position: [-0.02, 2.22, 0.148], rotation: [0, 0, -0.24], scale: [0.66, 1.14, 1] },
      { position: [0.06, 2.16, 0.148], rotation: [0, 0, -0.17], scale: [0.64, 1.04, 1] },
      { position: [0.14, 2.1, 0.148], rotation: [0, 0, -0.11], scale: [0.6, 0.92, 1] },
    ];
  }

  if (variant === "orangeRoom") {
    return [
      { position: [-0.1, 2.36, 0.148], rotation: [0, 0, -0.42], scale: [0.76, 1.34, 1] },
      { position: [-0.015, 2.28, 0.148], rotation: [0, 0, -0.32], scale: [0.72, 1.22, 1] },
      { position: [0.07, 2.2, 0.148], rotation: [0, 0, -0.24], scale: [0.68, 1.12, 1] },
      { position: [0.15, 2.12, 0.148], rotation: [0, 0, -0.16], scale: [0.64, 1.02, 1] },
    ];
  }

  if (variant === "artGallery") {
    return [
      { position: [-0.11, 2.26, 0.148], rotation: [0, 0, -0.3], scale: [0.62, 1.08, 1] },
      { position: [-0.03, 2.2, 0.148], rotation: [0, 0, -0.22], scale: [0.6, 1, 1] },
      { position: [0.05, 2.14, 0.148], rotation: [0, 0, -0.15], scale: [0.58, 0.94, 1] },
      { position: [0.13, 2.08, 0.148], rotation: [0, 0, -0.09], scale: [0.54, 0.84, 1] },
    ];
  }

  return [];
}

function DoorMemoryEtching({ variant }: { variant: DoorVariant }) {
  const strokes = getDoorEtchingStrokes(variant);
  const palette = getDoorEtchingColor(variant);

  if (!strokes.length) {
    return null;
  }

  return (
    <group position={[0.64, 0, 0.02]}>
      <mesh position={[0.01, 2.21, 0.118]} rotation={[0, 0, -0.22]}>
        <boxGeometry args={[0.42, 0.5, 0.012]} />
        <meshStandardMaterial
          color="#fff4e5"
          emissive={palette.emissive}
          emissiveIntensity={0.08}
          transparent
          opacity={0.1}
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      {strokes.map((stroke, index) => (
        <mesh
          key={`${variant}-etch-${index}`}
          position={stroke.position}
          rotation={stroke.rotation ?? [0, 0, 0]}
          scale={stroke.scale ?? [1, 1, 1]}
        >
          <boxGeometry args={[0.02, 0.24, 0.014]} />
          <meshStandardMaterial
            color={palette.color}
            emissive={palette.emissive}
            emissiveIntensity={0.74}
            roughness={0.18}
            metalness={0.12}
          />
        </mesh>
      ))}

      <pointLight position={[0.02, 2.2, 0.26]} color={palette.glow} intensity={1.45} distance={1.4} decay={2} />
    </group>
  );
}

function RideRig({
  input,
  motion,
}: {
  input: MutableRefObject<RideInputState>;
  motion: MutableRefObject<RideMotionState>;
}) {
  const sway = useRef(0);
  const bob = useRef(CAMERA_HEIGHT);
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(({ camera, clock }, delta) => {
    const moveInput = Number(input.current.forward) - Number(input.current.backward);
    const steerInput = Number(input.current.right) - Number(input.current.left);

    const elapsed = clock.getElapsedTime();
    const targetForwardVelocity = moveInput * 5.1;
    const targetSteerVelocity = steerInput * 1.45;
    const movingStrength = Math.abs(targetForwardVelocity) + Math.abs(targetSteerVelocity);
    const bobAmplitude = movingStrength > 0.1 ? 0.02 : 0.006;
    const targetY = CAMERA_HEIGHT + Math.sin(elapsed * (movingStrength > 0.1 ? 8.8 : 2.6)) * bobAmplitude;

    motion.current.forwardVelocity = THREE.MathUtils.damp(
      motion.current.forwardVelocity,
      targetForwardVelocity,
      5.6,
      delta,
    );
    motion.current.steerVelocity = THREE.MathUtils.damp(
      motion.current.steerVelocity,
      targetSteerVelocity,
      8,
      delta,
    );

    const targetYaw = steerInput * 0.34;
    motion.current.yaw = THREE.MathUtils.damp(motion.current.yaw, targetYaw, 7, delta);

    const heading = motion.current.yaw * 0.85;
    motion.current.z = THREE.MathUtils.clamp(
      motion.current.z - Math.cos(heading) * motion.current.forwardVelocity * delta,
      CAMERA_MIN_Z,
      CAMERA_MAX_Z,
    );
    motion.current.x = THREE.MathUtils.clamp(
      motion.current.x + Math.sin(heading) * motion.current.forwardVelocity * delta,
      -CORRIDOR_WIDTH / 2 + 1.05,
      CORRIDOR_WIDTH / 2 - 1.05,
    );

    const targetX = motion.current.x + Math.sin(elapsed * 0.7) * 0.03;

    sway.current = THREE.MathUtils.damp(sway.current, targetX, 6, delta);
    bob.current = THREE.MathUtils.damp(bob.current, targetY, 10, delta);

    camera.position.set(sway.current, bob.current, motion.current.z);
    lookTarget.current.set(
      sway.current + Math.sin(heading) * 8,
      CAMERA_HEIGHT + 0.03,
      motion.current.z - Math.cos(heading) * 11,
    );
    camera.lookAt(lookTarget.current);
  });

  return null;
}

function CorridorShell() {
  const carpet = useTexture("/sprites/overlook-carpet.png");

  useEffect(() => {
    carpet.wrapS = THREE.RepeatWrapping;
    carpet.wrapT = THREE.RepeatWrapping;
    carpet.repeat.set(4, FLOOR_LENGTH / 3.4);
    carpet.magFilter = THREE.NearestFilter;
    carpet.minFilter = THREE.NearestFilter;
    carpet.needsUpdate = true;
  }, [carpet]);

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, FLOOR_CENTER_Z]}
        receiveShadow
      >
        <planeGeometry args={[CORRIDOR_WIDTH, FLOOR_LENGTH]} />
        <meshStandardMaterial
          map={carpet}
          color="#cf592d"
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, CORRIDOR_HEIGHT, FLOOR_CENTER_Z]}
        receiveShadow
      >
        <planeGeometry args={[CORRIDOR_WIDTH, FLOOR_LENGTH]} />
        <meshStandardMaterial
          color="#eccd9b"
          roughness={0.94}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, CORRIDOR_HEIGHT - 0.08, FLOOR_CENTER_Z]}>
        <boxGeometry args={[CORRIDOR_WIDTH + 0.2, 0.12, FLOOR_LENGTH]} />
        <meshStandardMaterial color="#c08a59" roughness={0.9} metalness={0.02} />
      </mesh>

      <mesh
        position={[-CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT * 0.62, FLOOR_CENTER_Z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[FLOOR_LENGTH, CORRIDOR_HEIGHT * 0.76]} />
        <meshStandardMaterial
          color="#ead0a4"
          roughness={0.95}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT * 0.62, FLOOR_CENTER_Z]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[FLOOR_LENGTH, CORRIDOR_HEIGHT * 0.76]} />
        <meshStandardMaterial
          color="#ead0a4"
          roughness={0.95}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-CORRIDOR_WIDTH / 2 + 0.05, 0.7, FLOOR_CENTER_Z]}>
        <boxGeometry args={[0.16, 1.4, FLOOR_LENGTH]} />
        <meshStandardMaterial color="#986544" roughness={0.92} metalness={0.02} />
      </mesh>

      <mesh position={[CORRIDOR_WIDTH / 2 - 0.05, 0.7, FLOOR_CENTER_Z]}>
        <boxGeometry args={[0.16, 1.4, FLOOR_LENGTH]} />
        <meshStandardMaterial color="#986544" roughness={0.92} metalness={0.02} />
      </mesh>

      <mesh position={[-CORRIDOR_WIDTH / 2 + 0.05, 1.44, FLOOR_CENTER_Z]}>
        <boxGeometry args={[0.12, 0.08, FLOOR_LENGTH]} />
        <meshStandardMaterial color="#764932" roughness={0.9} metalness={0.02} />
      </mesh>

      <mesh position={[CORRIDOR_WIDTH / 2 - 0.05, 1.44, FLOOR_CENTER_Z]}>
        <boxGeometry args={[0.12, 0.08, FLOOR_LENGTH]} />
        <meshStandardMaterial color="#764932" roughness={0.9} metalness={0.02} />
      </mesh>

      <mesh position={[0, CORRIDOR_HEIGHT / 2, CORRIDOR_END_WALL_Z]}>
        <boxGeometry args={[CORRIDOR_WIDTH, CORRIDOR_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#e2c492" roughness={0.96} metalness={0.01} />
      </mesh>
    </>
  );
}

function SideDoor({
  side,
  z,
  variant = "default",
  visited = false,
}: {
  side: DoorSide;
  z: number;
  variant?: DoorVariant;
  visited?: boolean;
}) {
  const wallX = side === "left" ? -CORRIDOR_WIDTH / 2 + 0.07 : CORRIDOR_WIDTH / 2 - 0.07;
  const rotationY = side === "left" ? Math.PI / 2 : -Math.PI / 2;
  const isRoom237 = variant === "room237";
  const isSpaceRoom = variant === "spaceRoom";
  const isOrangeRoom = variant === "orangeRoom";
  const isArtGallery = variant === "artGallery";
  const isFeaturedDoor = isRoom237 || isSpaceRoom || isOrangeRoom || isArtGallery;

  return (
    <group position={[wallX, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.55, -0.02]}>
        <boxGeometry args={[2.08, 3.05, 0.06]} />
        <meshStandardMaterial color="#d6a169" roughness={0.86} metalness={0.04} />
      </mesh>

      <mesh position={[0, 1.54, 0.04]}>
        <boxGeometry args={[1.78, 2.78, 0.06]} />
        <meshStandardMaterial
          color={
            isRoom237
              ? visited
                ? "#5a876d"
                : "#456d57"
              : isSpaceRoom
                ? visited
                  ? "#e7ddc0"
                  : "#d9d0b5"
                : isOrangeRoom
                  ? visited
                    ? "#d88c49"
                    : "#c97933"
                  : isArtGallery
                    ? visited
                      ? "#ccb08e"
                      : "#b99a76"
                    : "#8b362b"
          }
          emissive={
            isRoom237
              ? visited
                ? "#3a694f"
                : "#163f2d"
              : isSpaceRoom
                ? visited
                  ? "#88774a"
                  : "#5b5136"
                : isOrangeRoom
                  ? visited
                    ? "#86511b"
                    : "#4d2100"
                  : isArtGallery
                    ? visited
                      ? "#7b5d3e"
                      : "#4e3621"
                    : "#000000"
          }
          emissiveIntensity={
            isRoom237
              ? visited
                ? 0.52
                : 0.35
              : isSpaceRoom
                ? visited
                  ? 0.32
                  : 0.18
                : isOrangeRoom
                  ? visited
                    ? 0.38
                    : 0.22
                  : isArtGallery
                    ? visited
                      ? 0.34
                      : 0.2
                    : 0
          }
          roughness={0.9}
          metalness={0.03}
        />
      </mesh>

      <mesh position={[0, 2.92, 0.09]}>
        <boxGeometry args={[0.34, 0.16, 0.04]} />
        <meshStandardMaterial
          color={
            isRoom237
              ? visited
                ? "#e8e0bf"
                : "#d7d0ae"
              : isSpaceRoom
                ? visited
                  ? "#fbf1cf"
                  : "#efe6c7"
                : isOrangeRoom
                  ? visited
                    ? "#ffe1ba"
                    : "#ffd09c"
                  : isArtGallery
                    ? visited
                      ? "#fff0d9"
                      : "#f0e2c9"
                    : "#d9a767"
          }
          emissive={
            isRoom237
              ? visited
                ? "#9ad5b4"
                : "#5fae88"
              : isSpaceRoom
                ? visited
                  ? "#c2af6c"
                  : "#8b7b4a"
                : isOrangeRoom
                  ? visited
                    ? "#bc7131"
                    : "#7d3d00"
                  : isArtGallery
                    ? visited
                      ? "#c9a071"
                      : "#9a7044"
                    : "#000000"
          }
          emissiveIntensity={
            isRoom237
              ? visited
                ? 0.34
                : 0.2
              : isSpaceRoom
                ? visited
                  ? 0.22
                  : 0.12
                : isOrangeRoom
                  ? visited
                    ? 0.24
                    : 0.12
                  : isArtGallery
                    ? visited
                      ? 0.24
                      : 0.14
                    : 0
          }
          roughness={0.62}
          metalness={0.16}
        />
      </mesh>

      <mesh position={[0, 2.48, 0.14]}>
        <boxGeometry args={[0.68, 0.32, 0.05]} />
        <meshStandardMaterial
          color={
            isRoom237
              ? visited
                ? "#ecfff0"
                : "#d8f2d9"
              : isSpaceRoom
                ? visited
                  ? "#fffde5"
                  : "#fff7db"
                : isOrangeRoom
                  ? visited
                    ? "#fff6e3"
                    : "#fff0d4"
                  : isArtGallery
                    ? visited
                      ? "#fff9ee"
                      : "#fff4e2"
                    : "#ffe6b5"
          }
          emissive={
            isRoom237
              ? visited
                ? "#b4ffd8"
                : "#58ffb2"
              : isSpaceRoom
                ? visited
                  ? "#fff8c9"
                  : "#fff0ad"
                : isOrangeRoom
                  ? visited
                    ? "#ffd08d"
                    : "#ffb14a"
                  : isArtGallery
                    ? visited
                      ? "#ffe8c4"
                      : "#ffd7a3"
                    : "#ffcc7a"
          }
          emissiveIntensity={
            isRoom237
              ? visited
                ? 0.98
                : 0.75
              : isSpaceRoom
                ? visited
                  ? 0.78
                  : 0.6
                : isOrangeRoom
                  ? visited
                    ? 0.9
                    : 0.72
                  : isArtGallery
                    ? visited
                      ? 0.76
                      : 0.58
                    : 0.45
          }
          roughness={0.4}
          metalness={0.02}
        />
      </mesh>

      {visited && isFeaturedDoor ? (
        <>
          <DoorMemoryEtching variant={variant} />
          <mesh position={[0, 2.18, 0.14]}>
            <boxGeometry args={[0.38, 0.03, 0.03]} />
            <meshStandardMaterial
              color={isOrangeRoom ? "#ffe2b8" : isRoom237 ? "#dfffe5" : isArtGallery ? "#fff0db" : "#fff5d7"}
              emissive={isOrangeRoom ? "#ffc37a" : isRoom237 ? "#9dffc1" : isArtGallery ? "#ffe0b3" : "#fff2bd"}
              emissiveIntensity={0.72}
              roughness={0.34}
              metalness={0.04}
            />
          </mesh>
          <pointLight
            position={[0, 2.18, 0.34]}
            color={isOrangeRoom ? "#ffc98f" : isRoom237 ? "#9ff3c7" : isArtGallery ? "#ffe0bf" : "#fff1cb"}
            intensity={1.6}
            distance={1.6}
            decay={2}
          />
        </>
      ) : null}

      <mesh position={[0, 0.88, 0.1]}>
        <boxGeometry args={[1.12, 1.06, 0.03]} />
        <meshStandardMaterial
          color={
            isRoom237
              ? "#355440"
              : isSpaceRoom
                ? "#c3b285"
                : isOrangeRoom
                  ? "#8a4012"
                  : isArtGallery
                    ? "#8c6848"
                    : "#7a2d24"
          }
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>

      {isFeaturedDoor ? (
        <pointLight
          position={[0, 2.46, 0.45]}
          color={isRoom237 ? "#7ff9c2" : isSpaceRoom ? "#fff1c9" : isOrangeRoom ? "#ffbb66" : "#ffe2b8"}
          intensity={
            isRoom237
              ? visited
                ? 9.4
                : 8
              : isSpaceRoom
                ? visited
                  ? 7.4
                  : 6
                : isOrangeRoom
                  ? visited
                    ? 8.4
                    : 7
                  : visited
                    ? 7.6
                    : 6.5
          }
          distance={3.8}
          decay={2}
        />
      ) : null}
    </group>
  );
}

function EndDoor({ remainingBolts }: { remainingBolts: number }) {
  const visibleBolts = Math.max(0, Math.min(4, remainingBolts));
  const boltRows = [0.72, 0.24, -0.24, -0.72];
  const unlocked = visibleBolts === 0;

  return (
    <group position={[0, 0, STUDY_ROOM_DOOR_Z]}>
      <mesh position={[0, 1.62, 0.03]}>
        <boxGeometry args={[2.64, 3.22, 0.08]} />
        <meshStandardMaterial color="#d0a070" roughness={0.86} metalness={0.04} />
      </mesh>

      <mesh position={[0, 1.58, 0.1]}>
        <boxGeometry args={[2.22, 2.9, 0.08]} />
        <meshStandardMaterial
          color={unlocked ? "#6d5948" : "#513a31"}
          emissive={unlocked ? "#513a2b" : "#1a0b08"}
          emissiveIntensity={unlocked ? 0.34 : 0.18}
          roughness={0.88}
          metalness={0.04}
        />
      </mesh>

      <mesh position={[0, 2.72, 0.16]}>
        <boxGeometry args={[0.86, 0.34, 0.06]} />
        <meshStandardMaterial
          color={unlocked ? "#fff4db" : "#d8b77d"}
          emissive={unlocked ? "#ffe1a7" : "#7a4f18"}
          emissiveIntensity={unlocked ? 0.64 : 0.18}
          roughness={0.48}
          metalness={0.12}
        />
      </mesh>

      <mesh position={[0, 0.9, 0.15]}>
        <boxGeometry args={[1.42, 1.2, 0.04]} />
        <meshStandardMaterial color={unlocked ? "#7b6350" : "#3f2b24"} roughness={0.94} metalness={0.02} />
      </mesh>

      {boltRows.map((yOffset, index) =>
        index < visibleBolts ? (
          <group key={`study-bolt-${index}`} position={[0, 1.58 + yOffset, 0.22]}>
            <mesh>
              <boxGeometry args={[2.66, 0.13, 0.12]} />
              <meshStandardMaterial color="#3b2b25" roughness={0.72} metalness={0.32} />
            </mesh>
            <mesh position={[-1.42, 0, -0.02]}>
              <boxGeometry args={[0.22, 0.34, 0.12]} />
              <meshStandardMaterial color="#2a1c18" roughness={0.76} metalness={0.24} />
            </mesh>
            <mesh position={[1.42, 0, -0.02]}>
              <boxGeometry args={[0.22, 0.34, 0.12]} />
              <meshStandardMaterial color="#2a1c18" roughness={0.76} metalness={0.24} />
            </mesh>
          </group>
        ) : null,
      )}

      {unlocked ? (
        <>
          <pointLight position={[0, 2.34, 0.72]} color="#ffd9a3" intensity={8.8} distance={5.2} decay={2} />
          <mesh position={[0, 2.22, 0.18]}>
            <boxGeometry args={[0.5, 0.04, 0.04]} />
            <meshStandardMaterial
              color="#fff0ca"
              emissive="#ffe0a3"
              emissiveIntensity={0.88}
              roughness={0.38}
              metalness={0.04}
            />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function CeilingLight({ z, memoryStrength }: { z: number; memoryStrength: number }) {
  const glowStrength = THREE.MathUtils.clamp(memoryStrength, 0, 1);

  return (
    <>
      <mesh position={[0, CORRIDOR_HEIGHT - 0.18, z]}>
        <boxGeometry args={[1.9, 0.12, 0.72]} />
        <meshStandardMaterial
          color={glowStrength > 0.2 ? "#fff5de" : "#fff0cd"}
          emissive={glowStrength > 0.2 ? "#ffe4b1" : "#ffd18a"}
          emissiveIntensity={0.6 + glowStrength * 0.42}
          roughness={0.42}
          metalness={0.02}
        />
      </mesh>
      <pointLight
        position={[0, CORRIDOR_HEIGHT - 0.32, z]}
        color={glowStrength > 0.2 ? "#ffe3bb" : "#ffd8a6"}
        intensity={16 + glowStrength * 4.5}
        distance={12}
        decay={2}
      />
    </>
  );
}

function CorridorRepeats({
  visitedRoomIds,
  remainingStudyRoomBolts,
}: {
  visitedRoomIds: CorridorRoomId[];
  remainingStudyRoomBolts: number;
}) {
  const segmentPositions = useMemo(
    () => Array.from({ length: SEGMENT_COUNT + 3 }, (_, index) => 2 - index * SEGMENT_LENGTH),
    [],
  );
  const visitedRooms = useMemo(() => new Set(visitedRoomIds), [visitedRoomIds]);
  const doorMemoryAnchors = useMemo(
    () => [
      { roomId: "room237" as const, z: ROOM_237_DOOR_Z },
      { roomId: "spaceRoom" as const, z: SPACE_ROOM_DOOR_Z },
      { roomId: "orangeRoom" as const, z: ORANGE_ROOM_DOOR_Z },
      { roomId: "artGallery" as const, z: ART_GALLERY_DOOR_Z },
    ],
    [],
  );

  return (
    <>
      {segmentPositions.map((z, index) => (
        <group key={z}>
          <CeilingLight
            z={z}
            memoryStrength={doorMemoryAnchors.reduce((strongestGlow, anchor) => {
              if (!visitedRooms.has(anchor.roomId)) {
                return strongestGlow;
              }

              const distance = Math.abs(anchor.z - z);

              if (distance > SEGMENT_LENGTH * 1.15) {
                return strongestGlow;
              }

              return Math.max(strongestGlow, 1 - distance / (SEGMENT_LENGTH * 1.15));
            }, 0)}
          />
          <SideDoor
            side="left"
            z={z}
            variant={
              Math.abs(z - SPACE_ROOM_DOOR_Z) < 0.01
                ? "spaceRoom"
                : Math.abs(z - ART_GALLERY_DOOR_Z) < 0.01
                  ? "artGallery"
                  : "default"
            }
            visited={
              Math.abs(z - SPACE_ROOM_DOOR_Z) < 0.01
                ? visitedRooms.has("spaceRoom")
                : Math.abs(z - ART_GALLERY_DOOR_Z) < 0.01
                  ? visitedRooms.has("artGallery")
                  : false
            }
          />
          <SideDoor
            side="right"
            z={z}
            variant={
              Math.abs(z - ROOM_237_DOOR_Z) < 0.01
                ? "room237"
                : Math.abs(z - ORANGE_ROOM_DOOR_Z) < 0.01
                  ? "orangeRoom"
                  : "default"
            }
            visited={
              Math.abs(z - ROOM_237_DOOR_Z) < 0.01
                ? visitedRooms.has("room237")
                : Math.abs(z - ORANGE_ROOM_DOOR_Z) < 0.01
                  ? visitedRooms.has("orangeRoom")
                  : false
            }
          />

          {index < segmentPositions.length - 1 ? (
            <>
              <mesh position={[-CORRIDOR_WIDTH / 2 + 0.09, CORRIDOR_HEIGHT / 2, z - SEGMENT_LENGTH / 2]}>
                <boxGeometry args={[0.18, CORRIDOR_HEIGHT, 0.16]} />
                <meshStandardMaterial color="#bc8b5c" roughness={0.9} metalness={0.02} />
              </mesh>
              <mesh position={[CORRIDOR_WIDTH / 2 - 0.09, CORRIDOR_HEIGHT / 2, z - SEGMENT_LENGTH / 2]}>
                <boxGeometry args={[0.18, CORRIDOR_HEIGHT, 0.16]} />
                <meshStandardMaterial color="#bc8b5c" roughness={0.9} metalness={0.02} />
              </mesh>
            </>
          ) : null}
        </group>
      ))}

      <EndDoor remainingBolts={remainingStudyRoomBolts} />
    </>
  );
}

function GrandmasTvProp() {
  const { scene } = useGLTF(GRANDMAS_TV_MODEL_PATH);
  const tvScene = useMemo(() => scene.clone(true), [scene]);
  const [normalizedScene, setNormalizedScene] = useState<THREE.Group | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    if (!GRANDMAS_TV_DEBUG_ALWAYS_VISIBLE || !groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = GRANDMAS_TV_ROTATION_Y + Math.sin(clock.elapsedTime * 0.9) * 0.42;
    groupRef.current.position.y = GRANDMAS_TV_POSITION[1] + Math.sin(clock.elapsedTime * 1.2) * 0.05;
  });

  useEffect(() => {
    const working = tvScene.clone(true);
    const box = new THREE.Box3().setFromObject(working);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeHeight = Math.max(size.y, 0.001);
    const scale = GRANDMAS_TV_TARGET_HEIGHT / safeHeight;

    working.position.sub(center);
    working.position.y += size.y * 0.5;
    working.scale.setScalar(scale);

    working.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        child.material = materials.map((material) => {
          const nextMaterial = material.clone();

          if ("emissive" in nextMaterial) {
            nextMaterial.emissive = new THREE.Color("#2a221c");
            nextMaterial.emissiveIntensity = 0.45;
          }

          if ("roughness" in nextMaterial && typeof nextMaterial.roughness === "number") {
            nextMaterial.roughness = Math.min(nextMaterial.roughness, 0.72);
          }

          return nextMaterial;
        });
      }
    });

    setNormalizedScene(working);
  }, [tvScene]);

  if (!normalizedScene) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={GRANDMAS_TV_POSITION}
      rotation={[0, GRANDMAS_TV_ROTATION_Y, 0]}
    >
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.82, 0.92, 0.16, 24]} />
        <meshStandardMaterial
          color="#291813"
          emissive="#120907"
          emissiveIntensity={0.16}
          roughness={0.88}
          metalness={0.08}
        />
      </mesh>

      <primitive object={normalizedScene} position={[0, 0.72, 0]} />

      <pointLight
        position={[0, 0.76, 0.48]}
        color="#ffd7ae"
        intensity={3.4}
        distance={6.8}
        decay={2}
      />

      <pointLight
        position={[0, 1.3, -0.8]}
        color="#8fd3ff"
        intensity={1.8}
        distance={4.2}
        decay={2}
      />
    </group>
  );
}

function TwinsEasterEgg({
  motion,
  activeRoomId,
  previewMode,
  ambientLightRef,
  directionalLightRef,
}: {
  motion: MutableRefObject<RideMotionState>;
  activeRoomId: CorridorRoomId | null;
  previewMode: boolean;
  ambientLightRef: MutableRefObject<THREE.AmbientLight | null>;
  directionalLightRef: MutableRefObject<THREE.DirectionalLight | null>;
}) {
  const twinsTexture = useTexture(TWINS_TEXTURE_PATH);
  const groupRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const flashLightRef = useRef<THREE.PointLight | null>(null);
  const hasTriggeredRef = useRef(false);
  const triggerStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    twinsTexture.wrapS = THREE.ClampToEdgeWrapping;
    twinsTexture.wrapT = THREE.ClampToEdgeWrapping;
    twinsTexture.needsUpdate = true;
  }, [twinsTexture]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const material = materialRef.current;
    const light = lightRef.current;
    const flashLight = flashLightRef.current;
    const ambientLight = ambientLightRef.current;
    const directionalLight = directionalLightRef.current;

    if (!group || !material || !light || !flashLight) {
      return;
    }

    const hideTwins = () => {
      group.visible = false;
      material.opacity = 0;
      light.intensity = 0;
      flashLight.intensity = 0;

      if (ambientLight) {
        ambientLight.intensity = CORRIDOR_AMBIENT_INTENSITY;
      }

      if (directionalLight) {
        directionalLight.intensity = CORRIDOR_DIRECTIONAL_INTENSITY;
      }
    };

    if (previewMode || activeRoomId !== null) {
      hideTwins();
      return;
    }

    if (TWINS_DEBUG_ALWAYS_VISIBLE) {
      group.visible = true;
      group.position.x = -3;
      material.opacity = 1;
      light.intensity = 3.8;
      flashLight.intensity = 0;

      if (ambientLight) {
        ambientLight.intensity = CORRIDOR_AMBIENT_INTENSITY;
      }

      if (directionalLight) {
        directionalLight.intensity = CORRIDOR_DIRECTIONAL_INTENSITY;
      }

      return;
    }

    if (!hasTriggeredRef.current && motion.current.z <= TWINS_TRIGGER_CAMERA_Z) {
      hasTriggeredRef.current = true;
      triggerStartedAtRef.current = clock.elapsedTime * 1000;
    }

    if (triggerStartedAtRef.current === null) {
      hideTwins();
      return;
    }

    const elapsedMs = clock.elapsedTime * 1000 - triggerStartedAtRef.current;
    let opacity = 0;

    if (elapsedMs <= TWINS_FADE_IN_MS) {
      opacity = (elapsedMs / TWINS_FADE_IN_MS) * TWINS_MAX_OPACITY;
    } else if (elapsedMs <= TWINS_FADE_IN_MS + TWINS_HOLD_MS) {
      opacity = TWINS_MAX_OPACITY;
    } else if (elapsedMs <= TWINS_DURATION_MS) {
      const fadeOutProgress =
        (elapsedMs - TWINS_FADE_IN_MS - TWINS_HOLD_MS) /
        (TWINS_DURATION_MS - TWINS_FADE_IN_MS - TWINS_HOLD_MS);
      opacity = (1 - fadeOutProgress) * TWINS_MAX_OPACITY;
    }

    if (opacity <= 0.004) {
      hideTwins();
      return;
    }

    const shimmer = 0.98 + Math.sin(clock.elapsedTime * 8.2) * 0.04;
    const initialFlashWindow = elapsedMs < 760;
    const flashPulse = initialFlashWindow
      ? 0.65 + Math.max(0, Math.sin(clock.elapsedTime * 38)) * 1.18
      : 0.2 + Math.max(0, Math.sin(clock.elapsedTime * 18)) * 0.28;
    const corridorDarken = initialFlashWindow ? 0.22 + Math.max(0, Math.sin(clock.elapsedTime * 26)) * 0.16 : 0;
    group.visible = true;
    group.position.x = -1.14 + Math.sin(clock.elapsedTime * 0.45) * 0.02;
    material.opacity = opacity * shimmer;
    light.intensity = opacity * (5.2 + flashPulse);
    flashLight.intensity = opacity * (initialFlashWindow ? 12.4 : 3.4) * flashPulse;

    if (ambientLight) {
      ambientLight.intensity = CORRIDOR_AMBIENT_INTENSITY * (1 - corridorDarken);
    }

    if (directionalLight) {
      directionalLight.intensity = CORRIDOR_DIRECTIONAL_INTENSITY * (1 - corridorDarken * 1.35);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, TWINS_DOOR_Z]}
      rotation={[0, Math.PI, 0]}
      visible={false}
    >
      <mesh position={[0, 1.58, 0.18]}>
        <planeGeometry args={[2.42, 3.16]} />
        <meshBasicMaterial
          ref={materialRef}
          map={twinsTexture}
          transparent={false}
          opacity={1}
          alphaTest={0}
          depthWrite
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 1.72, 0.74]}
        color="#f7efe0"
        intensity={0}
        distance={5.2}
        decay={2}
      />
      <pointLight
        ref={flashLightRef}
        position={[0, 2.42, 1.1]}
        color="#fff4e1"
        intensity={0}
        distance={9.4}
        decay={2}
      />
    </group>
  );
}

function CorridorSceneContent({
  input,
  motion,
  visitedRoomIds,
  remainingStudyRoomBolts,
  activeRoomId,
  previewMode = false,
  controlsEnabled = true,
}: {
  input: MutableRefObject<RideInputState>;
  motion: MutableRefObject<RideMotionState>;
  visitedRoomIds: CorridorRoomId[];
  remainingStudyRoomBolts: number;
  activeRoomId: CorridorRoomId | null;
  previewMode?: boolean;
  controlsEnabled?: boolean;
}) {
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

  useEffect(() => {
    if (!controlsEnabled) {
      return;
    }

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
  }, [controlsEnabled]);

  return (
    <>
      <color attach="background" args={["#140303"]} />
      <fog attach="fog" args={["#140303", 14, 92]} />

      <PerspectiveCamera
        makeDefault
        position={[0, CAMERA_HEIGHT, CAMERA_START_Z]}
        fov={53}
        near={0.1}
        far={160}
      />

      <RideRig input={input} motion={motion} />
      <TricycleForeground motion={motion} />

      <ambientLight ref={ambientLightRef} intensity={CORRIDOR_AMBIENT_INTENSITY} color="#f4d6af" />
      <directionalLight
        ref={directionalLightRef}
        position={[0, CORRIDOR_HEIGHT + 1.2, CAMERA_START_Z]}
        intensity={CORRIDOR_DIRECTIONAL_INTENSITY}
        color="#fff1cf"
      />

      <CorridorShell />
      <CorridorRepeats visitedRoomIds={visitedRoomIds} remainingStudyRoomBolts={remainingStudyRoomBolts} />
      <TwinsEasterEgg
        motion={motion}
        activeRoomId={activeRoomId}
        previewMode={previewMode}
        ambientLightRef={ambientLightRef}
        directionalLightRef={directionalLightRef}
      />
    </>
  );
}

export default function OverlookCorridorScene({
  previewMode = false,
  soundEnabled = true,
}: {
  previewMode?: boolean;
  soundEnabled?: boolean;
}) {
  const { active, progress } = useProgress();
  const input = useRef<RideInputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const motion = useRef<RideMotionState>({
    x: 0,
    z: CAMERA_START_Z,
    forwardVelocity: 0,
    steerVelocity: 0,
    yaw: 0,
  });
  const [promptRoomId, setPromptRoomId] = useState<CorridorRoomId | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<CorridorRoomId | null>(null);
  const [isActiveRoomReady, setIsActiveRoomReady] = useState(false);
  const [interactionPromptRoomId, setInteractionPromptRoomId] = useState<CorridorRoomId | null>(null);
  const [visitedRoomIds, setVisitedRoomIds] = useState<CorridorRoomId[]>([]);
  const [showCorridorIntroCard, setShowCorridorIntroCard] = useState(false);
  const [showCorridorHud, setShowCorridorHud] = useState(false);
  const [studyArtifactProgress, setStudyArtifactProgress] = useState<StudyArtifactProgress>(INITIAL_STUDY_ARTIFACT_PROGRESS);
  const [studySequencePhase, setStudySequencePhase] = useState<StudySequencePhase>("idle");
  const [studyCurtainsClosed, setStudyCurtainsClosed] = useState(false);
  const [showStudyVideo, setShowStudyVideo] = useState(false);
  const [showStudyEndingActions, setShowStudyEndingActions] = useState(false);
  const [showStudyCopyToast, setShowStudyCopyToast] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const interactionPromptSourcesRef = useRef(new Map<CorridorRoomId, Set<string>>());
  const studyVideoRef = useRef<HTMLVideoElement | null>(null);
  const hallwayAudioRef = useRef<HTMLAudioElement | null>(null);
  const room237AudioRef = useRef<HTMLAudioElement | null>(null);
  const spaceRoomAudioRef = useRef<HTMLAudioElement | null>(null);
  const orangeRoomAudioRef = useRef<HTMLAudioElement | null>(null);
  const artGalleryAudioRef = useRef<HTMLAudioElement | null>(null);
  const studyRoomAudioRef = useRef<HTMLAudioElement | null>(null);
  const studyEndingAudioRef = useRef<HTMLAudioElement | null>(null);
  const studyActionsAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const createLoopAudio = (src: string, volume: number) => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.preload = "auto";
      return audio;
    };

    hallwayAudioRef.current = createLoopAudio(HALLWAY_AUDIO_PATH, 1);
    room237AudioRef.current = createLoopAudio(ROOM_237_AUDIO_PATH, 0.12);
    spaceRoomAudioRef.current = createLoopAudio(SPACE_ROOM_AUDIO_PATH, 0.98);
    orangeRoomAudioRef.current = createLoopAudio(ORANGE_ROOM_AUDIO_PATH, 0.72);
    artGalleryAudioRef.current = createLoopAudio(ART_GALLERY_AUDIO_PATH, 0.24);
    studyRoomAudioRef.current = createLoopAudio(STUDY_ROOM_AUDIO_PATH, 0.25);

    const studyEndingAudio = new Audio(STUDY_ENDING_AUDIO_PATH);
    studyEndingAudio.loop = false;
    studyEndingAudio.volume = 0.78;
    studyEndingAudio.playbackRate = 0.8;
    studyEndingAudio.preload = "auto";
    studyEndingAudioRef.current = studyEndingAudio;

    const studyActionsAudio = new Audio(STUDY_ACTIONS_AUDIO_PATH);
    studyActionsAudio.loop = true;
    studyActionsAudio.volume = 0.56;
    studyActionsAudio.preload = "auto";
    studyActionsAudioRef.current = studyActionsAudio;

    return () => {
      [
        hallwayAudioRef.current,
        room237AudioRef.current,
        spaceRoomAudioRef.current,
        orangeRoomAudioRef.current,
        artGalleryAudioRef.current,
        studyRoomAudioRef.current,
        studyEndingAudioRef.current,
        studyActionsAudioRef.current,
      ].forEach((audio) => {
        if (!audio) {
          return;
        }

        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    const audioEntries = [
      hallwayAudioRef.current,
      room237AudioRef.current,
      spaceRoomAudioRef.current,
      orangeRoomAudioRef.current,
      artGalleryAudioRef.current,
      studyRoomAudioRef.current,
    ];

    const stopAudio = (audio: HTMLAudioElement | null) => {
      if (!audio) {
        return;
      }

      audio.pause();
      audio.currentTime = 0;
    };

    if (!soundEnabled || previewMode) {
      audioEntries.forEach(stopAudio);
      stopAudio(studyEndingAudioRef.current);
      stopAudio(studyActionsAudioRef.current);
      return;
    }

    const nextAudio =
      activeRoomId === null
        ? hallwayAudioRef.current
        : activeRoomId === "room237"
          ? room237AudioRef.current
        : activeRoomId === "spaceRoom"
            ? spaceRoomAudioRef.current
        : activeRoomId === "orangeRoom"
              ? orangeRoomAudioRef.current
            : activeRoomId === "artGallery"
              ? artGalleryAudioRef.current
              : activeRoomId === "studyRoom" && studySequencePhase === "idle"
                ? studyRoomAudioRef.current
                : null;

    audioEntries.forEach((audio) => {
      if (!audio || audio === nextAudio) {
        return;
      }

      stopAudio(audio);
    });

    if (!nextAudio) {
      return;
    }

    void nextAudio.play().catch(() => undefined);
  }, [activeRoomId, previewMode, soundEnabled, studySequencePhase]);

  useEffect(() => {
    const studyEndingAudio = studyEndingAudioRef.current;

    if (!studyEndingAudio) {
      return;
    }

    if (
      !soundEnabled ||
      previewMode ||
      activeRoomId !== "studyRoom" ||
      studySequencePhase !== "video"
    ) {
      studyEndingAudio.pause();
      studyEndingAudio.currentTime = 0;
      return;
    }

    studyEndingAudio.currentTime = 0;
    studyEndingAudio.playbackRate = 0.8;
    void studyEndingAudio.play().catch(() => undefined);

    return () => {
      studyEndingAudio.pause();
      studyEndingAudio.currentTime = 0;
    };
  }, [activeRoomId, previewMode, soundEnabled, studySequencePhase]);

  useEffect(() => {
    const studyActionsAudio = studyActionsAudioRef.current;

    if (!studyActionsAudio) {
      return;
    }

    if (
      !soundEnabled ||
      previewMode ||
      activeRoomId !== "studyRoom" ||
      studySequencePhase !== "ending" ||
      !showStudyEndingActions
    ) {
      studyActionsAudio.pause();
      studyActionsAudio.currentTime = 0;
      return;
    }

    void studyActionsAudio.play().catch(() => undefined);

    return () => {
      studyActionsAudio.pause();
      studyActionsAudio.currentTime = 0;
    };
  }, [activeRoomId, previewMode, showStudyEndingActions, soundEnabled, studySequencePhase]);

  useEffect(() => {
    if (previewMode) {
      setPromptRoomId(null);
      return;
    }

    let frameId = 0;

    const updatePrompt = () => {
      if (!activeRoomId) {
        const nearRoom237 =
          motion.current.x > ROOM_PROMPT_X &&
          Math.abs(motion.current.z - ROOM_237_DOOR_Z) < DOOR_PROMPT_Z_RANGE;
        const nearSpaceRoom =
          motion.current.x < SPACE_ROOM_PROMPT_X &&
          Math.abs(motion.current.z - SPACE_ROOM_DOOR_Z) < DOOR_PROMPT_Z_RANGE;
        const nearOrangeRoom =
          motion.current.x > ORANGE_ROOM_PROMPT_X &&
          Math.abs(motion.current.z - ORANGE_ROOM_DOOR_Z) < DOOR_PROMPT_Z_RANGE;
        const nearArtGallery =
          motion.current.x < ART_GALLERY_PROMPT_X &&
          Math.abs(motion.current.z - ART_GALLERY_DOOR_Z) < DOOR_PROMPT_Z_RANGE;
        const nearStudyRoom =
          Math.abs(motion.current.x) < 2.2 &&
          Math.abs(motion.current.z - STUDY_ROOM_DOOR_Z) < END_DOOR_PROMPT_Z_RANGE;
        const nextPrompt = nearRoom237
          ? "room237"
          : nearSpaceRoom
            ? "spaceRoom"
            : nearOrangeRoom
              ? "orangeRoom"
              : nearArtGallery
                ? "artGallery"
                : nearStudyRoom
                  ? "studyRoom"
                  : null;

        setPromptRoomId((current) => (current === nextPrompt ? current : nextPrompt));
      } else if (promptRoomId) {
        setPromptRoomId(null);
      }

      frameId = window.requestAnimationFrame(updatePrompt);
    };

    frameId = window.requestAnimationFrame(updatePrompt);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeRoomId, previewMode, promptRoomId]);

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const studySequenceLocked =
        activeRoomId === "studyRoom" &&
        (studySequencePhase === "closingToVideo" ||
          studySequencePhase === "video" ||
          studySequencePhase === "closingToEnding");

      if (studySequenceLocked && (event.key === "Escape" || event.key === "Enter")) {
        event.preventDefault();
        return;
      }

      if (event.key === "Enter" && promptRoomId && !activeRoomId) {
        event.preventDefault();
        input.current.forward = false;
        input.current.backward = false;
        input.current.left = false;
        input.current.right = false;
        setIsActiveRoomReady(false);
        setActiveRoomId(promptRoomId);
      } else if (event.key === "Escape" && activeRoomId) {
        event.preventDefault();

        const escapeState = { handled: false, roomId: activeRoomId };
        window.dispatchEvent(
          new CustomEvent("room-escape-request", {
            detail: escapeState,
          }),
        );

        if (escapeState.handled) {
          return;
        }

        setActiveRoomId(null);
        setIsActiveRoomReady(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeRoomId, previewMode, promptRoomId, studySequencePhase, visitedRoomIds]);

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const handleInteractionPrompt = (event: Event) => {
      const customEvent = event as CustomEvent<{ roomId?: CorridorRoomId; visible?: boolean; sourceId?: string }>;
      const roomId = customEvent.detail?.roomId ?? null;
      const visible = customEvent.detail?.visible ?? false;
      const sourceId = customEvent.detail?.sourceId ?? null;

      if (!roomId) {
        return;
      }

      if (sourceId) {
        const currentSources = interactionPromptSourcesRef.current.get(roomId) ?? new Set<string>();

        if (visible) {
          currentSources.add(sourceId);
          interactionPromptSourcesRef.current.set(roomId, currentSources);
        } else {
          currentSources.delete(sourceId);

          if (currentSources.size > 0) {
            interactionPromptSourcesRef.current.set(roomId, currentSources);
          } else {
            interactionPromptSourcesRef.current.delete(roomId);
          }
        }

        setInteractionPromptRoomId((current) => {
          const hasVisibleSources = (interactionPromptSourcesRef.current.get(roomId)?.size ?? 0) > 0;

          if (!hasVisibleSources) {
            return current === roomId ? null : current;
          }

          return roomId;
        });

        return;
      }

      setInteractionPromptRoomId((current) => {
        if (!visible) {
          return current === roomId ? null : current;
        }

        return roomId;
      });
    };

    window.addEventListener("room-interaction-prompt", handleInteractionPrompt as EventListener);

    return () => {
      window.removeEventListener("room-interaction-prompt", handleInteractionPrompt as EventListener);
    };
  }, [previewMode]);

  useEffect(() => {
    if (previewMode) {
      interactionPromptSourcesRef.current.clear();
      setInteractionPromptRoomId(null);
      return;
    }

    if (!activeRoomId) {
      interactionPromptSourcesRef.current.clear();
      setInteractionPromptRoomId(null);
      return;
    }

    setInteractionPromptRoomId((current) => (current === activeRoomId ? current : null));
  }, [activeRoomId, previewMode]);

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const handleStudyArtifactState = (
      event: Event,
    ) => {
      const customEvent = event as CustomEvent<{
        artifactId?: StudyArtifactId;
        isOpen?: boolean;
        opened?: boolean;
      }>;
      const artifactId = customEvent.detail?.artifactId ?? null;

      if (!artifactId) {
        return;
      }

      setStudyArtifactProgress((current) => ({
        ...current,
        [artifactId]: {
          opened: customEvent.detail?.opened ?? current[artifactId].opened,
          isOpen: customEvent.detail?.isOpen ?? current[artifactId].isOpen,
        },
      }));
    };

    window.addEventListener("study-room-artifact-state", handleStudyArtifactState as EventListener);

    return () => {
      window.removeEventListener("study-room-artifact-state", handleStudyArtifactState as EventListener);
    };
  }, [previewMode]);

  useEffect(() => {
    if (previewMode) {
      setStudyArtifactProgress(INITIAL_STUDY_ARTIFACT_PROGRESS);
      setStudySequencePhase("idle");
      setStudyCurtainsClosed(false);
      setShowStudyVideo(false);
      setShowStudyEndingActions(false);
      setShowStudyCopyToast(false);
      setShowQuickMenu(false);
      return;
    }

    if (activeRoomId === "studyRoom") {
      return;
    }

    setStudyArtifactProgress(INITIAL_STUDY_ARTIFACT_PROGRESS);
    setStudySequencePhase("idle");
    setStudyCurtainsClosed(false);
    setShowStudyVideo(false);
    setShowStudyEndingActions(false);
    setShowStudyCopyToast(false);
    setShowQuickMenu(false);
  }, [activeRoomId, previewMode]);

  useEffect(() => {
    if (previewMode || activeRoomId !== "studyRoom" || studySequencePhase !== "idle") {
      return;
    }

    const allArtifactsOpened = STUDY_ARTIFACT_IDS.every((artifactId) => studyArtifactProgress[artifactId].opened);
    const hasOpenArtifact = STUDY_ARTIFACT_IDS.some((artifactId) => studyArtifactProgress[artifactId].isOpen);

    if (!allArtifactsOpened || hasOpenArtifact) {
      return;
    }

    input.current.forward = false;
    input.current.backward = false;
    input.current.left = false;
    input.current.right = false;
    setStudyCurtainsClosed(true);
    setShowStudyVideo(false);
    setStudySequencePhase("closingToVideo");
  }, [activeRoomId, previewMode, studyArtifactProgress, studySequencePhase]);

  useEffect(() => {
    if (studySequencePhase !== "closingToVideo") {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowStudyVideo(true);
      setStudySequencePhase("video");

      window.requestAnimationFrame(() => {
        setStudyCurtainsClosed(false);

        if (studyVideoRef.current) {
          studyVideoRef.current.currentTime = 0;
          studyVideoRef.current.playbackRate = 0.8;
          void studyVideoRef.current.play().catch(() => undefined);
        }
      });
    }, STUDY_CURTAIN_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [studySequencePhase]);

  useEffect(() => {
    if (studySequencePhase !== "closingToEnding") {
      return;
    }

    const timer = window.setTimeout(() => {
      if (studyVideoRef.current) {
        studyVideoRef.current.pause();
      }

      setShowStudyVideo(false);
      setStudySequencePhase("ending");
    }, STUDY_CURTAIN_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [studySequencePhase]);

  useEffect(() => {
    if (studySequencePhase !== "ending") {
      setShowStudyEndingActions(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowStudyEndingActions(true);
    }, STUDY_ENDING_ACTION_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [studySequencePhase]);

  useEffect(() => {
    if (!showStudyCopyToast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowStudyCopyToast(false);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showStudyCopyToast]);

  useEffect(() => {
    if (previewMode || activeRoomId !== null) {
      setShowCorridorIntroCard(false);
      setShowCorridorHud(false);
      return;
    }

    setShowCorridorIntroCard(true);
    setShowCorridorHud(false);

    const timer = window.setTimeout(() => {
      setShowCorridorIntroCard(false);
      setShowCorridorHud(true);
    }, 2800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeRoomId, previewMode]);

  const sideVisitedRoomCount = SIDE_ROOM_IDS.reduce(
    (visitedCount, roomId) => visitedCount + Number(visitedRoomIds.includes(roomId)),
    0,
  );
  const remainingStudyRoomBolts = Math.max(0, SIDE_ROOM_IDS.length - sideVisitedRoomCount);
  const visitedRoomCount = visitedRoomIds.length;
  const totalRoomCount = VISITABLE_ROOM_IDS.length;
  const corridorMemoryCopy = getCorridorMemoryCopy(visitedRoomCount, totalRoomCount);
  const corridorControlCopy =
    visitedRoomCount >= totalRoomCount
      ? "WASD Or Arrows // Roam Freely"
      : "WASD Or Arrows // Enter At A Door";
  const markRoomAsVisited = (roomId: CorridorRoomId) => {
    setVisitedRoomIds((current) => (current.includes(roomId) ? current : [...current, roomId]));
  };

  const activeRoomProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const showActiveRoomLoading = activeRoomId !== null && (!isActiveRoomReady || active);
  const studyArtifactsExploredCount = STUDY_ARTIFACT_IDS.reduce(
    (count, artifactId) => count + Number(studyArtifactProgress[artifactId].opened),
    0,
  );
  const hasOpenStudyArtifact = STUDY_ARTIFACT_IDS.some((artifactId) => studyArtifactProgress[artifactId].isOpen);
  const studyRoomArtifactCopy = getStudyRoomArtifactCopy(
    studyArtifactsExploredCount,
    STUDY_ARTIFACT_IDS.length,
    hasOpenStudyArtifact,
    studySequencePhase,
  );
  const isStudySequenceOverlayVisible =
    activeRoomId === "studyRoom" && studySequencePhase !== "idle";
  const showInRoomInteractionPrompt =
    activeRoomId !== null &&
    isActiveRoomReady &&
    !showActiveRoomLoading &&
    interactionPromptRoomId === activeRoomId &&
    !isStudySequenceOverlayVisible;

  const handleStudyCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("rfiv12679@gmail.com");
      setShowStudyCopyToast(true);
    } catch {
      setShowStudyCopyToast(false);
    }
  };

  const handleStudyDownloadPdf = () => {
    const anchor = document.createElement("a");
    anchor.href = STUDY_RESUME_PDF_PATH;
    anchor.download = "Yu-Nien-Liu-Resume.pdf";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleStudyOpenExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleStudyReturnToGallery = () => {
    window.location.reload();
  };

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
        shadows={false}
        style={{
          background:
            activeRoomId === "room237"
              ? "#09110d"
              : activeRoomId === "spaceRoom"
                ? "#efe8da"
                : activeRoomId === "orangeRoom"
                  ? "#24120a"
                  : activeRoomId === "artGallery"
                    ? "#efe9df"
                    : activeRoomId === "studyRoom"
                      ? "#120f0d"
                  : "#140303",
        }}
      >
        <Suspense fallback={null}>
          {previewMode ? (
            <CorridorSceneContent
              input={input}
              motion={motion}
              visitedRoomIds={visitedRoomIds}
              remainingStudyRoomBolts={remainingStudyRoomBolts}
              activeRoomId={activeRoomId}
              previewMode={previewMode}
              controlsEnabled={false}
            />
          ) : activeRoomId === "room237" ? (
            <Room237SceneContent
              input={input}
              onReady={() => {
                setIsActiveRoomReady(true);
                markRoomAsVisited("room237");
              }}
            />
          ) : activeRoomId === "spaceRoom" ? (
            <SpaceRoomSceneContent
              input={input}
              onReady={() => {
                setIsActiveRoomReady(true);
                markRoomAsVisited("spaceRoom");
              }}
            />
          ) : activeRoomId === "orangeRoom" ? (
            <OrangeRoomSceneContent
              input={input}
              onReady={() => {
                setIsActiveRoomReady(true);
                markRoomAsVisited("orangeRoom");
              }}
            />
          ) : activeRoomId === "artGallery" ? (
            <ArtGallerySceneContent
              input={input}
              onReady={() => {
                setIsActiveRoomReady(true);
                markRoomAsVisited("artGallery");
              }}
            />
          ) : activeRoomId === "studyRoom" ? (
            <StudyRoomSceneContent
              input={input}
              controlsEnabled={!isStudySequenceOverlayVisible}
              onReady={() => {
                setIsActiveRoomReady(true);
                markRoomAsVisited("studyRoom");
              }}
            />
          ) : (
            <CorridorSceneContent
              input={input}
              motion={motion}
              visitedRoomIds={visitedRoomIds}
              remainingStudyRoomBolts={remainingStudyRoomBolts}
              activeRoomId={activeRoomId}
              previewMode={previewMode}
            />
          )}
        </Suspense>
      </Canvas>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0) 36%, rgba(0,0,0,0.2) 72%, rgba(0,0,0,0.64) 100%)",
        }}
      />

      {!previewMode && !showActiveRoomLoading && !isStudySequenceOverlayVisible ? (
        <div className="absolute right-4 top-4 z-[19] flex max-w-[min(42rem,calc(100%-2rem))] justify-end">
          <div className="pointer-events-auto relative flex items-center justify-end gap-2 px-1 py-1">
            <button
              type="button"
              onClick={handleStudyDownloadPdf}
              className="flex h-9 items-center rounded-full bg-black/16 px-3.5 text-[0.5rem] uppercase tracking-[0.28em] text-emerald-50/62 backdrop-blur-md transition hover:bg-black/28 hover:text-emerald-50/88"
            >
              Resume
            </button>

            <button
              type="button"
              onClick={() => {
                setShowQuickMenu((current) => !current);
              }}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/16 text-emerald-50/60 backdrop-blur-md transition hover:bg-black/28 hover:text-emerald-50/86"
            >
              <span className="flex flex-col gap-[3px]">
                <span className="block h-[1px] w-3.5 bg-current" />
                <span className="block h-[1px] w-3.5 bg-current" />
                <span className="block h-[1px] w-3.5 bg-current" />
              </span>
            </button>

            {showQuickMenu ? (
              <div className="absolute right-0 top-12 min-w-[10.5rem] rounded-[18px] bg-black/34 p-2 backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleStudyCopyEmail();
                      setShowQuickMenu(false);
                    }}
                    className="rounded-[14px] px-3 py-2 text-left text-[0.5rem] uppercase tracking-[0.28em] text-emerald-50/68 transition hover:bg-white/[0.06] hover:text-emerald-50/92"
                  >
                    Copy Email
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleStudyOpenExternal("https://github.com/Charlieeeebrownnnn");
                      setShowQuickMenu(false);
                    }}
                    className="rounded-[14px] px-3 py-2 text-left text-[0.5rem] uppercase tracking-[0.28em] text-emerald-50/68 transition hover:bg-white/[0.06] hover:text-emerald-50/92"
                  >
                    GitHub
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleStudyOpenExternal("https://www.linkedin.com/in/yu-nien-liu?locale=en_US");
                      setShowQuickMenu(false);
                    }}
                    className="rounded-[14px] px-3 py-2 text-left text-[0.5rem] uppercase tracking-[0.28em] text-emerald-50/68 transition hover:bg-white/[0.06] hover:text-emerald-50/92"
                  >
                    LinkedIn
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {!previewMode && promptRoomId && !activeRoomId ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-32 z-10 flex justify-center px-6 text-white">
          <div className="rounded-full border border-emerald-200/20 bg-black/35 px-4 py-2 text-[0.58rem] uppercase tracking-[0.34em] text-emerald-100/85 backdrop-blur-[2px]">
            {getRoomLabel(promptRoomId)} // Press Enter
          </div>
        </div>
      ) : null}

      {!previewMode && !activeRoomId && showCorridorHud ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-2 px-6 text-white">
          <div className="text-[0.56rem] uppercase tracking-[0.34em] text-emerald-50/62">
            {corridorMemoryCopy}
          </div>
          <div className="rounded-full border border-emerald-200/16 bg-black/24 px-4 py-2 text-[0.58rem] uppercase tracking-[0.34em] text-emerald-50/74 backdrop-blur-[2px]">
            {corridorControlCopy}
          </div>
        </div>
      ) : null}

      {!previewMode && showCorridorIntroCard ? (
        <div className="pointer-events-none absolute inset-0 z-[18] flex items-center justify-center px-6 text-white">
          <div className="story-intro-overlay">
            Each door opens onto a different part of my work.
          </div>
        </div>
      ) : null}

      {!previewMode && activeRoomId && !isStudySequenceOverlayVisible ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex flex-col items-center gap-2 px-6 text-white">
          {activeRoomId === "studyRoom" ? (
            <div className="text-[0.56rem] uppercase tracking-[0.34em] text-emerald-50/62">
              {studyRoomArtifactCopy}
            </div>
          ) : null}

          {showInRoomInteractionPrompt ? (
            <div
              className="text-[0.86rem] font-semibold uppercase tracking-[0.34em] text-sky-200/90"
              style={{
                textShadow:
                  "0 0 8px rgba(142, 215, 255, 0.42), 0 0 22px rgba(88, 186, 255, 0.78), 0 0 34px rgba(48, 144, 255, 0.48)",
                animation: "museumPromptPulse 0.82s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              }}
            >
              Enter To Interact
            </div>
          ) : null}

          <div className="rounded-full border border-emerald-200/18 bg-black/28 px-4 py-2 text-[0.58rem] uppercase tracking-[0.34em] text-emerald-50/78 backdrop-blur-[2px]">
            Explore {getRoomLabel(activeRoomId)} // WASD Or Arrows // Esc To Return
          </div>
        </div>
      ) : null}

      {!previewMode && activeRoomId === "studyRoom" && isStudySequenceOverlayVisible ? (
        <div className="pointer-events-none absolute inset-0 z-[28] overflow-hidden">
          {showStudyVideo ? (
            <video
              ref={studyVideoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={STUDY_VIDEO_PATH}
              autoPlay
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={(event) => {
                event.currentTarget.playbackRate = 0.8;
              }}
              onEnded={() => {
                setStudyCurtainsClosed(true);
                setStudySequencePhase("closingToEnding");
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-black" />
          )}

          <div
            className="absolute inset-x-0 top-0 bg-black transition-[height] duration-[920ms] ease-in-out"
            style={{ height: studyCurtainsClosed ? "50%" : "0%" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-black transition-[height] duration-[920ms] ease-in-out"
            style={{ height: studyCurtainsClosed ? "50%" : "0%" }}
          />

          {studySequencePhase === "ending" ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">
              <div className="flex w-full max-w-3xl flex-col items-center gap-8">
                <div
                  className="text-[0.92rem] uppercase tracking-[0.42em] text-emerald-50/90"
                  style={{
                    textShadow:
                      "0 0 8px rgba(242, 242, 242, 0.2), 0 0 20px rgba(255, 255, 255, 0.22)",
                    animation: "studyEndingPulse 1.65s ease-in-out infinite",
                  }}
                >
                  From instinct to intention.
                </div>

                {showStudyEndingActions ? (
                  <div className="pointer-events-auto flex w-full max-w-3xl flex-col items-center gap-5">
                    <div className="w-full border-t border-white/12" />

                    <div className="grid w-full gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleStudyCopyEmail}
                        className="group relative overflow-hidden border border-white/14 bg-white/[0.035] px-5 py-4 text-left transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-white/28 hover:bg-white/[0.075] hover:shadow-[0_18px_46px_rgba(0,0,0,0.24)]"
                        style={{ borderRadius: "22px 10px 24px 12px" }}
                      >
                        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(170,235,220,0.05)_100%)] opacity-80 transition duration-300 group-hover:opacity-100" />
                        <span className="pointer-events-none absolute -right-10 top-3 h-20 w-20 rounded-full bg-emerald-100/6 blur-2xl transition duration-300 group-hover:bg-emerald-100/12" />
                        <span className="relative block text-[0.53rem] uppercase tracking-[0.34em] text-emerald-50/46">
                          Contact
                        </span>
                        <span className="relative mt-2 block text-[0.76rem] uppercase tracking-[0.28em] text-emerald-50/92">
                          Copy Email
                        </span>
                        <span className="relative mt-3 block text-[0.54rem] uppercase tracking-[0.24em] text-emerald-50/40 transition group-hover:text-emerald-50/62">
                          rfiv12679@gmail.com
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStudyDownloadPdf}
                        className="group relative overflow-hidden border border-white/14 bg-white/[0.035] px-5 py-4 text-left transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-white/28 hover:bg-white/[0.075] hover:shadow-[0_18px_46px_rgba(0,0,0,0.24)]"
                        style={{ borderRadius: "12px 24px 14px 26px" }}
                      >
                        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(255,224,183,0.06)_100%)] opacity-80 transition duration-300 group-hover:opacity-100" />
                        <span className="pointer-events-none absolute -left-8 bottom-0 h-16 w-20 rounded-full bg-amber-100/6 blur-2xl transition duration-300 group-hover:bg-amber-100/12" />
                        <span className="relative block text-[0.53rem] uppercase tracking-[0.34em] text-emerald-50/46">
                          Resume
                        </span>
                        <span className="relative mt-2 block text-[0.76rem] uppercase tracking-[0.28em] text-emerald-50/92">
                          Download PDF
                        </span>
                        <span className="relative mt-3 block text-[0.54rem] uppercase tracking-[0.24em] text-emerald-50/40 transition group-hover:text-emerald-50/62">
                          Professional English CV
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleStudyOpenExternal("https://github.com/Charlieeeebrownnnn");
                        }}
                        className="group relative overflow-hidden border border-white/14 bg-white/[0.035] px-5 py-4 text-left transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-white/28 hover:bg-white/[0.075] hover:shadow-[0_18px_46px_rgba(0,0,0,0.24)]"
                        style={{ borderRadius: "26px 12px 18px 16px" }}
                      >
                        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(192,214,255,0.06)_100%)] opacity-80 transition duration-300 group-hover:opacity-100" />
                        <span className="pointer-events-none absolute right-3 top-2 h-14 w-14 rounded-full bg-sky-100/6 blur-2xl transition duration-300 group-hover:bg-sky-100/12" />
                        <span className="relative block text-[0.53rem] uppercase tracking-[0.34em] text-emerald-50/46">
                          Archive
                        </span>
                        <span className="relative mt-2 block text-[0.76rem] uppercase tracking-[0.28em] text-emerald-50/92">
                          View GitHub
                        </span>
                        <span className="relative mt-3 block text-[0.54rem] uppercase tracking-[0.24em] text-emerald-50/40 transition group-hover:text-emerald-50/62">
                          Source, experiments, iterations
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleStudyOpenExternal("https://www.linkedin.com/in/yu-nien-liu?locale=en_US");
                        }}
                        className="group relative overflow-hidden border border-white/14 bg-white/[0.035] px-5 py-4 text-left transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-white/28 hover:bg-white/[0.075] hover:shadow-[0_18px_46px_rgba(0,0,0,0.24)]"
                        style={{ borderRadius: "14px 26px 22px 10px" }}
                      >
                        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(214,199,255,0.06)_100%)] opacity-80 transition duration-300 group-hover:opacity-100" />
                        <span className="pointer-events-none absolute -right-4 bottom-1 h-16 w-20 rounded-full bg-violet-100/6 blur-2xl transition duration-300 group-hover:bg-violet-100/12" />
                        <span className="relative block text-[0.53rem] uppercase tracking-[0.34em] text-emerald-50/46">
                          Profile
                        </span>
                        <span className="relative mt-2 block text-[0.76rem] uppercase tracking-[0.28em] text-emerald-50/92">
                          View LinkedIn
                        </span>
                        <span className="relative mt-3 block text-[0.54rem] uppercase tracking-[0.24em] text-emerald-50/40 transition group-hover:text-emerald-50/62">
                          Experience, background, network
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleStudyReturnToGallery}
                      className="group mt-1 overflow-hidden border border-sky-100/16 bg-sky-100/[0.03] px-7 py-4 text-[0.6rem] uppercase tracking-[0.36em] text-sky-100/82 transition duration-300 hover:-translate-y-1 hover:border-sky-100/34 hover:bg-sky-100/[0.08] hover:text-sky-50 hover:shadow-[0_18px_46px_rgba(0,0,0,0.22)]"
                      style={{ borderRadius: "999px 999px 24px 999px" }}
                    >
                      Restart The Journey
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {showStudyCopyToast ? (
            <div className="pointer-events-none absolute right-6 top-6 flex justify-end">
              <div className="rounded-full border border-emerald-200/28 bg-black/52 px-4 py-2 text-[0.58rem] uppercase tracking-[0.32em] text-emerald-50/90 shadow-[0_0_18px_rgba(255,255,255,0.06)] backdrop-blur-sm">
                Email Copied!
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <style>{`
        @keyframes museumPromptPulse {
          0%, 100% {
            opacity: 0.22;
            transform: translateY(0) scale(0.98);
            filter: brightness(0.82);
          }
          50% {
            opacity: 1;
            transform: translateY(-1px) scale(1.05);
            filter: brightness(1.35);
          }
        }

        @keyframes studyEndingPulse {
          0%, 100% {
            opacity: 0.22;
            filter: brightness(0.88);
          }
          50% {
            opacity: 1;
            filter: brightness(1.24);
          }
        }
      `}</style>

      {!previewMode && showActiveRoomLoading ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/68 px-6 text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="text-center text-[0.62rem] uppercase tracking-[0.48em] text-emerald-100/72">
              Entering {activeRoomId ? getRoomLabel(activeRoomId) : "Room"}...
            </div>
            <div className="text-[1.1rem] uppercase tracking-[0.26em] text-emerald-50/92">
              {active ? `${activeRoomProgress}%` : "Preparing Scene"}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
