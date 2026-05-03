import { Html } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";

const PANEL_VARIANTS = {
  manufacturing: {
    eyebrow: "AI Product Narrative",
    heading: "Manufacturing Intelligence Stack",
    steps: [
      {
        id: 1,
        title: "Fragmented Workflows: The Last Mile of AI Deployment",
        body: "In real-world manufacturing, model accuracy is merely the baseline. The true challenge lies in fragmented data across edge devices and disconnected annotation-training pipelines, resulting in prohibitive operational costs and stagnant model iteration.",
      },
      {
        id: 2,
        title: "Persistent State Machines & Real-Time Data Streaming",
        body: "To unify complex workflows, I architected a robust frontend hub: utilizing SSE (Server-Sent Events) to track asynchronous training progress, Redux Toolkit for cross-role state persistence, and Hardware Polling to map edge device status to the UI in real-time.",
      },
      {
        id: 3,
        title: "From AI Demo To Operational Workflow",
        body: "The biggest win was not just model quality, but workflow consolidation. By bringing annotation, training, and device management into one frontend experience, the system became something line teams could actually operate, reducing deployment friction and accelerating iteration by 40%+.",
      },
      {
        id: 4,
        title: "Workflow In Motion: Defect Detection In Production",
        body: "This live demo captures the product in action: defect detection flowing through a production-facing interface with enough clarity for operators, engineers, and deployment teams to align around the same system state.",
      },
    ],
  },
  museum: {
    eyebrow: "Global Commerce Narrative",
    heading: "National Palace Museum Global E-commerce",
    steps: [
      {
        id: 1,
        title: "A High-Stakes Storefront For A Cultural Institution",
        body: "The National Palace Museum is one of Taiwan's defining cultural institutions and is internationally known for a world-class collection, which made this storefront far more than a typical e-commerce build.",
      },
      {
        id: 2,
        title: "Framework-Free State, Not Framework Glue",
        body: "I built browser-native persistence for locale, currency, and cart behavior across pages without React or Redux.",
      },
      {
        id: 3,
        title: "High-Resolution Assets Without Heavy UX",
        body: "I engineered async loading and compression so artifact imagery stayed premium without dragging down the shopping experience.",
      },
      {
        id: 4,
        title: "Live Commerce Flow In Action",
        body: "This recording follows the real purchase journey through browsing, cart behavior, and checkout, showing how the frontend translated product storytelling into a smooth conversion path.",
      },
    ],
  },
  entropy: {
    eyebrow: "Emotion Interface Narrative",
    heading: "Entropy_void",
    steps: [
      {
        id: 1,
        title: "An Emotional Mirror Built As A Realtime Browser Experience",
        body: "Entropy_void is an interactive web piece that turns human expression into living matter. Instead of treating text or voice as commands, it interprets them as emotional energy and reflects them back through a responsive particle field that can stabilize, fracture, or resonate in public.",
      },
      {
        id: 2,
        title: "From Feeling To Form: The Realtime User Loop",
        body: "The product flow is intentionally immediate: the user speaks or types, the browser infers an emotional state, that score is translated into physical rules, and the particles answer back in milliseconds. The result feels less like operating software and more like having a visual conversation with a machine.",
      },
      {
        id: 3,
        title: "On-Device Intelligence: Privacy-Preserving Emotion Inference",
        body: "The technical core runs locally. Web Audio API and text input feed a client-side Transformers.js pipeline, so emotion classification happens inside the browser with no backend dependency for inference. That keeps latency low, preserves privacy, and makes the system feel startlingly immediate.",
      },
      {
        id: 4,
        title: "Physics, Rendering, And Global Resonance",
        body: "Once the model outputs emotional intensity, the frontend maps it into thermodynamic behavior. Calm states increase attraction and damping, while anxious or angry states raise turbulence and velocity. Those values drive GPU instancing in real time, and the resulting state can then be relayed through Firebase as a shared emotional constellation.",
      },
      {
        id: 5,
        title: "Entropy_void In Motion",
        body: "This recorded walkthrough shows the full loop in action: expression becomes inference, inference becomes motion, and motion becomes a public emotional artifact. It is the moment where invisible frontend architecture turns into something visceral, cinematic, and instantly legible.",
      },
    ],
  },
};

function BrokenDataChain() {
  return (
    <div className="ai-panel__viz ai-panel__viz--broken">
      <div className="ai-panel__node">
        <span className="ai-panel__node-dot" />
        <span>Edge</span>
      </div>
      <div className="ai-panel__chain ai-panel__chain--broken">
        <span />
        <span className="ai-panel__warning" />
        <span />
      </div>
      <div className="ai-panel__node">
        <span className="ai-panel__node-dot" />
        <span>Training</span>
      </div>
      <div className="ai-panel__chain ai-panel__chain--broken">
        <span />
        <span className="ai-panel__warning" />
        <span />
      </div>
      <div className="ai-panel__node">
        <span className="ai-panel__node-dot" />
        <span>Deployment</span>
      </div>
    </div>
  );
}

function LiveDataFlow() {
  return (
    <div className="ai-panel__viz ai-panel__viz--flow">
      <div className="ai-panel__flow-node">
        <strong>Edge Cameras</strong>
        <span>Signal</span>
      </div>
      <div className="ai-panel__flow-line">
        <span className="ai-panel__particle ai-panel__particle--one" />
        <span className="ai-panel__particle ai-panel__particle--two" />
        <span className="ai-panel__particle ai-panel__particle--three" />
      </div>
      <div className="ai-panel__flow-node ai-panel__flow-node--primary">
        <strong>Frontend Hub</strong>
        <span>State Machine</span>
      </div>
      <div className="ai-panel__flow-line">
        <span className="ai-panel__particle ai-panel__particle--one" />
        <span className="ai-panel__particle ai-panel__particle--two" />
        <span className="ai-panel__particle ai-panel__particle--three" />
      </div>
      <div className="ai-panel__flow-node">
        <strong>AI Backend</strong>
        <span>Training</span>
      </div>
    </div>
  );
}

function ImpactMetrics() {
  return (
    <div className="ai-panel__viz ai-panel__viz--impact">
      <div className="ai-panel__impact-board">
        <div className="ai-panel__impact-column">
          <label>Before</label>
          <strong>Fragmented Ops</strong>
          <div className="ai-panel__impact-stack">
            <span>Annotation in one tool</span>
            <span>Training status elsewhere</span>
            <span>Device checks done manually</span>
          </div>
        </div>

        <div className="ai-panel__impact-arrow" aria-hidden="true">
          <span />
        </div>

        <div className="ai-panel__impact-column ai-panel__impact-column--accent">
          <label>After</label>
          <strong>One Production Workflow</strong>
          <div className="ai-panel__impact-stack">
            <span>Annotation, training, and rollout in one loop</span>
            <span>Live system state visible to every role</span>
            <span>Operators can iterate with lower overhead</span>
          </div>
        </div>
      </div>

      <div className="ai-panel__impact-summary">
        <div className="ai-panel__impact-kpi">
          <strong>40%+</strong>
          <span>faster deployment iteration</span>
        </div>
        <div className="ai-panel__impact-tags">
          <span>Less field friction</span>
          <span>Faster model updates</span>
          <span>Shared operational view</span>
        </div>
      </div>
    </div>
  );
}

function ExpandVideoIcon() {
  return (
    <span className="ai-panel__video-expand-icon" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function ImpactVideo({ onExpand, isExpanded }) {
  return (
    <div className="ai-panel__video-stage">
      <button className="ai-panel__video-wrap ai-panel__video-trigger" type="button" onClick={onExpand}>
        <video
          className="ai-panel__video"
          src="/videos/defect_detection.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls={isExpanded}
        />
        <span className="ai-panel__video-overlay">
          <ExpandVideoIcon />
          <span className="ai-panel__video-overlay-copy">
            <strong>Open Demo</strong>
            <span>Expand video playback</span>
          </span>
        </span>
      </button>
      <span className="ai-panel__video-hint">Embedded Demo Preview • Click To Expand</span>
    </div>
  );
}

function MuseumStorefrontAtlas() {
  return (
    <div className="ai-panel__viz ai-panel__viz--museum-atlas">
      <div className="ai-panel__museum-minimal">
        <div className="ai-panel__museum-minimal-head">
          <strong>National Palace Museum</strong>
          <span>Taiwan cultural icon with international significance</span>
        </div>

        <div className="ai-panel__museum-importance-flow">
          <div className="ai-panel__museum-importance-node">
            <label>Taiwan</label>
            <strong>Cultural Landmark</strong>
          </div>
          <div className="ai-panel__museum-importance-link" aria-hidden="true" />
          <div className="ai-panel__museum-importance-node ai-panel__museum-importance-node--accent">
            <label>International</label>
            <strong>World-Class Collection</strong>
          </div>
          <div className="ai-panel__museum-importance-link" aria-hidden="true" />
          <div className="ai-panel__museum-importance-node">
            <label>Digital Impact</label>
            <strong>High-Stakes Global Storefront</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function MuseumStateMatrix() {
  return (
    <div className="ai-panel__viz ai-panel__viz--museum-state">
      <div className="ai-panel__museum-diagram">
        <div className="ai-panel__museum-diagram-row">
          <span>Cookies</span>
          <span>LocalStorage</span>
          <span>SessionStorage</span>
        </div>

        <div className="ai-panel__museum-diagram-core">
          <strong>Browser-Native State Engine</strong>
        </div>

        <div className="ai-panel__museum-diagram-row ai-panel__museum-diagram-row--outcomes">
          <span>Locale sync</span>
          <span>Currency sync</span>
          <span>Cart persistence</span>
        </div>
      </div>
    </div>
  );
}

function MuseumAssetDeliveryBoard() {
  return (
    <div className="ai-panel__viz ai-panel__viz--museum-assets">
      <div className="ai-panel__museum-impact-graphic">
        <div className="ai-panel__museum-impact-node">
          <label>Input</label>
          <strong>Hi-Res Cultural Assets</strong>
        </div>

        <div className="ai-panel__museum-impact-arrow" aria-hidden="true">
          <span />
        </div>

        <div className="ai-panel__museum-impact-node ai-panel__museum-impact-node--accent">
          <label>Output</label>
          <strong>Smooth Shopping UX</strong>
        </div>

        <div className="ai-panel__museum-impact-tags">
          <span>Async load</span>
          <span>Compression</span>
          <span>Less reflow / repaint</span>
        </div>
      </div>
    </div>
  );
}

function MuseumCheckoutFunnel({ onExpand, isExpanded }) {
  return (
    <div className="ai-panel__video-stage">
      <a
        className="ai-panel__video-link ai-panel__video-link--museum"
        href="https://www.npmshops.com"
        target="_blank"
        rel="noreferrer"
      >
        Live Site: npmshops.com
      </a>
      <button
        className="ai-panel__video-wrap ai-panel__video-wrap--museum ai-panel__video-trigger"
        type="button"
        onClick={onExpand}
      >
        <video
          className="ai-panel__video"
          src="/videos/npm.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls={isExpanded}
        />
        <span className="ai-panel__video-overlay ai-panel__video-overlay--museum">
          <ExpandVideoIcon />
          <span className="ai-panel__video-overlay-copy">
            <strong>Open Journey</strong>
            <span>Expand recorded flow</span>
          </span>
        </span>
      </button>
      <span className="ai-panel__video-hint">Recorded Shopping Journey • Click To Expand</span>
    </div>
  );
}

function EntropyProjectOverview() {
  return (
    <div className="ai-panel__viz ai-panel__viz--entropy-overview">
      <div className="ai-panel__entropy-overview-shell">
        <div className="ai-panel__entropy-overview-head">
          <label>Project Premise</label>
          <strong>Emotion is treated as a physical force, not a passive label.</strong>
          <span>
            The room behaves like a browser-native emotional instrument: it listens, interprets, and reorganizes a particle space in response.
          </span>
        </div>

        <div className="ai-panel__entropy-overview-orbit" aria-hidden="true">
          <span className="ai-panel__entropy-overview-ring ai-panel__entropy-overview-ring--one" />
          <span className="ai-panel__entropy-overview-ring ai-panel__entropy-overview-ring--two" />
          <span className="ai-panel__entropy-overview-ring ai-panel__entropy-overview-ring--three" />
          <span className="ai-panel__entropy-overview-core-dot" />
        </div>

        <div className="ai-panel__entropy-overview-grid">
          <div className="ai-panel__entropy-overview-card">
            <label>Input</label>
            <strong>Voice / Text</strong>
            <span>Human expression enters the system as live emotional material.</span>
          </div>
          <div className="ai-panel__entropy-overview-card">
            <label>Inference</label>
            <strong>On-Device AI</strong>
            <span>The browser interprets intensity, quadrant, and tone locally.</span>
          </div>
          <div className="ai-panel__entropy-overview-card ai-panel__entropy-overview-card--accent">
            <label>Output</label>
            <strong>Order / Chaos</strong>
            <span>Particles settle into symmetry or rupture into turbulent motion.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntropyUserLoop() {
  return (
    <div className="ai-panel__viz ai-panel__viz--entropy-loop">
      {/* <div className="ai-panel__entropy-loop-note">
        A realtime emotional loop designed to feel immediate, private, and alive inside the browser.
      </div> */}

      <div className="ai-panel__entropy-loop-track">
        <div className="ai-panel__entropy-loop-card">
          <label>01</label>
          <strong>Sensory Input</strong>
          <span>Voice or text enters.</span>
        </div>
        <div className="ai-panel__entropy-loop-card">
          <label>02</label>
          <strong>Local Interpretation</strong>
          <span>Emotion is classified locally.</span>
        </div>
        <div className="ai-panel__entropy-loop-card">
          <label>03</label>
          <strong>Physics Mapping</strong>
          <span>Scores become motion rules.</span>
        </div>
        <div className="ai-panel__entropy-loop-card ai-panel__entropy-loop-card--accent">
          <label>04</label>
          <strong>Visual Resonance</strong>
          <span>Particles answer in realtime.</span>
        </div>
      </div>
    </div>
  );
}

function EntropyEdgeInference() {
  return (
    <div className="ai-panel__viz ai-panel__viz--entropy-edge">
      <div className="ai-panel__entropy-inference-shell">
        <div className="ai-panel__entropy-chip">
          <label>Capture</label>
          <strong>Web Audio API + Text Input</strong>
          <span>Frequency, waveform, and language cues are captured directly in the client.</span>
        </div>

        <div className="ai-panel__entropy-flowline" aria-hidden="true" />

        <div className="ai-panel__entropy-chip ai-panel__entropy-chip--accent">
          <label>Inference</label>
          <strong>Transformers.js In The Browser</strong>
          <span>Emotion inference stays local, which protects privacy and removes network delay.</span>
        </div>

        <div className="ai-panel__entropy-flowline" aria-hidden="true" />

        <div className="ai-panel__entropy-chip">
          <label>Output</label>
          <strong>Quadrant + Intensity Vector</strong>
          <span>The frontend receives a compact emotional state that can drive motion immediately.</span>
        </div>

        <div className="ai-panel__entropy-tag-row">
          <span>Client-side only</span>
          <span>No inference server</span>
          <span>Private by design</span>
          <span>Low-latency feedback</span>
        </div>
      </div>
    </div>
  );
}

function EntropyPhysicsMap() {
  return (
    <div className="ai-panel__viz ai-panel__viz--entropy-chaos">
      <div className="ai-panel__entropy-physics-shell">
        <div className="ai-panel__entropy-balance">
          <div className="ai-panel__entropy-order-panel">
            <label>Low Tension / Calm</label>
            <strong>Order Formation</strong>
            <span>Higher attraction and damping pull the cloud into stable geometry.</span>
            <div className="ai-panel__entropy-order-cluster">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={`order-${index}`} />
              ))}
            </div>
          </div>

          <div className="ai-panel__entropy-divider" />

          <div className="ai-panel__entropy-chaos-panel">
            <label>High Tension / Anxiety</label>
            <strong>Chaotic Rupture</strong>
            <span>Turbulence and velocity spike, breaking structure into unstable dispersion.</span>
            <div className="ai-panel__entropy-chaos-cluster">
              {Array.from({ length: 10 }).map((_, index) => (
                <span key={`chaos-${index}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="ai-panel__entropy-sync-rail">
          <div className="ai-panel__entropy-sync-rail-line" aria-hidden="true" />
          <div className="ai-panel__entropy-sync-rail-node">
            <label>Render</label>
            <strong>GPU Instancing</strong>
          </div>
          <div className="ai-panel__entropy-sync-rail-node">
            <label>Relay</label>
            <strong>Firebase Sync</strong>
          </div>
          <div className="ai-panel__entropy-sync-rail-node ai-panel__entropy-sync-rail-node--accent">
            <label>Effect</label>
            <strong>Shared Emotional Constellation</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntropyGlobalSync({ onExpand, isExpanded }) {
  return (
    <div className="ai-panel__video-stage">
      <a
        className="ai-panel__video-link ai-panel__video-link--entropy"
        href="https://charlie-entropy-void.vercel.app/"
        target="_blank"
        rel="noreferrer"
      >
        Live Site: charlie-entropy-void.vercel.app
      </a>
      <button className="ai-panel__video-wrap ai-panel__video-trigger" type="button" onClick={onExpand}>
        <video
          className="ai-panel__video"
          src="/videos/N_Entropy_void.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls={isExpanded}
        />
        <span className="ai-panel__video-overlay">
          <ExpandVideoIcon />
          <span className="ai-panel__video-overlay-copy">
            <strong>Open Entropy_void</strong>
            <span>Expand realtime emotion demo</span>
          </span>
        </span>
      </button>
      <span className="ai-panel__video-hint">Live Emotion Mirror • Click To Expand</span>
    </div>
  );
}

function renderStage(projectKey, step, onExpandVideo, isExpandedVideoOpen) {
  if (projectKey === "museum") {
    if (step === 0) {
      return <MuseumStorefrontAtlas />;
    }

    if (step === 1) {
      return <MuseumStateMatrix />;
    }

    if (step === 2) {
      return <MuseumAssetDeliveryBoard />;
    }

    return <MuseumCheckoutFunnel onExpand={onExpandVideo} isExpanded={isExpandedVideoOpen} />;
  }

  if (projectKey === "entropy") {
    if (step === 0) {
      return <EntropyProjectOverview />;
    }

    if (step === 1) {
      return <EntropyUserLoop />;
    }

    if (step === 2) {
      return <EntropyEdgeInference />;
    }

    if (step === 3) {
      return <EntropyPhysicsMap />;
    }

    return <EntropyGlobalSync onExpand={onExpandVideo} isExpanded={isExpandedVideoOpen} />;
  }

  if (step === 0) {
    return <BrokenDataChain />;
  }

  if (step === 1) {
    return <LiveDataFlow />;
  }

  if (step === 2) {
    return <ImpactMetrics />;
  }

  return <ImpactVideo onExpand={onExpandVideo} isExpanded={isExpandedVideoOpen} />;
}

export default function AiProjectPanel({
  isOpen,
  onClose,
  position = [0, 0, 0],
  projectKey = "manufacturing",
}) {
  const [step, setStep] = useState(0);
  const [isExpandedVideoOpen, setIsExpandedVideoOpen] = useState(false);
  const variant = useMemo(() => PANEL_VARIANTS[projectKey] ?? PANEL_VARIANTS.manufacturing, [projectKey]);
  const current = useMemo(() => variant.steps[step], [step, variant]);
  const isVideoStep = step === variant.steps.length - 1;
  const canGoPrev = step > 0;
  const canGoNext = step < variant.steps.length - 1;

  useEffect(() => {
    if (isOpen) {
      setStep(0);
    }
  }, [isOpen, projectKey]);

  useEffect(() => {
    if (!isOpen) {
      setIsExpandedVideoOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsExpandedVideoOpen(false);
  }, [step, projectKey]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscapeRequest = (event) => {
      const customEvent = event;

      if (isExpandedVideoOpen) {
        customEvent.detail.handled = true;
        setIsExpandedVideoOpen(false);
        return;
      }

      customEvent.detail.handled = true;
      onClose();
    };

    window.addEventListener("room-escape-request", handleEscapeRequest);

    return () => {
      window.removeEventListener("room-escape-request", handleEscapeRequest);
    };
  }, [isExpandedVideoOpen, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <Html
      transform
      position={position}
      distanceFactor={1.22}
      occlude={false}
      zIndexRange={[30, 0]}
      wrapperClass="ai-panel__html-root"
    >
      <div
        className={`ai-panel ai-panel--${projectKey} ${isExpandedVideoOpen ? "is-video-expanded" : ""}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ai-panel__header">
          <div>
            <p className="ai-panel__eyebrow">{variant.eyebrow}</p>
            <h2 className="ai-panel__heading">{variant.heading}</h2>
          </div>
          <button className="ai-panel__close" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="ai-panel__steps" aria-label="Panel steps">
          <button
            type="button"
            className="ai-panel__nav"
            onClick={() => canGoPrev && setStep((value) => Math.max(0, value - 1))}
            disabled={!canGoPrev}
            aria-label="Previous step"
          >
            ←
          </button>

          {variant.steps.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`ai-panel__step ${index === step ? "is-active" : ""}`}
              onClick={() => setStep(index)}
            >
              <span>{item.id}</span>
            </button>
          ))}

          <button
            type="button"
            className="ai-panel__nav"
            onClick={() => canGoNext && setStep((value) => Math.min(variant.steps.length - 1, value + 1))}
            disabled={!canGoNext}
            aria-label="Next step"
          >
            →
          </button>
        </div>

        <div className={`ai-panel__content ${isVideoStep ? "is-video-step" : ""}`}>
          <div className="ai-panel__copy">
            <p className="ai-panel__label">Step {current.id}</p>
            <h3 className="ai-panel__title">{current.title}</h3>
            <p className="ai-panel__body">{current.body}</p>
          </div>

          <div className="ai-panel__stage">
            {renderStage(
              projectKey,
              step,
              () => setIsExpandedVideoOpen((value) => !value),
              isExpandedVideoOpen,
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ai-panel__html-root {
          pointer-events: auto;
        }

        .ai-panel {
          position: relative;
          width: min(31rem, 62vw);
          max-height: min(82vh, 54rem);
          overflow: hidden auto;
          padding: 1rem 1rem 1.05rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          background:
            linear-gradient(180deg, rgba(18, 24, 34, 0.88), rgba(8, 12, 19, 0.8)),
            rgba(9, 14, 24, 0.72);
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(22px) saturate(140%);
          color: #f3f7ff;
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
          transform-origin: center center;
          animation: ai-panel-enter 320ms cubic-bezier(0.18, 0.88, 0.32, 1);
          transition:
            width 260ms ease,
            max-height 260ms ease,
            transform 260ms ease,
            box-shadow 260ms ease;
        }

        .ai-panel--museum {
          border-color: rgba(255, 217, 176, 0.18);
          background:
            linear-gradient(180deg, rgba(49, 26, 14, 0.92), rgba(22, 12, 8, 0.84)),
            rgba(28, 15, 10, 0.78);
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 234, 214, 0.14);
        }

        .ai-panel.is-video-expanded {
          width: 90vw;
          max-height: min(88vh, 60rem);
        }

        .ai-panel__header,
        .ai-panel__content,
        .ai-panel__steps,
        .ai-panel__viz,
        .ai-panel__flow-node,
        .ai-panel__node {
          display: flex;
        }

        .ai-panel__header {
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.95rem;
        }

        .ai-panel__eyebrow,
        .ai-panel__label {
          margin: 0;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.68rem;
          color: rgba(160, 206, 255, 0.72);
        }

        .ai-panel--museum .ai-panel__eyebrow,
        .ai-panel--museum .ai-panel__label {
          color: rgba(255, 214, 168, 0.76);
        }

        .ai-panel__heading {
          margin: 0.3rem 0 0;
          line-height: 1.2;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .ai-panel__close,
        .ai-panel__step,
        .ai-panel__nav {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: #f7fbff;
          cursor: pointer;
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .ai-panel--museum .ai-panel__close,
        .ai-panel--museum .ai-panel__step,
        .ai-panel--museum .ai-panel__nav {
          border-color: rgba(255, 219, 182, 0.16);
          background: rgba(255, 229, 204, 0.06);
        }

        .ai-panel__close {
          padding: 0.55rem 0.8rem;
          border-radius: 999px;
          font-size: 0.82rem;
          white-space: nowrap;
        }

        .ai-panel__close:hover,
        .ai-panel__step:hover,
        .ai-panel__nav:hover,
        .ai-panel__step.is-active {
          transform: translateY(-1px);
          border-color: rgba(115, 193, 255, 0.55);
          background: rgba(101, 173, 255, 0.12);
          box-shadow: 0 0 18px rgba(80, 153, 255, 0.18);
        }

        .ai-panel--museum .ai-panel__close:hover,
        .ai-panel--museum .ai-panel__step:hover,
        .ai-panel--museum .ai-panel__nav:hover,
        .ai-panel--museum .ai-panel__step.is-active {
          border-color: rgba(255, 192, 122, 0.5);
          background: rgba(255, 176, 98, 0.14);
          box-shadow: 0 0 18px rgba(255, 167, 82, 0.16);
        }

        .ai-panel__steps {
          align-items: center;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-bottom: 1rem;
        }

        .ai-panel__step {
          align-items: center;
          justify-content: center;
          width: 2.2rem;
          height: 2.2rem;
          border-radius: 999px;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .ai-panel__nav {
          width: 2.35rem;
          height: 2.35rem;
          border-radius: 999px;
          font-size: 1rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ai-panel__nav:disabled {
          opacity: 0.35;
          cursor: default;
          transform: none;
          box-shadow: none;
        }

        .ai-panel__content {
          gap: 1rem;
          align-items: stretch;
          flex-wrap: wrap;
        }

        .ai-panel__copy,
        .ai-panel__stage {
          min-width: 0;
        }

        .ai-panel__copy {
          flex: 1 1 52%;
          min-width: 15rem;
        }

        .ai-panel__stage {
          flex: 1 1 48%;
          padding: 0.8rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          min-height: 14rem;
          display: grid;
          place-items: center;
          min-width: 14rem;
        }

        .ai-panel--museum .ai-panel__stage {
          border-color: rgba(255, 226, 192, 0.1);
          background: linear-gradient(180deg, rgba(255, 239, 221, 0.06), rgba(255, 224, 188, 0.03));
        }

        .ai-panel__content.is-video-step .ai-panel__copy,
        .ai-panel__content.is-video-step .ai-panel__stage {
          flex-basis: 100%;
          min-width: 100%;
        }

        .ai-panel__content.is-video-step .ai-panel__stage {
          min-height: auto;
        }

        .ai-panel.is-video-expanded .ai-panel__content.is-video-step {
          gap: 1rem;
        }

        .ai-panel.is-video-expanded .ai-panel__copy,
        .ai-panel.is-video-expanded .ai-panel__stage {
          flex-basis: 100%;
          min-width: 100%;
        }

        .ai-panel.is-video-expanded .ai-panel__stage {
          min-height: min(68vh, 46rem);
          padding: 1rem;
        }

        .ai-panel.is-video-expanded .ai-panel__body {
          max-width: 62ch;
        }

        .ai-panel__title {
          margin: 0.45rem 0 0.7rem;
          font-size: 1.28rem;
          line-height: 1.15;
        }

        .ai-panel__body {
          margin: 0;
          color: rgba(226, 235, 249, 0.82);
          line-height: 1.6;
          font-size: 0.94rem;
        }

        .ai-panel--museum .ai-panel__body {
          color: rgba(255, 237, 221, 0.82);
        }

        .ai-panel--museum .ai-panel__content {
          flex-direction: column;
          gap: 0.8rem;
        }

        .ai-panel--museum .ai-panel__copy,
        .ai-panel--museum .ai-panel__stage {
          flex-basis: 100%;
          min-width: 100%;
        }

        .ai-panel--museum .ai-panel__body {
          max-width: 42ch;
          font-size: 0.88rem;
        }

        .ai-panel--museum .ai-panel__stage {
          min-height: 11.8rem;
          padding: 0.95rem;
        }

        .ai-panel__viz {
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .ai-panel__viz--impact {
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          gap: 0.8rem;
        }

        .ai-panel__node,
        .ai-panel__flow-node {
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          width: 4.9rem;
          height: 4.9rem;
          padding: 0.6rem;
          border-radius: 18px;
          text-align: center;
          font-size: 0.72rem;
          color: rgba(244, 248, 255, 0.88);
          background: rgba(11, 18, 30, 0.84);
          border: 1px solid rgba(140, 190, 255, 0.18);
          box-shadow: inset 0 0 24px rgba(84, 146, 255, 0.08);
        }

        .ai-panel--museum .ai-panel__node,
        .ai-panel--museum .ai-panel__flow-node {
          color: rgba(255, 244, 236, 0.92);
          background: rgba(48, 22, 11, 0.76);
          border-color: rgba(255, 198, 132, 0.22);
          box-shadow: inset 0 0 24px rgba(255, 160, 82, 0.08);
        }

        .ai-panel__node-dot,
        .ai-panel__flow-node::before {
          content: "";
          width: 0.7rem;
          height: 0.7rem;
          border-radius: 999px;
          background: #8fd2ff;
          box-shadow: 0 0 16px rgba(115, 200, 255, 0.85);
        }

        .ai-panel--museum .ai-panel__node-dot,
        .ai-panel--museum .ai-panel__flow-node::before {
          background: #ffd3a8;
          box-shadow: 0 0 16px rgba(255, 191, 124, 0.85);
        }

        .ai-panel__chain {
          position: relative;
          width: 4rem;
          height: 2px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 0.45rem;
        }

        .ai-panel__chain--broken span:first-child,
        .ai-panel__chain--broken span:last-child {
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            rgba(255, 181, 72, 0.9) 0 6px,
            rgba(255, 181, 72, 0.15) 6px 12px
          );
        }

        .ai-panel__warning {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 999px;
          background: #ff6d4d;
          box-shadow: 0 0 0 rgba(255, 109, 77, 0.55);
          animation: ai-panel-warning-pulse 1.35s ease-out infinite;
        }

        .ai-panel__viz--flow {
          gap: 0.55rem;
        }

        .ai-panel__flow-node {
          width: 5rem;
          height: 5.35rem;
          gap: 0.35rem;
        }

        .ai-panel__flow-node strong {
          font-size: 0.78rem;
          line-height: 1.2;
        }

        .ai-panel__flow-node span {
          font-size: 0.64rem;
          color: rgba(187, 218, 255, 0.68);
        }

        .ai-panel--museum .ai-panel__flow-node span {
          color: rgba(255, 223, 190, 0.72);
        }

        .ai-panel__flow-node--primary {
          border-color: rgba(123, 201, 255, 0.46);
          box-shadow:
            inset 0 0 24px rgba(74, 167, 255, 0.15),
            0 0 22px rgba(74, 167, 255, 0.14);
        }

        .ai-panel--museum .ai-panel__flow-node--primary {
          border-color: rgba(255, 196, 132, 0.46);
          box-shadow:
            inset 0 0 24px rgba(255, 155, 84, 0.15),
            0 0 22px rgba(255, 155, 84, 0.14);
        }

        .ai-panel__flow-line {
          position: relative;
          width: 4.15rem;
          height: 0.9rem;
          overflow: hidden;
        }

        .ai-panel__flow-line::before {
          content: "";
          position: absolute;
          inset: 50% 0 auto;
          height: 2px;
          transform: translateY(-50%);
          background: repeating-linear-gradient(
            90deg,
            rgba(104, 182, 255, 0.2) 0 6px,
            rgba(104, 182, 255, 0.85) 6px 12px
          );
          opacity: 0.78;
        }

        .ai-panel__flow-line--warm::before {
          background: repeating-linear-gradient(
            90deg,
            rgba(255, 194, 136, 0.16) 0 6px,
            rgba(255, 183, 104, 0.82) 6px 12px
          );
        }

        .ai-panel__particle {
          position: absolute;
          top: 50%;
          left: -0.5rem;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 999px;
          transform: translateY(-50%);
          background: radial-gradient(circle, #dff6ff 0%, #78c9ff 55%, rgba(120, 201, 255, 0) 100%);
          filter: drop-shadow(0 0 8px rgba(120, 201, 255, 0.6));
          animation: ai-panel-particle-flow 1.65s linear infinite;
        }

        .ai-panel--museum .ai-panel__particle {
          background: radial-gradient(circle, #fff1e2 0%, #ffb771 55%, rgba(255, 183, 113, 0) 100%);
          filter: drop-shadow(0 0 8px rgba(255, 183, 113, 0.55));
        }

        .ai-panel__particle--two {
          animation-delay: 0.55s;
        }

        .ai-panel__particle--three {
          animation-delay: 1.1s;
        }

        .ai-panel__impact-board {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 0.8rem;
        }

        .ai-panel__impact-column {
          padding: 0.9rem;
          border-radius: 18px;
          border: 1px solid rgba(123, 201, 255, 0.18);
          background: linear-gradient(180deg, rgba(17, 30, 48, 0.88), rgba(10, 18, 31, 0.88));
          box-shadow:
            inset 0 0 24px rgba(102, 186, 255, 0.06),
            0 0 18px rgba(73, 153, 255, 0.08);
          display: grid;
          gap: 0.4rem;
        }

        .ai-panel__impact-column--accent {
          border-color: rgba(118, 201, 255, 0.34);
          background: linear-gradient(180deg, rgba(28, 53, 86, 0.92), rgba(11, 23, 40, 0.92));
          box-shadow:
            inset 0 0 24px rgba(118, 201, 255, 0.08),
            0 0 22px rgba(92, 177, 255, 0.12);
        }

        .ai-panel__impact-column label {
          color: rgba(188, 218, 255, 0.72);
          font-size: 0.64rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .ai-panel__impact-column strong {
          color: #f7fbff;
          font-size: 0.9rem;
          line-height: 1.24;
        }

        .ai-panel__impact-stack {
          display: grid;
          gap: 0.42rem;
          margin-top: 0.12rem;
        }

        .ai-panel__impact-stack span {
          padding: 0.48rem 0.62rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(214, 231, 250, 0.84);
          font-size: 0.71rem;
          line-height: 1.42;
        }

        .ai-panel__impact-arrow {
          width: 2.6rem;
          display: grid;
          place-items: center;
        }

        .ai-panel__impact-arrow span {
          display: block;
          width: 100%;
          height: 2px;
          position: relative;
          background: linear-gradient(90deg, rgba(118, 201, 255, 0.2), rgba(118, 201, 255, 0.92));
        }

        .ai-panel__impact-arrow span::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -0.08rem;
          width: 0.5rem;
          height: 0.5rem;
          border-top: 2px solid rgba(118, 201, 255, 0.92);
          border-right: 2px solid rgba(118, 201, 255, 0.92);
          transform: translateY(-50%) rotate(45deg);
        }

        .ai-panel__impact-summary {
          width: 100%;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.75rem;
          align-items: center;
        }

        .ai-panel__impact-kpi {
          min-width: 7rem;
          padding: 0.85rem 0.9rem;
          border-radius: 18px;
          border: 1px solid rgba(160, 212, 255, 0.2);
          background: linear-gradient(180deg, rgba(21, 41, 68, 0.9), rgba(11, 20, 34, 0.9));
          box-shadow:
            inset 0 0 22px rgba(118, 201, 255, 0.08),
            0 0 18px rgba(73, 153, 255, 0.1);
          text-align: center;
        }

        .ai-panel__impact-kpi strong {
          display: block;
          color: #f7fbff;
          font-size: 1.7rem;
          line-height: 1;
          text-shadow: 0 0 22px rgba(116, 199, 255, 0.28);
        }

        .ai-panel__impact-kpi span {
          display: block;
          margin-top: 0.28rem;
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(188, 218, 255, 0.72);
        }

        .ai-panel__impact-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .ai-panel__impact-tags span {
          padding: 0.34rem 0.58rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(160, 212, 255, 0.12);
          color: rgba(220, 237, 255, 0.86);
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ai-panel__viz--museum-atlas,
        .ai-panel__viz--museum-state,
        .ai-panel__viz--museum-assets,
        .ai-panel__viz--museum-checkout {
          align-items: stretch;
        }

        .ai-panel__museum-minimal,
        .ai-panel__museum-diagram,
        .ai-panel__museum-impact-graphic,
        .ai-panel__museum-funnel-minimal {
          width: 100%;
          display: grid;
          gap: 0.8rem;
          padding: 0.9rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 213, 176, 0.12);
          background: linear-gradient(180deg, rgba(82, 38, 17, 0.9), rgba(44, 19, 10, 0.88));
          box-shadow: inset 0 0 26px rgba(255, 172, 95, 0.06);
        }

        .ai-panel__museum-minimal-head,
        .ai-panel__museum-diagram-core,
        .ai-panel__museum-impact-node {
          padding: 0.82rem 0.9rem;
          border-radius: 18px;
          border: 1px solid rgba(255, 223, 190, 0.12);
          background: rgba(255, 244, 234, 0.04);
          display: grid;
          gap: 0.24rem;
        }

        .ai-panel__museum-minimal-head strong,
        .ai-panel__museum-diagram-core strong,
        .ai-panel__museum-impact-node strong,
        .ai-panel__museum-pillar strong,
        .ai-panel__museum-funnel-block {
          color: #fff4ea;
          font-size: 0.84rem;
          line-height: 1.2;
        }

        .ai-panel__museum-minimal-head span,
        .ai-panel__museum-diagram-row span,
        .ai-panel__museum-impact-node label,
        .ai-panel__museum-pillar label {
          color: rgba(255, 226, 202, 0.76);
          font-size: 0.68rem;
          line-height: 1.4;
        }

        .ai-panel__museum-pillars {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.6rem;
        }

        .ai-panel__museum-importance-flow {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 0.55rem;
        }

        .ai-panel__museum-pillar {
          min-width: 0;
          padding: 0.8rem 0.7rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 219, 186, 0.12);
          background: rgba(255, 243, 230, 0.04);
          box-shadow: inset 0 0 18px rgba(255, 183, 104, 0.04);
          display: grid;
          gap: 0.24rem;
          text-align: center;
        }

        .ai-panel__museum-importance-node {
          min-width: 0;
          padding: 0.85rem 0.72rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 219, 186, 0.12);
          background: rgba(255, 243, 230, 0.04);
          box-shadow: inset 0 0 18px rgba(255, 183, 104, 0.04);
          display: grid;
          gap: 0.24rem;
          text-align: center;
        }

        .ai-panel__museum-importance-node label {
          color: rgba(255, 208, 172, 0.76);
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .ai-panel__museum-importance-node strong {
          color: #fff4ea;
          font-size: 0.8rem;
          line-height: 1.2;
        }

        .ai-panel__museum-importance-node--accent {
          border-color: rgba(255, 193, 122, 0.28);
          box-shadow:
            inset 0 0 18px rgba(255, 167, 82, 0.08),
            0 0 16px rgba(255, 167, 82, 0.08);
        }

        .ai-panel__museum-importance-link {
          width: 1.6rem;
          height: 2px;
          background: linear-gradient(90deg, rgba(255, 193, 122, 0.22), rgba(255, 193, 122, 0.92));
          position: relative;
        }

        .ai-panel__museum-importance-link::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -0.02rem;
          width: 0.45rem;
          height: 0.45rem;
          border-top: 2px solid rgba(255, 193, 122, 0.92);
          border-right: 2px solid rgba(255, 193, 122, 0.92);
          transform: translateY(-50%) rotate(45deg);
        }

        .ai-panel__museum-pillar--accent,
        .ai-panel__museum-diagram-core,
        .ai-panel__museum-impact-node--accent,
        .ai-panel__museum-funnel-block--end {
          border-color: rgba(255, 193, 122, 0.28);
          box-shadow:
            inset 0 0 18px rgba(255, 167, 82, 0.08),
            0 0 16px rgba(255, 167, 82, 0.08);
        }

        .ai-panel__museum-pillar label,
        .ai-panel__museum-impact-node label {
          color: rgba(255, 208, 172, 0.76);
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .ai-panel__museum-diagram,
        .ai-panel__museum-impact-graphic {
          justify-items: center;
        }

        .ai-panel__museum-diagram-row,
        .ai-panel__museum-impact-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.45rem;
        }

        .ai-panel__museum-diagram-row span,
        .ai-panel__museum-impact-tags span {
          padding: 0.34rem 0.58rem;
          border-radius: 999px;
          background: rgba(255, 247, 239, 0.08);
          border: 1px solid rgba(255, 223, 190, 0.12);
          color: rgba(255, 237, 221, 0.88);
          font-size: 0.64rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ai-panel__museum-diagram-core {
          min-width: min(100%, 16rem);
          text-align: center;
        }

        .ai-panel__museum-diagram-row--outcomes span {
          background: rgba(173, 222, 255, 0.08);
          border-color: rgba(173, 222, 255, 0.14);
          color: rgba(221, 242, 255, 0.88);
        }

        .ai-panel__museum-impact-node {
          width: min(100%, 15.5rem);
          text-align: center;
        }

        .ai-panel__museum-impact-arrow {
          width: 100%;
          display: grid;
          place-items: center;
        }

        .ai-panel__museum-impact-arrow span {
          display: block;
          width: min(100%, 9rem);
          height: 2px;
          position: relative;
          background: linear-gradient(90deg, rgba(255, 193, 122, 0.2), rgba(255, 193, 122, 0.9));
        }

        .ai-panel__museum-impact-arrow span::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -0.1rem;
          width: 0.58rem;
          height: 0.58rem;
          border-top: 2px solid rgba(255, 193, 122, 0.9);
          border-right: 2px solid rgba(255, 193, 122, 0.9);
          transform: translateY(-50%) rotate(45deg);
        }

        .ai-panel__museum-funnel-minimal {
          gap: 0.9rem;
        }

        .ai-panel__museum-funnel-track {
          display: grid;
          gap: 0.55rem;
        }

        .ai-panel__museum-funnel-block {
          padding: 0.82rem 0.9rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 223, 190, 0.12);
          background: rgba(255, 243, 230, 0.04);
          width: 100%;
          text-align: left;
        }

        .ai-panel__museum-funnel-block--mid {
          width: 84%;
          justify-self: center;
        }

        .ai-panel__museum-funnel-block--end {
          width: 68%;
          justify-self: end;
        }

        @media (max-width: 960px) {
          .ai-panel__impact-board {
            grid-template-columns: 1fr;
          }

          .ai-panel__impact-arrow {
            width: 2px;
            height: 1.5rem;
            justify-self: center;
          }

          .ai-panel__impact-arrow span {
            width: 2px;
            height: 100%;
            background: linear-gradient(180deg, rgba(118, 201, 255, 0.2), rgba(118, 201, 255, 0.92));
          }

          .ai-panel__impact-arrow span::after {
            top: auto;
            bottom: -0.08rem;
            left: 50%;
            right: auto;
            transform: translateX(-50%) rotate(135deg);
          }

          .ai-panel__impact-summary {
            grid-template-columns: 1fr;
          }

          .ai-panel__museum-pillars,
          .ai-panel__museum-importance-flow {
            grid-template-columns: 1fr;
          }

          .ai-panel__museum-importance-link {
            width: 2px;
            height: 1.3rem;
            justify-self: center;
            background: linear-gradient(180deg, rgba(255, 193, 122, 0.22), rgba(255, 193, 122, 0.92));
          }

          .ai-panel__museum-importance-link::after {
            top: auto;
            bottom: -0.02rem;
            left: 50%;
            right: auto;
            transform: translateX(-50%) rotate(135deg);
          }

          .ai-panel__museum-funnel-block,
          .ai-panel__museum-funnel-block--mid,
          .ai-panel__museum-funnel-block--end {
            width: 100%;
          }
        }

        .ai-panel--entropy {
          border-color: rgba(166, 255, 211, 0.18);
          background:
            linear-gradient(180deg, rgba(7, 24, 18, 0.92), rgba(4, 10, 13, 0.84)),
            rgba(7, 16, 13, 0.8);
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.48),
            inset 0 1px 0 rgba(214, 255, 237, 0.12);
        }

        .ai-panel--entropy .ai-panel__eyebrow,
        .ai-panel--entropy .ai-panel__label {
          color: rgba(174, 255, 218, 0.76);
        }

        .ai-panel--entropy .ai-panel__close,
        .ai-panel--entropy .ai-panel__step,
        .ai-panel--entropy .ai-panel__nav {
          border-color: rgba(176, 255, 220, 0.14);
          background: rgba(170, 255, 218, 0.06);
        }

        .ai-panel--entropy .ai-panel__close:hover,
        .ai-panel--entropy .ai-panel__step:hover,
        .ai-panel--entropy .ai-panel__nav:hover,
        .ai-panel--entropy .ai-panel__step.is-active {
          border-color: rgba(118, 255, 200, 0.46);
          background: rgba(78, 227, 168, 0.12);
          box-shadow: 0 0 18px rgba(78, 227, 168, 0.16);
        }

        .ai-panel--entropy .ai-panel__body {
          color: rgba(223, 243, 236, 0.82);
        }

        .ai-panel--entropy .ai-panel__stage {
          border-color: rgba(184, 255, 224, 0.1);
          background: linear-gradient(180deg, rgba(196, 255, 229, 0.05), rgba(107, 255, 194, 0.02));
        }

        .ai-panel__viz--entropy-overview,
        .ai-panel__viz--entropy-loop,
        .ai-panel__viz--entropy-edge,
        .ai-panel__viz--entropy-chaos {
          align-items: stretch;
        }

        .ai-panel__entropy-overview-shell,
        .ai-panel__entropy-loop-track,
        .ai-panel__entropy-inference-shell,
        .ai-panel__entropy-physics-shell {
          width: 100%;
          display: grid;
          gap: 0.9rem;
        }

        .ai-panel__entropy-overview-shell,
        .ai-panel__entropy-inference-shell,
        .ai-panel__entropy-balance,
        .ai-panel__entropy-sync-rail {
          padding: 1rem;
          border-radius: 22px;
          border: 1px solid rgba(180, 255, 223, 0.12);
          background: linear-gradient(180deg, rgba(12, 33, 24, 0.88), rgba(8, 18, 20, 0.92));
          box-shadow:
            inset 0 0 26px rgba(120, 255, 201, 0.05),
            0 18px 40px rgba(0, 0, 0, 0.18);
        }

        .ai-panel__entropy-overview-head {
          display: grid;
          gap: 0.35rem;
        }

        .ai-panel__entropy-overview-head label,
        .ai-panel__entropy-order-panel label,
        .ai-panel__entropy-chaos-panel label,
        .ai-panel__entropy-sync-rail-node label {
          color: rgba(186, 255, 224, 0.72);
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .ai-panel__entropy-overview-head strong {
          color: #effff8;
          font-size: 1rem;
          line-height: 1.3;
        }

        .ai-panel__entropy-overview-head span {
          color: rgba(223, 243, 236, 0.78);
          font-size: 0.8rem;
          line-height: 1.55;
        }

        .ai-panel__entropy-overview-orbit {
          position: relative;
          min-height: 8rem;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 18px;
          background:
            radial-gradient(circle at center, rgba(122, 255, 196, 0.18), rgba(122, 255, 196, 0) 38%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
        }

        .ai-panel__entropy-overview-ring,
        .ai-panel__entropy-overview-core-dot {
          position: absolute;
          border-radius: 999px;
        }

        .ai-panel__entropy-overview-ring {
          border: 1px solid rgba(150, 255, 207, 0.24);
          box-shadow: 0 0 22px rgba(94, 255, 178, 0.08);
        }

        .ai-panel__entropy-overview-ring--one {
          width: 3.6rem;
          height: 3.6rem;
          animation: entropyPulse 2.2s ease-in-out infinite;
        }

        .ai-panel__entropy-overview-ring--two {
          width: 6rem;
          height: 6rem;
          animation: entropyPulse 2.2s ease-in-out infinite 0.28s;
        }

        .ai-panel__entropy-overview-ring--three {
          width: 8.4rem;
          height: 8.4rem;
          animation: entropyPulse 2.2s ease-in-out infinite 0.56s;
        }

        .ai-panel__entropy-overview-core-dot {
          width: 0.9rem;
          height: 0.9rem;
          background: radial-gradient(circle, #f6fffb 0%, #abffd5 48%, rgba(171, 255, 213, 0) 100%);
          box-shadow: 0 0 22px rgba(116, 255, 192, 0.4);
        }

        .ai-panel__entropy-overview-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.7rem;
        }

        .ai-panel__entropy-overview-card,
        .ai-panel__entropy-chip,
        .ai-panel__entropy-loop-card,
        .ai-panel__entropy-sync-rail-node {
          padding: 0.8rem 0.9rem;
          border-radius: 18px;
          border: 1px solid rgba(180, 255, 223, 0.1);
          background: rgba(221, 255, 241, 0.04);
          display: grid;
          gap: 0.24rem;
        }

        .ai-panel__entropy-overview-card strong,
        .ai-panel__entropy-chip strong,
        .ai-panel__entropy-loop-card strong,
        .ai-panel__entropy-sync-rail-node strong,
        .ai-panel__entropy-order-panel strong,
        .ai-panel__entropy-chaos-panel strong {
          color: #effff8;
          font-size: 0.86rem;
          line-height: 1.2;
        }

        .ai-panel__entropy-overview-card label,
        .ai-panel__entropy-chip label,
        .ai-panel__entropy-loop-card label {
          color: rgba(186, 255, 224, 0.72);
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .ai-panel__entropy-overview-card span,
        .ai-panel__entropy-chip span,
        .ai-panel__entropy-loop-card span,
        .ai-panel__entropy-sync-rail-node span,
        .ai-panel__entropy-order-panel span,
        .ai-panel__entropy-chaos-panel span {
          color: rgba(223, 243, 236, 0.74);
          font-size: 0.73rem;
          line-height: 1.45;
        }

        .ai-panel__entropy-overview-card--accent,
        .ai-panel__entropy-loop-card--accent,
        .ai-panel__entropy-sync-rail-node--accent,
        .ai-panel__entropy-chip--accent {
          border-color: rgba(128, 255, 198, 0.24);
          background: linear-gradient(180deg, rgba(120, 255, 201, 0.12), rgba(120, 255, 201, 0.04));
          box-shadow:
            inset 0 0 18px rgba(98, 255, 189, 0.06),
            0 0 16px rgba(98, 255, 189, 0.08);
        }

        .ai-panel__entropy-tag-row,
        .ai-panel__entropy-balance-copy {
          display: flex;
          flex-wrap: wrap;
          gap: 0.42rem;
        }

        .ai-panel__entropy-tag-row {
          padding-inline: 0.12rem;
        }

        .ai-panel__entropy-tag-row span,
        .ai-panel__entropy-balance-copy span {
          padding: 0.3rem 0.54rem;
          border-radius: 999px;
          border: 1px solid rgba(180, 255, 223, 0.12);
          background: rgba(221, 255, 241, 0.05);
          color: rgba(223, 255, 241, 0.82);
          font-size: 0.64rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ai-panel__entropy-loop-track {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.7rem;
          position: relative;
        }

        .ai-panel__entropy-loop-card {
          min-height: 6.6rem;
          align-content: start;
          position: relative;
          overflow: hidden;
        }

        .ai-panel__entropy-loop-card span {
          max-width: 18ch;
        }

        .ai-panel__entropy-loop-card::after {
          content: "";
          position: absolute;
          inset: auto -1.2rem -1.2rem auto;
          width: 4rem;
          height: 4rem;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(110, 255, 193, 0.14), rgba(110, 255, 193, 0));
          pointer-events: none;
        }

        .ai-panel__entropy-loop-card--accent::after {
          background: radial-gradient(circle, rgba(160, 255, 214, 0.2), rgba(160, 255, 214, 0));
        }

        .ai-panel__entropy-loop-note {
          padding: 0.1rem 0.15rem 0.2rem;
          color: rgba(205, 240, 226, 0.74);
          font-size: 0.74rem;
          line-height: 1.5;
        }

        .ai-panel__entropy-flowline::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -0.06rem;
          width: 0.48rem;
          height: 0.48rem;
          border-top: 2px solid rgba(128, 255, 198, 0.92);
          border-right: 2px solid rgba(128, 255, 198, 0.92);
          transform: translateY(-50%) rotate(45deg);
        }

        .ai-panel__entropy-flowline {
          height: 2px;
          background: linear-gradient(90deg, rgba(128, 255, 198, 0.18), rgba(128, 255, 198, 0.92));
          position: relative;
        }

        .ai-panel__entropy-balance {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: stretch;
          gap: 0.9rem;
        }

        .ai-panel__entropy-order-panel,
        .ai-panel__entropy-chaos-panel {
          display: grid;
          align-content: start;
          gap: 0.32rem;
        }

        .ai-panel__entropy-order-cluster,
        .ai-panel__entropy-chaos-cluster {
          min-height: 7.2rem;
          position: relative;
          margin-top: 0.45rem;
          border-radius: 16px;
          border: 1px solid rgba(180, 255, 223, 0.08);
          background: rgba(0, 0, 0, 0.14);
        }

        .ai-panel__entropy-order-cluster span,
        .ai-panel__entropy-chaos-cluster span {
          position: absolute;
          width: 0.56rem;
          height: 0.56rem;
          border-radius: 999px;
        }

        .ai-panel__entropy-order-cluster span {
          background: radial-gradient(circle, #f3fff9 0%, #9fffd0 55%, rgba(159, 255, 208, 0) 100%);
          box-shadow: 0 0 10px rgba(116, 255, 192, 0.34);
        }

        .ai-panel__entropy-chaos-cluster span {
          background: radial-gradient(circle, #fff0e7 0%, #ff8e6c 55%, rgba(255, 142, 108, 0) 100%);
          box-shadow: 0 0 10px rgba(255, 126, 92, 0.28);
        }

        .ai-panel__entropy-order-cluster span:nth-child(1) { left: 18%; top: 18%; }
        .ai-panel__entropy-order-cluster span:nth-child(2) { left: 42%; top: 18%; }
        .ai-panel__entropy-order-cluster span:nth-child(3) { left: 66%; top: 18%; }
        .ai-panel__entropy-order-cluster span:nth-child(4) { left: 18%; top: 42%; }
        .ai-panel__entropy-order-cluster span:nth-child(5) { left: 42%; top: 42%; }
        .ai-panel__entropy-order-cluster span:nth-child(6) { left: 66%; top: 42%; }
        .ai-panel__entropy-order-cluster span:nth-child(7) { left: 18%; top: 66%; }
        .ai-panel__entropy-order-cluster span:nth-child(8) { left: 42%; top: 66%; }
        .ai-panel__entropy-order-cluster span:nth-child(9) { left: 66%; top: 66%; }

        .ai-panel__entropy-chaos-cluster span:nth-child(1) { left: 8%; top: 18%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(2) { left: 62%; top: 10%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(3) { left: 32%; top: 26%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(4) { left: 76%; top: 34%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(5) { left: 18%; top: 44%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(6) { left: 58%; top: 50%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(7) { left: 38%; top: 62%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(8) { left: 82%; top: 70%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(9) { left: 12%; top: 74%; }
        .ai-panel__entropy-chaos-cluster span:nth-child(10) { left: 52%; top: 82%; }

        .ai-panel__entropy-divider {
          width: 2px;
          min-height: 100%;
          background: linear-gradient(180deg, rgba(117, 255, 198, 0.22), rgba(117, 255, 198, 0.9));
        }

        .ai-panel__entropy-sync-rail {
          position: relative;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: center;
          gap: 0.7rem;
        }

        .ai-panel__entropy-sync-rail-line {
          position: absolute;
          left: 14%;
          right: 14%;
          top: 50%;
          height: 2px;
          background: linear-gradient(90deg, rgba(117, 255, 198, 0.1), rgba(117, 255, 198, 0.85), rgba(117, 255, 198, 0.1));
          transform: translateY(-50%);
        }

        .ai-panel__entropy-sync-rail-node {
          position: relative;
          z-index: 1;
        }

        .ai-panel__video-wrap {
          position: relative;
          width: 100%;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(164, 206, 255, 0.2);
          box-shadow:
            0 24px 50px rgba(0, 0, 0, 0.38),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset;
          background: rgba(4, 8, 16, 0.9);
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .ai-panel.is-video-expanded .ai-panel__video-wrap {
          border-radius: 22px;
        }

        .ai-panel__video-wrap--museum {
          border-color: rgba(255, 210, 168, 0.22);
          box-shadow:
            0 24px 50px rgba(0, 0, 0, 0.34),
            0 0 0 1px rgba(255, 233, 214, 0.04) inset;
          background: rgba(22, 10, 7, 0.92);
        }

        .ai-panel__video-stage {
          width: 100%;
        }

        .ai-panel__video-trigger {
          display: block;
          padding: 0;
          text-align: left;
          cursor: pointer;
          appearance: none;
        }

        .ai-panel__video-trigger:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: rgba(140, 212, 255, 0.36);
          box-shadow:
            0 26px 54px rgba(0, 0, 0, 0.42),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset,
            0 0 26px rgba(92, 177, 255, 0.14);
        }

        .ai-panel__video-wrap--museum.ai-panel__video-trigger:hover {
          border-color: rgba(255, 210, 168, 0.34);
          box-shadow:
            0 26px 54px rgba(0, 0, 0, 0.38),
            0 0 0 1px rgba(255, 233, 214, 0.04) inset,
            0 0 26px rgba(255, 170, 92, 0.12);
        }

        .ai-panel__video-overlay {
          position: absolute;
          inset: auto 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.9rem 1rem 0.95rem;
          background: linear-gradient(180deg, rgba(8, 12, 19, 0) 0%, rgba(8, 12, 19, 0.82) 54%, rgba(8, 12, 19, 0.96) 100%);
          pointer-events: none;
        }

        .ai-panel__video-overlay--museum {
          background: linear-gradient(180deg, rgba(22, 10, 7, 0) 0%, rgba(22, 10, 7, 0.82) 54%, rgba(22, 10, 7, 0.96) 100%);
        }

        .ai-panel__video-overlay-copy {
          display: grid;
          gap: 0.18rem;
        }

        .ai-panel__video-overlay-copy strong {
          font-size: 0.82rem;
          line-height: 1.1;
          color: #f4f8ff;
        }

        .ai-panel__video-overlay-copy span {
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(188, 218, 255, 0.78);
        }

        .ai-panel__video-overlay--museum .ai-panel__video-overlay-copy span {
          color: rgba(255, 220, 190, 0.76);
        }

        .ai-panel__video-expand-icon {
          position: relative;
          width: 2.2rem;
          height: 2.2rem;
          flex: 0 0 auto;
          border-radius: 999px;
          border: 1px solid rgba(178, 220, 255, 0.26);
          background: rgba(190, 229, 255, 0.08);
          box-shadow: 0 0 24px rgba(98, 180, 255, 0.18);
        }

        .ai-panel__video-overlay--museum .ai-panel__video-expand-icon {
          border-color: rgba(255, 212, 174, 0.24);
          background: rgba(255, 225, 196, 0.08);
          box-shadow: 0 0 24px rgba(255, 172, 95, 0.14);
        }

        .ai-panel__video-expand-icon span {
          position: absolute;
          width: 0.56rem;
          height: 0.56rem;
          border-top: 2px solid rgba(226, 242, 255, 0.92);
          border-right: 2px solid rgba(226, 242, 255, 0.92);
        }

        .ai-panel__video-expand-icon span:first-child {
          top: 0.52rem;
          right: 0.52rem;
        }

        .ai-panel__video-expand-icon span:last-child {
          bottom: 0.52rem;
          left: 0.52rem;
          transform: rotate(180deg);
        }

        .ai-panel__video-hint {
          display: inline-block;
          margin-top: 0.6rem;
          font-size: 0.76rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(187, 218, 255, 0.72);
        }

        .ai-panel__video-link {
          display: inline-flex;
          align-items: center;
          margin-bottom: 0.75rem;
          padding: 0.52rem 0.82rem;
          border-radius: 999px;
          border: 1px solid rgba(168, 214, 255, 0.28);
          background: rgba(190, 229, 255, 0.1);
          color: rgba(233, 246, 255, 0.98);
          text-decoration: none;
          font-size: 0.76rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .ai-panel__video-link:hover {
          transform: translateY(-1px);
          border-color: rgba(148, 208, 255, 0.54);
          background: rgba(148, 208, 255, 0.16);
          box-shadow: 0 0 18px rgba(90, 177, 255, 0.18);
        }

        .ai-panel__video-link--museum {
          border-color: rgba(255, 198, 132, 0.42);
          background: linear-gradient(180deg, rgba(255, 196, 132, 0.2), rgba(255, 168, 92, 0.12));
          color: rgba(255, 246, 236, 0.98);
          box-shadow:
            inset 0 1px 0 rgba(255, 235, 214, 0.14),
            0 0 18px rgba(255, 170, 92, 0.12);
        }

        .ai-panel__video-link--museum:hover {
          border-color: rgba(255, 210, 150, 0.62);
          background: linear-gradient(180deg, rgba(255, 204, 148, 0.28), rgba(255, 176, 98, 0.16));
          box-shadow:
            inset 0 1px 0 rgba(255, 241, 226, 0.18),
            0 0 24px rgba(255, 175, 96, 0.2);
        }

        .ai-panel__video {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9.6;
          object-fit: cover;
        }

        .ai-panel.is-video-expanded .ai-panel__video {
          aspect-ratio: 16 / 9;
          max-height: min(66vh, 44rem);
        }

        @keyframes ai-panel-warning-pulse {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(255, 109, 77, 0.55);
          }
          65% {
            transform: scale(1.08);
            box-shadow: 0 0 0 14px rgba(255, 109, 77, 0);
          }
          100% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(255, 109, 77, 0);
          }
        }

        @keyframes ai-panel-particle-flow {
          0% {
            transform: translate(-0.3rem, -50%) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate(4.65rem, -50%) scale(1.08);
            opacity: 0;
          }
        }

        @keyframes ai-panel-bar-rise {
          0% {
            transform: scaleY(0.9);
            opacity: 0.78;
          }
          100% {
            transform: scaleY(1.06);
            opacity: 1;
          }
        }

        @keyframes entropyWave {
          0%, 100% {
            transform: scaleY(0.78);
            opacity: 0.72;
          }
          50% {
            transform: scaleY(1.08);
            opacity: 1;
          }
        }

        @keyframes entropyPulse {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.76;
          }
          50% {
            transform: scale(1.12);
            opacity: 1;
          }
        }

        @keyframes ai-panel-enter {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.94);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @media (max-width: 960px) {
          .ai-panel {
            width: min(26rem, 76vw);
          }

          .ai-panel.is-video-expanded {
            width: 90vw;
            max-height: min(90vh, 90vh);
          }

          .ai-panel__content {
            flex-direction: column;
          }

          .ai-panel__stage {
            min-height: 12.2rem;
          }

          .ai-panel__entropy-overview-grid,
          .ai-panel__entropy-sync-rail {
            grid-template-columns: 1fr;
          }

          .ai-panel__entropy-loop-track {
            grid-template-columns: 1fr;
          }

          .ai-panel__entropy-balance {
            grid-template-columns: 1fr;
          }

          .ai-panel__entropy-divider {
            width: 100%;
            min-height: 2px;
            height: 2px;
          }

          .ai-panel__entropy-sync-rail-line {
            display: none;
          }
        }
      `}</style>
    </Html>
  );
}
