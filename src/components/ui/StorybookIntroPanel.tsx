import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import useIsSafari from "../useIsSafari";

type StorySpread = {
  leftTitle: string;
  leftBody: string[];
  rightTitle: string;
  rightBody: string[];
  highlight?: string;
};

const STORY_SPREADS: StorySpread[] = [
  {
    leftTitle: "A Builder Who Chases Better Interfaces",
    leftBody: [
      "I am a frontend engineer who treats interface work as both systems design and visual storytelling. I am most energized by ambitious product surfaces where performance, clarity, and emotional impact all have to coexist.",
      'That mindset is what pushed me from traditional frontend into Web3D, React Three Fiber, and AI-integrated interfaces. I am drawn to work that asks not just "can we build it," but "can we make it feel inevitable to use?"',
    ],
    rightTitle: "What Stands Out",
    rightBody: [
      "One of my strongest qualities is turning complexity into usability. Whether the source is a manufacturing AI model, a camera feed, or a multi-module commerce platform, I like translating technical density into calm, intuitive interaction.",
      "I also bring a strong artistic instinct into engineering. Photography, visual design, and immersive media are not side hobbies to me. They directly shape how I think about UI, motion, spacing, and narrative flow.",
      "I also create large-scale paintings, which has shaped my sense of composition, spatial balance, and emotional storytelling.",
    ],
    highlight: "To me, engineering is where precision meets taste.",
  },
  {
    leftTitle: "Professional Momentum",
    leftBody: [
      "At Neurelli, I work at the edge of AI productization, transforming industrial computer vision workflows into high-performance web tools. I have handled real-time monitoring, PyQt image streams, and state-heavy React applications where reliability matters as much as speed.",
      "Before that, at Asia Road Technology, I shipped polished commercial platforms for brands with real traffic and real expectations, balancing frontend architecture, UX quality, and delivery pressure across dozens of client projects.",
    ],
    rightTitle: "A Broader Creative Backbone",
    rightBody: [
      "My earlier work with KKBOX and the Simple Life Festival shaped something I still value deeply: understanding audiences, brand tone, and cultural context, not only implementation details.",
      "That mix of product empathy, communication resilience, and engineering execution is a big part of how I work. I am especially effective in teams where design, product, and development need someone who can connect the dots rather than stay inside one lane.",
    ],
    highlight: "I am comfortable in both high-constraint systems and high-sensitivity storytelling.",
  },
  {
    leftTitle: "Why Teams Benefit",
    leftBody: [
      "I bring three advantages that teams can feel quickly: I can own difficult UI surfaces without flattening them into generic patterns, I learn aggressively at the boundary of new tooling, and I care about the final user feeling, not only technical completion.",
      "I aim to improve a product's sharpness from multiple angles at once: architecture, rendering performance, interaction detail, and visual confidence.",
    ],
    rightTitle: "The Direction Ahead",
    rightBody: [
      "I am looking for teams that are building ambitious digital experiences and are willing to treat the frontend as a meaningful product differentiator. AI interfaces, immersive web products, and visually expressive systems are especially natural matches for me.",
      "From a hiring perspective, the most accurate summary is probably this: Yu-Nien brings both taste and stamina. He can help make demanding ideas real, and he is still clearly climbing.",
    ],
    highlight: "A curious engineer with product instincts, creative range, and a strong appetite for hard problems.",
  },
];

export default function StorybookIntroPanel({
  isOpen,
  onClose,
  position = [0, 0, 0],
}: {
  isOpen: boolean;
  onClose: () => void;
  position?: [number, number, number];
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const isSafari = useIsSafari();

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

  useEffect(() => {
    if (!isOpen) {
      setPageIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const spread = STORY_SPREADS[pageIndex];
  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < STORY_SPREADS.length - 1;

  return (
    <Html
      transform={!isSafari}
      fullscreen={isSafari}
      position={position}
      distanceFactor={1.18}
      occlude={false}
      zIndexRange={[40, 0]}
      wrapperClass="storybook-panel__html-root"
    >
      <div className={isSafari ? "storybook-panel__viewport is-safari" : "storybook-panel__viewport"}>
        <article
          className={isSafari ? "storybook-panel storybook-panel--safari" : "storybook-panel"}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
        <header className="storybook-panel__header">
          <div>
            <p className="storybook-panel__eyebrow">Interactive Introduction</p>
            <h2 className="storybook-panel__title">A Book About Yu-Nien</h2>
          </div>
          <button className="storybook-panel__close" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="storybook-panel__book">
          <div className="storybook-panel__spine" />

          <section className="storybook-panel__page">
            <p className="storybook-panel__page-number">{pageIndex * 2 + 1}</p>
            <h3>{spread.leftTitle}</h3>
            <div className="storybook-panel__copy">
              {spread.leftBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="storybook-panel__page storybook-panel__page--right">
            <p className="storybook-panel__page-number">{pageIndex * 2 + 2}</p>
            <h3>{spread.rightTitle}</h3>
            <div className="storybook-panel__copy">
              {spread.rightBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {spread.highlight ? <blockquote>{spread.highlight}</blockquote> : null}
          </section>
        </div>

        <footer className="storybook-panel__footer">
          <div className="storybook-panel__progress">
            <span>
              Spread {pageIndex + 1} / {STORY_SPREADS.length}
            </span>
            <div className="storybook-panel__dots" aria-hidden="true">
              {STORY_SPREADS.map((_, index) => (
                <span
                  key={index}
                  className={index === pageIndex ? "storybook-panel__dot storybook-panel__dot--active" : "storybook-panel__dot"}
                />
              ))}
            </div>
          </div>

          <div className="storybook-panel__nav">
            <button className="storybook-panel__nav-button" type="button" onClick={() => setPageIndex((value) => Math.max(0, value - 1))} disabled={!canGoBack}>
              Previous Page
            </button>
            <button
              className="storybook-panel__nav-button storybook-panel__nav-button--solid"
              type="button"
              onClick={() => setPageIndex((value) => Math.min(STORY_SPREADS.length - 1, value + 1))}
              disabled={!canGoForward}
            >
              Next Page
            </button>
          </div>
        </footer>
        </article>
      </div>

      <style>{`
        .storybook-panel__html-root {
          pointer-events: auto;
          touch-action: manipulation;
        }

        .storybook-panel__viewport {
          display: contents;
        }

        .storybook-panel__viewport.is-safari {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          padding: 1.25rem;
          box-sizing: border-box;
          pointer-events: none;
        }

        .storybook-panel {
          width: min(60rem, 90vw);
          padding: 1.2rem;
          border-radius: 1.4rem;
          border: 1px solid rgba(113, 82, 47, 0.16);
          background:
            linear-gradient(180deg, rgba(103, 70, 42, 0.24), rgba(55, 35, 20, 0.28)),
            rgba(243, 234, 219, 0.94);
          box-shadow:
            0 1.8rem 4.8rem rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.36);
          color: #2c2219;
          backdrop-filter: blur(16px);
          font-family: Georgia, "Times New Roman", serif;
        }

        .storybook-panel--safari {
          width: min(84rem, 98vw);
          max-height: min(62rem, 90vh);
          overflow-x: hidden;
          overflow-y: auto;
          touch-action: pan-y;
          transform: translate3d(0, -8vh, 0);
          -webkit-transform: translate3d(0, -8vh, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: transform;
          isolation: isolate;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          pointer-events: auto;
          contain: layout paint style;
        }

        .storybook-panel__header,
        .storybook-panel__footer,
        .storybook-panel__nav,
        .storybook-panel__progress {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .storybook-panel__header {
          margin-bottom: 1rem;
        }

        .storybook-panel__eyebrow {
          margin: 0 0 0.28rem;
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(104, 73, 43, 0.72);
        }

        .storybook-panel__title {
          margin: 0;
          font-size: 1.8rem;
        }

        .storybook-panel__close,
        .storybook-panel__nav-button {
          border: 1px solid rgba(83, 59, 36, 0.18);
          background: rgba(255, 255, 255, 0.54);
          color: #3c2b1f;
          border-radius: 999px;
          padding: 0.58rem 0.92rem;
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .storybook-panel__nav-button--solid {
          background: #3d2a1a;
          color: #fff5e6;
        }

        .storybook-panel__nav-button:disabled {
          opacity: 0.42;
          cursor: default;
        }

        .storybook-panel--safari .storybook-panel__close,
        .storybook-panel--safari .storybook-panel__nav-button {
          position: relative;
          z-index: 1;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .storybook-panel__book {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 0;
          min-height: 29rem;
          border-radius: 1.1rem;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(246, 239, 227, 0.98), rgba(240, 230, 213, 0.98));
          box-shadow:
            inset 0 0 0 1px rgba(98, 73, 46, 0.12),
            inset 0 1rem 1.8rem rgba(103, 79, 53, 0.06);
        }

        .storybook-panel__spine {
          position: absolute;
          inset: 0 auto 0 50%;
          width: 2rem;
          transform: translateX(-50%);
          background:
            linear-gradient(90deg, rgba(115, 88, 58, 0.18), rgba(255, 255, 255, 0.32), rgba(115, 88, 58, 0.16));
          box-shadow:
            inset 1px 0 0 rgba(255, 255, 255, 0.28),
            inset -1px 0 0 rgba(92, 67, 42, 0.08);
          pointer-events: none;
        }

        .storybook-panel__page {
          position: relative;
          padding: 2rem 2rem 1.5rem;
        }

        .storybook-panel__page--right {
          background:
            linear-gradient(180deg, rgba(250, 245, 236, 0.9), rgba(245, 236, 221, 0.94));
        }

        .storybook-panel__page-number {
          position: absolute;
          top: 1.1rem;
          right: 1.4rem;
          margin: 0;
          font-size: 0.84rem;
          color: rgba(105, 79, 52, 0.6);
        }

        .storybook-panel__page h3 {
          margin: 0 0 1rem;
          font-size: 1.4rem;
          line-height: 1.12;
        }

        .storybook-panel__copy {
          display: grid;
          gap: 0.9rem;
        }

        .storybook-panel__copy p,
        .storybook-panel blockquote {
          margin: 0;
          font-size: 1rem;
          line-height: 1.7;
          color: #463628;
        }

        .storybook-panel blockquote {
          margin-top: 1rem;
          padding: 0.95rem 1rem;
          border-left: 3px solid rgba(101, 70, 42, 0.48);
          background: rgba(255, 255, 255, 0.44);
          font-style: italic;
          color: #35261c;
        }

        .storybook-panel__footer {
          margin-top: 1rem;
        }

        .storybook-panel__progress {
          color: rgba(86, 62, 40, 0.74);
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
          font-size: 0.76rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .storybook-panel__dots {
          display: flex;
          gap: 0.38rem;
        }

        .storybook-panel__dot {
          width: 0.42rem;
          height: 0.42rem;
          border-radius: 999px;
          background: rgba(112, 89, 62, 0.22);
        }

        .storybook-panel__dot--active {
          background: #6f5034;
        }

        @media (max-width: 960px) {
          .storybook-panel {
            width: min(94vw, 42rem);
            padding: 0.9rem;
          }

          .storybook-panel__header,
          .storybook-panel__footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .storybook-panel__book {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .storybook-panel__spine {
            display: none;
          }

          .storybook-panel__page {
            padding: 1.45rem 1.2rem 1.2rem;
          }

          .storybook-panel__page:first-of-type {
            border-bottom: 1px solid rgba(97, 71, 44, 0.12);
          }
        }
      `}</style>
    </Html>
  );
}
