import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { galleryArtworks, type GalleryArtwork } from "../../../../public/data/galleryData";
import ArtworkInfoPanel from "../../ui/ArtworkInfoPanel";

type FixedFrameSlot = {
  id: string;
  center: [number, number, number];
  normal: [number, number, number];
  size: [number, number];
};

type DisplayArtwork = {
  id: string;
  position: [number, number, number];
  quaternion: THREE.Quaternion;
  size: [number, number];
  texture: THREE.Texture;
};

const INTERACT_DISTANCE = 1.2;
const INTERACT_DISTANCE_SQ = INTERACT_DISTANCE * INTERACT_DISTANCE;
const MAX_TEXTURE_EDGE = 1024;
const FIXED_FRAME_SLOTS: FixedFrameSlot[] = [
  {
    id: "panther-hero",
    center: [0.459, 1.75, 5.092],
    normal: [-0.098, 0, -0.995],
    size: [1.579, 1.053],
  },
  {
    id: "panther",
    center: [4.662, 1.75, -0.46],
    normal: [-0.995, 0, 0.098],
    size: [1.579, 1.053],
  },
  {
    id: "marge",
    center: [-8.091, 1.75, 0.8],
    normal: [0.995, 0, -0.098],
    size: [1.579, 1.053],
  },
  {
    id: "marge-variant",
    center: [-0.461, 1.75, -4.662],
    normal: [0.098, 0, 0.995],
    size: [1.579, 1.053],
  },
  {
    id: "pikachu",
    center: [8.09, 1.75, -0.798],
    normal: [-0.995, 0, 0.098],
    size: [1.579, 1.053],
  },
  {
    id: "spongebob",
    center: [0.461, 1.75, 4.663],
    normal: [-0.098, 0, -0.995],
    size: [1.579, 1.053],
  },
  {
    id: "will",
    center: [-4.663, 1.75, 0.461],
    normal: [0.995, 0, -0.098],
    size: [1.579, 1.053],
  },
];

export default function ArtGalleryExhibition() {
  const { camera } = useThree();
  const sourceTextures = useTexture(galleryArtworks.map((artwork) => artwork.imageSrc));
  const [nearArtworkId, setNearArtworkId] = useState<string | null>(null);
  const [openArtworkId, setOpenArtworkId] = useState<string | null>(null);
  const panelAnchorRef = useRef<THREE.Group>(null);
  const exhibitionGroupRef = useRef<THREE.Group>(null);
  const nearestArtworkIdRef = useRef<string | null>(null);
  const worldCenter = useMemo(() => new THREE.Vector3(), []);
  const cameraPlanar = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const displayPosition = useMemo(() => new THREE.Vector3(), []);

  const textures = useMemo(() => {
    return sourceTextures.map((texture) => {
      const image = texture.image as
        | HTMLImageElement
        | HTMLCanvasElement
        | ImageBitmap
        | undefined;

      if (!image) {
        return texture;
      }

      const imageWidth = "width" in image ? image.width : 1;
      const imageHeight = "height" in image ? image.height : 1;
      const maxEdge = Math.max(imageWidth, imageHeight);
      const scale = maxEdge > MAX_TEXTURE_EDGE ? MAX_TEXTURE_EDGE / maxEdge : 1;
      const targetWidth = Math.max(1, Math.round(imageWidth * scale));
      const targetHeight = Math.max(1, Math.round(imageHeight * scale));
      const canvas = document.createElement("canvas");

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        return texture;
      }

      context.drawImage(image as CanvasImageSource, 0, 0, targetWidth, targetHeight);

      const nextTexture = new THREE.CanvasTexture(canvas);
      nextTexture.colorSpace = THREE.SRGBColorSpace;
      nextTexture.flipY = false;
      nextTexture.offset.set(0, 1);
      nextTexture.repeat.set(1, -1);
      nextTexture.minFilter = THREE.LinearFilter;
      nextTexture.magFilter = THREE.LinearFilter;
      nextTexture.generateMipmaps = false;
      nextTexture.anisotropy = 1;
      nextTexture.needsUpdate = true;
      return nextTexture;
    });
  }, [sourceTextures]);

  const artworks = useMemo<DisplayArtwork[]>(() => {
    return FIXED_FRAME_SLOTS.map((slot) => {
      const artworkIndex = galleryArtworks.findIndex((artwork) => artwork.id === slot.id);

      if (artworkIndex < 0) {
        return null;
      }

      const normalVector = new THREE.Vector3(...slot.normal).normalize();
      const xAxis = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), normalVector).normalize();

      if (xAxis.lengthSq() < 0.0001) {
        xAxis.set(1, 0, 0);
      }

      const yAxis = new THREE.Vector3().crossVectors(normalVector, xAxis).normalize();
      const basis = new THREE.Matrix4().makeBasis(xAxis, yAxis, normalVector);
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);
      const texture = textures[artworkIndex];
      const image = texture.image as
        | HTMLImageElement
        | HTMLCanvasElement
        | ImageBitmap
        | undefined;
      const imageWidth = image && "width" in image ? image.width : slot.size[0];
      const imageHeight = image && "height" in image ? image.height : slot.size[1];
      const imageAspect = imageWidth / Math.max(1, imageHeight);
      const frameWidth = slot.size[0] * 0.94;
      const frameHeight = slot.size[1] * 0.94;
      let displayWidth = frameWidth;
      let displayHeight = displayWidth / Math.max(0.0001, imageAspect);

      if (displayHeight > frameHeight) {
        displayHeight = frameHeight;
        displayWidth = displayHeight * imageAspect;
      }

      return {
        id: slot.id,
        position: [
          slot.center[0] + slot.normal[0] * 0.012,
          slot.center[1] + slot.normal[1] * 0.012,
          slot.center[2] + slot.normal[2] * 0.012,
        ] as [number, number, number],
        size: [displayWidth, displayHeight],
        quaternion,
        texture,
      };
    }).filter(Boolean) as DisplayArtwork[];
  }, [textures]);

  const artworkMetaById = useMemo(() => {
    return new Map<string, GalleryArtwork>(galleryArtworks.map((artwork) => [artwork.id, artwork]));
  }, []);

  const openArtwork = openArtworkId ? artworkMetaById.get(openArtworkId) ?? null : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      const nearestId = nearestArtworkIdRef.current;

      if (!nearestId) {
        return;
      }

      event.preventDefault();
      setOpenArtworkId((current) => (current === nearestId ? null : nearestId));
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("room-interaction-prompt", {
        detail: { roomId: "artGallery", visible: Boolean(nearArtworkId) && !openArtworkId },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("room-interaction-prompt", {
          detail: { roomId: "artGallery", visible: false },
        }),
      );
    };
  }, [nearArtworkId, openArtworkId]);

  useFrame(() => {
    if (exhibitionGroupRef.current && !openArtworkId) {
      let nearestId: string | null = null;
      let smallestDistance = Number.POSITIVE_INFINITY;

      cameraPlanar.copy(camera.position);

      artworks.forEach((artwork) => {
        worldCenter.set(...artwork.position).applyMatrix4(exhibitionGroupRef.current!.matrixWorld);
        worldCenter.y = cameraPlanar.y;

        const distanceSq = cameraPlanar.distanceToSquared(worldCenter);

        if (distanceSq <= INTERACT_DISTANCE_SQ && distanceSq < smallestDistance) {
          smallestDistance = distanceSq;
          nearestId = artwork.id;
        }
      });

      if (nearestId !== nearestArtworkIdRef.current) {
        nearestArtworkIdRef.current = nearestId;
        setNearArtworkId(nearestId);
      }
    }

    if (panelAnchorRef.current && openArtworkId) {
      camera.getWorldDirection(forward);
      right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
      up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

      targetPosition
        .copy(camera.position)
        .add(forward.multiplyScalar(2.32))
        .add(right.multiplyScalar(0.03))
        .add(up.multiplyScalar(0.58));

      panelAnchorRef.current.position.lerp(targetPosition, 0.18);
      targetQuaternion.copy(camera.quaternion);
      panelAnchorRef.current.quaternion.slerp(targetQuaternion, 0.22);
    }
  });

  return (
    <>
      <group ref={exhibitionGroupRef}>
        {artworks.map((artwork, index) => {
          const isActive = nearArtworkId === artwork.id || openArtworkId === artwork.id;

          displayPosition.set(...artwork.position);

          return (
            <mesh
              key={`${artwork.id}-${index}`}
              position={[displayPosition.x, displayPosition.y, displayPosition.z]}
              quaternion={artwork.quaternion}
              onClick={(event) => {
                event.stopPropagation();
                setOpenArtworkId(artwork.id);
              }}
            >
              <planeGeometry args={artwork.size} />
              <meshBasicMaterial
                map={artwork.texture}
                color="#ffffff"
                side={THREE.DoubleSide}
                opacity={isActive ? 1 : 0.96}
                transparent
              />
            </mesh>
          );
        })}
      </group>

      <group ref={panelAnchorRef}>
        <ArtworkInfoPanel artwork={openArtwork} isOpen={Boolean(openArtwork)} onClose={() => setOpenArtworkId(null)} />
      </group>
    </>
  );
}
