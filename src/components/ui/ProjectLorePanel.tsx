import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";

type LoreSpread = {
  leftTitle: string;
  leftBody: string[];
  rightTitle: string;
  rightBody: string[];
  highlight?: string;
};

const LORE_SPREADS: LoreSpread[] = [
  {
    leftTitle: "Project Premise",
    leftBody: [
      "This project is designed like a haunted portfolio: a corridor of rooms where each space reveals a different facet of Yu-Nien's work, memory, and visual language.",
      "Instead of presenting projects as flat case-study cards, the experience invites people to move, discover, and interpret. The goal is not only to show work, but to make the viewer feel like they are walking through the logic behind it.",
    ],
    rightTitle: "Core Tech",
    rightBody: [
      "The world is built with React Three Fiber and Drei, using room-based scene composition, in-world interaction hotspots, and HTML overlays anchored to 3D space.",
      "Each room acts like a micro-experience with its own camera logic, motion rules, and interaction objects. The structure makes it possible to treat portfolio sections as explorable spaces rather than ordinary UI pages.",
      "The frontend craft is the point: motion, spatial composition, lighting, and interaction prompts are all used as storytelling tools, not just decoration.",
    ],
    highlight: "A portfolio that behaves more like a psychological set than a website.",
  },
  {
    leftTitle: "Easter Eggs",
    leftBody: [
      "The Overlook-inspired corridor is intentional. The project borrows horror language as a memory device: doors, repetition, visual unease, and the feeling that every room contains a different emotional register.",
      "Details like the final locked room, the writing motif, the study room artifacts, and the possibility of future additions like the axe or twin girls are meant to reward people who linger and look twice.",
    ],
    rightTitle: "Why Hide Things",
    rightBody: [
      "The easter eggs are not there only for novelty. They support the broader idea that a portfolio can carry atmosphere, authorship, and subtext, instead of being purely informational.",
      "For a recruiter or collaborator, those hidden layers suggest something important about the maker: this is someone who thinks in systems, but also in mood, pacing, and symbolic detail.",
      "That combination is part of the pitch. The work is technical, but the delivery is cinematic.",
    ],
    highlight: "The secret details are there to say: the interface itself is part of the portfolio.",
  },
  {
    leftTitle: "Visual References",
    leftBody: [
      "The visual thinking behind the project draws from The Shining, installation-like spatial storytelling, museum display logic, and the tactile stillness of printed matter such as notebooks, dossiers, and setting books.",
      "The study room in particular is meant to feel like a creative evidence board: books, documents, wall pieces, and personal traces that make the project feel inhabited rather than assembled.",
    ],
    rightTitle: "What It Says About The Creator",
    rightBody: [
      "This project argues that frontend engineering can hold atmosphere, narrative structure, and personal taste without losing technical rigor.",
      "It also reflects Yu-Nien's strengths directly: translating complexity into legible experience, shaping interaction with visual intent, and treating code as a medium for emotional design rather than pure utility.",
      "In that sense, the setting book is not extra material. It is a key to reading the whole project more clearly.",
    ],
    highlight: "Behind the portfolio is a worldview: interfaces should be felt, remembered, and explored.",
  },
];

export default function ProjectLorePanel({
  isOpen,
  onClose,
  position = [0, 0, 0],
}: {
  isOpen: boolean;
  onClose: () => void;
  position?: [number, number, number];
}) {
  const [pageIndex, setPageIndex] = useState(0);

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

  const spread = LORE_SPREADS[pageIndex];
  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < LORE_SPREADS.length - 1;

  return (
    <Html
      transform
      position={position}
      distanceFactor={1.16}
      occlude={false}
      zIndexRange={[40, 0]}
      wrapperClass="lore-panel__html-root"
    >
      <article
        className="lore-panel"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="lore-panel__header">
          <div>
            <p className="lore-panel__eyebrow">Project Setting Book</p>
            <h2 className="lore-panel__title">The Study Room Files</h2>
          </div>
          <button className="lore-panel__close" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="lore-panel__book">
          <div className="lore-panel__spine" />

          <section className="lore-panel__page">
            <p className="lore-panel__page-number">{pageIndex * 2 + 1}</p>
            <h3>{spread.leftTitle}</h3>
            <div className="lore-panel__copy">
              {spread.leftBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="lore-panel__page lore-panel__page--right">
            <p className="lore-panel__page-number">{pageIndex * 2 + 2}</p>
            <h3>{spread.rightTitle}</h3>
            <div className="lore-panel__copy">
              {spread.rightBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {spread.highlight ? <blockquote>{spread.highlight}</blockquote> : null}
          </section>
        </div>

        <footer className="lore-panel__footer">
          <div className="lore-panel__progress">
            <span>
              Spread {pageIndex + 1} / {LORE_SPREADS.length}
            </span>
            <div className="lore-panel__dots" aria-hidden="true">
              {LORE_SPREADS.map((_, index) => (
                <span
                  key={index}
                  className={index === pageIndex ? "lore-panel__dot lore-panel__dot--active" : "lore-panel__dot"}
                />
              ))}
            </div>
          </div>

          <div className="lore-panel__nav">
            <button className="lore-panel__nav-button" type="button" onClick={() => setPageIndex((value) => Math.max(0, value - 1))} disabled={!canGoBack}>
              Previous Page
            </button>
            <button
              className="lore-panel__nav-button lore-panel__nav-button--solid"
              type="button"
              onClick={() => setPageIndex((value) => Math.min(LORE_SPREADS.length - 1, value + 1))}
              disabled={!canGoForward}
            >
              Next Page
            </button>
          </div>
        </footer>
      </article>

      <style>{`
        .lore-panel__html-root {
          pointer-events: auto;
        }

        .lore-panel {
          width: min(60rem, 90vw);
          padding: 1.2rem;
          border-radius: 1.4rem;
          border: 1px solid rgba(111, 78, 41, 0.18);
          background:
            linear-gradient(180deg, rgba(77, 53, 32, 0.38), rgba(32, 20, 11, 0.42)),
            rgba(240, 231, 217, 0.95);
          box-shadow:
            0 1.8rem 4.8rem rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          color: #2b2017;
          backdrop-filter: blur(16px);
          font-family: Georgia, "Times New Roman", serif;
        }

        .lore-panel__header,
        .lore-panel__footer,
        .lore-panel__nav,
        .lore-panel__progress {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .lore-panel__header {
          margin-bottom: 1rem;
        }

        .lore-panel__eyebrow {
          margin: 0 0 0.28rem;
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(99, 69, 39, 0.76);
        }

        .lore-panel__title {
          margin: 0;
          font-size: 1.82rem;
        }

        .lore-panel__close,
        .lore-panel__nav-button {
          border: 1px solid rgba(84, 59, 35, 0.18);
          background: rgba(255, 255, 255, 0.56);
          color: #38281b;
          border-radius: 999px;
          padding: 0.58rem 0.92rem;
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .lore-panel__nav-button--solid {
          background: #382417;
          color: #fff3df;
        }

        .lore-panel__nav-button:disabled {
          opacity: 0.42;
          cursor: default;
        }

        .lore-panel__book {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          min-height: 28rem;
          border-radius: 1.1rem;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(247, 241, 230, 0.98), rgba(241, 233, 219, 0.98));
          box-shadow:
            inset 0 0 0 1px rgba(98, 71, 43, 0.12),
            inset 0 1rem 1.8rem rgba(92, 67, 44, 0.06);
        }

        .lore-panel__spine {
          position: absolute;
          inset: 0 auto 0 50%;
          width: 2rem;
          transform: translateX(-50%);
          background:
            linear-gradient(90deg, rgba(119, 89, 58, 0.18), rgba(255, 255, 255, 0.28), rgba(119, 89, 58, 0.16));
          pointer-events: none;
        }

        .lore-panel__page {
          position: relative;
          padding: 2rem 2rem 1.5rem;
        }

        .lore-panel__page--right {
          background: linear-gradient(180deg, rgba(250, 246, 237, 0.92), rgba(246, 238, 225, 0.95));
        }

        .lore-panel__page-number {
          position: absolute;
          top: 1rem;
          right: 1.4rem;
          margin: 0;
          font-size: 0.84rem;
          color: rgba(102, 76, 49, 0.58);
        }

        .lore-panel__page h3 {
          margin: 0 0 1rem;
          font-size: 1.36rem;
          line-height: 1.14;
        }

        .lore-panel__copy {
          display: grid;
          gap: 0.9rem;
        }

        .lore-panel__copy p,
        .lore-panel blockquote {
          margin: 0;
          font-size: 1rem;
          line-height: 1.7;
          color: #463528;
        }

        .lore-panel blockquote {
          margin-top: 1rem;
          padding: 0.95rem 1rem;
          border-left: 3px solid rgba(100, 70, 40, 0.48);
          background: rgba(255, 255, 255, 0.44);
          font-style: italic;
          color: #342419;
        }

        .lore-panel__footer {
          margin-top: 1rem;
        }

        .lore-panel__progress {
          color: rgba(85, 61, 39, 0.76);
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
          font-size: 0.76rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .lore-panel__dots {
          display: flex;
          gap: 0.38rem;
        }

        .lore-panel__dot {
          width: 0.42rem;
          height: 0.42rem;
          border-radius: 999px;
          background: rgba(112, 89, 62, 0.22);
        }

        .lore-panel__dot--active {
          background: #6c4c2f;
        }

        @media (max-width: 960px) {
          .lore-panel {
            width: min(94vw, 42rem);
            padding: 0.9rem;
          }

          .lore-panel__header,
          .lore-panel__footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .lore-panel__book {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .lore-panel__spine {
            display: none;
          }

          .lore-panel__page {
            padding: 1.45rem 1.2rem 1.2rem;
          }

          .lore-panel__page:first-of-type {
            border-bottom: 1px solid rgba(97, 71, 44, 0.12);
          }
        }
      `}</style>
    </Html>
  );
}
