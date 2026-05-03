import { Html } from "@react-three/drei";
import { useEffect } from "react";
import type { GalleryArtwork } from "../../../public/data/galleryData";

export default function ArtworkInfoPanel({
  artwork,
  isOpen,
  onClose,
  position = [0, 0, 0],
}: {
  artwork: GalleryArtwork | null;
  isOpen: boolean;
  onClose: () => void;
  position?: [number, number, number];
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscapeRequest = (event: Event) => {
      const customEvent = event as CustomEvent<{ handled?: boolean }>;
      customEvent.detail.handled = true;
      onClose();
    };

    window.addEventListener("room-escape-request", handleEscapeRequest as EventListener);

    return () => {
      window.removeEventListener("room-escape-request", handleEscapeRequest as EventListener);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !artwork) {
    return null;
  }

  return (
    <Html
      transform
      position={position}
      distanceFactor={1.34}
      occlude={false}
      zIndexRange={[30, 0]}
      wrapperClass="artwork-panel__html-root"
    >
      <div
        className="artwork-panel"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="artwork-panel__header">
          <div>
            <p className="artwork-panel__eyebrow">Art Gallery</p>
            <h2 className="artwork-panel__title">{artwork.title}</h2>
          </div>
          <button className="artwork-panel__close" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="artwork-panel__body">
          <div className="artwork-panel__image-shell">
            <img className="artwork-panel__image" src={artwork.imageSrc} alt={artwork.title} />
          </div>

          <div className="artwork-panel__copy">
            <p className="artwork-panel__label">Description</p>
            <p className="artwork-panel__description">{artwork.description}</p>
          </div>
        </div>
      </div>

      <style>{`
        .artwork-panel__html-root {
          pointer-events: auto;
        }

        .artwork-panel {
          width: min(34.5rem, 69vw);
          padding: 1.02rem;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background:
            linear-gradient(180deg, rgba(36, 23, 16, 0.96) 0%, rgba(19, 11, 8, 0.94) 100%);
          color: rgba(255, 246, 237, 0.94);
          box-shadow:
            0 26px 80px rgba(0, 0, 0, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
        }

        .artwork-panel__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.88rem;
        }

        .artwork-panel__eyebrow {
          margin: 0 0 0.24rem;
          font-size: 0.64rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 213, 168, 0.72);
        }

        .artwork-panel__title {
          margin: 0;
          font-size: 1.16rem;
          line-height: 1.05;
          letter-spacing: 0.02em;
        }

        .artwork-panel__close {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 245, 234, 0.88);
          border-radius: 999px;
          padding: 0.48rem 0.8rem;
          font-size: 0.64rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .artwork-panel__body {
          display: grid;
          gap: 1rem;
        }

        .artwork-panel__image-shell {
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 248, 238, 0.08);
        }

        .artwork-panel__image {
          display: block;
          width: 100%;
          height: auto;
          max-height: 20.5rem;
          object-fit: contain;
          background: rgba(245, 237, 228, 0.92);
        }

        .artwork-panel__copy {
          padding: 0.2rem 0.08rem 0.08rem;
        }

        .artwork-panel__label {
          margin: 0 0 0.38rem;
          font-size: 0.66rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 214, 177, 0.66);
        }

        .artwork-panel__description {
          margin: 0;
          font-size: 0.94rem;
          line-height: 1.6;
          color: rgba(255, 239, 226, 0.84);
        }
      `}</style>
    </Html>
  );
}
