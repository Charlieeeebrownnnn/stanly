import { lazy, Suspense, useEffect, useRef, useState } from "react";

const GorillaSelectionMarker = lazy(() => import("../webgl/GorillaSelectionMarker"));
const OverlookCorridorScene = lazy(() => import("../webgl/OverlookCorridorScene"));

const REVEAL_DURATION_MS = 7000;
const HOLD_AT_END_MS = 1500;
const SWALLOW_COVER_MS = 520;
const SWALLOW_RELEASE_MS = 560;
const BLOOD_FLOOD_COMPLETE_MS = 1820;
const OP1_AUDIO_PATH = "/assets/music/op1.m4a";
const OP2_AUDIO_PATH = "/assets/music/0p2.m4a";
const SOUND_STORAGE_KEY = "the-architect-sound-enabled";

type GorillaNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

type LoadingPhase = "loading" | "ready" | "opening" | "selecting" | "transitioning" | "corridor";

const GORILLA_NODES: GorillaNode[] = [
  { id: "cliff-alpha", label: "Caesar", x: 6.6, y: 31.2 },
  { id: "monolith-scout", label: "HAL-9000", x: 22.8, y: 40 },
  { id: "left-foreground", label: "Alex DeLarge", x: 18, y: 58 },
  { id: "pit-drifter", label: "Dr. Zaius", x: 62.5, y: 73 },
  { id: "dune-leaper", label: "Jack Torrance", x: 77.5, y: 33 },
  { id: "elder-primate", label: "Dave Bowman", x: 95, y: 20 },

];

function findDirectionalTarget(
  nodes: GorillaNode[],
  currentIndex: number,
  direction: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight",
) {
  const current = nodes[currentIndex];
  const candidates = nodes
    .map((node, index) => ({ node, index }))
    .filter(({ index }) => index !== currentIndex)
    .filter(({ node }) => {
      if (direction === "ArrowLeft") return node.x < current.x - 1;
      if (direction === "ArrowRight") return node.x > current.x + 1;
      if (direction === "ArrowUp") return node.y < current.y - 1;
      return node.y > current.y + 1;
    })
    .map(({ node, index }) => {
      const dx = node.x - current.x;
      const dy = node.y - current.y;
      const primary = direction === "ArrowLeft" || direction === "ArrowRight"
        ? Math.abs(dx)
        : Math.abs(dy);
      const secondary = direction === "ArrowLeft" || direction === "ArrowRight"
        ? Math.abs(dy)
        : Math.abs(dx);

      return {
        index,
        score: primary * 1.35 + secondary * 0.8,
      };
    })
    .sort((a, b) => a.score - b.score);

  return candidates[0]?.index ?? currentIndex;
}

function cinematicLoadingCurve(value: number) {
  if (value < 0.18) {
    return value * 0.45;
  }

  if (value < 0.42) {
    return 0.081 + (value - 0.18) * 0.85;
  }

  if (value < 0.62) {
    return 0.285 + (value - 0.42) * 0.45;
  }

  if (value < 0.84) {
    return 0.375 + (value - 0.62) * 1.48;
  }

  if (value < 0.94) {
    return 0.7006 + (value - 0.84) * 0.58;
  }

  return 0.7586 + (value - 0.94) * 4.0233333333;
}

function formatProgress(value: number) {
  return `${Math.round(value)}`.padStart(2, "0");
}

function detectMobileExperience() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobileUserAgent =
    /android|iphone|ipad|ipod|mobile|blackberry|iemobile|opera mini/.test(userAgent);
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasNarrowViewport = window.matchMedia("(max-width: 1024px)").matches;

  return isMobileUserAgent || (hasCoarsePointer && hasNarrowViewport);
}

export default function LoadingScreen() {
  const [isMobileExperience, setIsMobileExperience] = useState(() => detectMobileExperience());
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [phase, setPhase] = useState<LoadingPhase>("loading");
  const [swallowPhase, setSwallowPhase] = useState<"idle" | "closing" | "opening">(
    "idle",
  );
  const [selectedGorillaIndex, setSelectedGorillaIndex] = useState(5);
  const [showGuideIntroCard, setShowGuideIntroCard] = useState(false);
  const [corridorReady, setCorridorReady] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(true);
  const [selectionConfirmBlockedUntil, setSelectionConfirmBlockedUntil] = useState(0);
  const completionTimeoutRef = useRef<number | null>(null);
  const op1AudioRef = useRef<HTMLAudioElement | null>(null);
  const op2AudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const updateMobileExperience = () => {
      setIsMobileExperience(detectMobileExperience());
    };

    updateMobileExperience();
    window.addEventListener("resize", updateMobileExperience);

    return () => {
      window.removeEventListener("resize", updateMobileExperience);
    };
  }, []);

  const beginGuideSelection = (confirmBlockMs = 0) => {
    setSelectionConfirmBlockedUntil(
      confirmBlockMs > 0 ? performance.now() + confirmBlockMs : 0,
    );
    setPhase("selecting");
  };

  useEffect(() => {
    if (isMobileExperience) {
      return;
    }

    const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);

    if (stored === "false") {
      setSoundEnabled(false);
    }
  }, [isMobileExperience]);

  useEffect(() => {
    if (isMobileExperience) {
      return;
    }

    window.localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? "true" : "false");
  }, [isMobileExperience, soundEnabled]);

  useEffect(() => {
    if (isMobileExperience) {
      return;
    }

    const op1 = new Audio(OP1_AUDIO_PATH);
    op1.loop = true;
    op1.volume = 0.96;
    op1.preload = "auto";

    const op2 = new Audio(OP2_AUDIO_PATH);
    op2.loop = true;
    op2.volume = 0.87;
    op2.preload = "auto";

    op1AudioRef.current = op1;
    op2AudioRef.current = op2;

    return () => {
      op1.pause();
      op2.pause();
      op1.currentTime = 0;
      op2.currentTime = 0;
      op1AudioRef.current = null;
      op2AudioRef.current = null;
    };
  }, [isMobileExperience]);

  useEffect(() => {
    if (isMobileExperience) {
      return;
    }

    const op1ShouldPlay = soundEnabled && (phase === "loading" || phase === "ready");
    const op2ShouldPlay = soundEnabled && (phase === "selecting" || phase === "transitioning");

    if (!audioUnlocked) {
      if (op1AudioRef.current) {
        op1AudioRef.current.pause();
        op1AudioRef.current.currentTime = 0;
      }

      if (op2AudioRef.current) {
        op2AudioRef.current.pause();
        op2AudioRef.current.currentTime = 0;
      }

      return;
    }

    if (op1AudioRef.current) {
      if (op1ShouldPlay) {
        void op1AudioRef.current.play().catch(() => {
          setAudioUnlocked(false);
        });
      } else {
        op1AudioRef.current.pause();
        op1AudioRef.current.currentTime = 0;
      }
    }

    if (op2AudioRef.current) {
      if (op2ShouldPlay) {
        void op2AudioRef.current.play().catch(() => {
          setAudioUnlocked(false);
        });
      } else {
        op2AudioRef.current.pause();
        op2AudioRef.current.currentTime = 0;
      }
    }
  }, [audioUnlocked, isMobileExperience, phase, soundEnabled]);

  useEffect(() => {
    if (audioUnlocked || isMobileExperience) {
      return;
    }

    const unlockAudio = () => {
      setAudioUnlocked(true);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, [audioUnlocked, isMobileExperience]);

  useEffect(() => {
    let animationFrameId = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const normalizedTime = Math.min(elapsed / REVEAL_DURATION_MS, 1);
      const cinematicProgress = cinematicLoadingCurve(normalizedTime) * 100;
      const nextProgress = Math.min(cinematicProgress, 100);

      setDisplayedProgress((current) => (nextProgress > current ? nextProgress : current));

      if (nextProgress < 100) {
        animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (phase !== "loading" || displayedProgress < 99.5) {
      return;
    }

    completionTimeoutRef.current = window.setTimeout(() => {
      setPhase("ready");
    }, HOLD_AT_END_MS);

    return () => {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [displayedProgress, phase]);

  useEffect(() => {
    if (phase !== "ready") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        beginGuideSelection(320);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "selecting") {
      setSelectionConfirmBlockedUntil(0);
      return;
    }

    const handleSelectionInput = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (performance.now() < selectionConfirmBlockedUntil) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        setPhase("transitioning");
        return;
      }

      if (
        event.key !== "ArrowUp" &&
        event.key !== "ArrowDown" &&
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
      ) {
        return;
      }

      event.preventDefault();
      setSelectedGorillaIndex((currentIndex) =>
        findDirectionalTarget(GORILLA_NODES, currentIndex, event.key),
      );
    };

    window.addEventListener("keydown", handleSelectionInput);

    return () => {
      window.removeEventListener("keydown", handleSelectionInput);
    };
  }, [phase, selectionConfirmBlockedUntil]);

  useEffect(() => {
    if (phase === "loading") {
      return;
    }

    const overlookCarpet = new Image();
    overlookCarpet.src = "/sprites/overlook-carpet.png";

    void import("../webgl/GorillaSelectionMarker");
  }, [phase]);

  useEffect(() => {
    if (phase !== "corridor") {
      setCorridorReady(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setCorridorReady(true);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "selecting") {
      setShowGuideIntroCard(false);
      return;
    }

    setShowGuideIntroCard(true);

    const timer = window.setTimeout(() => {
      setShowGuideIntroCard(false);
    }, 2800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "transitioning") {
      return;
    }

    const completeTimer = window.setTimeout(() => {
      setPhase("corridor");
    }, BLOOD_FLOOD_COMPLETE_MS);

    return () => {
      window.clearTimeout(completeTimer);
    };
  }, [phase]);

  const handleEnter = () => {
    if (phase !== "ready") {
      return;
    }

    beginGuideSelection();
  };

  const maskHeight = `${100 - displayedProgress}%`;
  const revealEdge = `calc(${maskHeight} - 2.5rem)`;
  const progressLabel = formatProgress(displayedProgress);
  const selectedGorilla = GORILLA_NODES[selectedGorillaIndex];
  const isReady = phase === "ready";
  const showGorilla = phase === "selecting" || phase === "transitioning";
  const showCorridorTransitionScene =
    phase === "selecting" || phase === "transitioning" || phase === "corridor";
  const isBloodFlooding = phase === "transitioning";
  const isBloodFloodComplete = phase === "corridor";
  const statusLabel = isBloodFlooding
    ? "Threshold Crossing"
    : phase === "selecting"
      ? "Guide Selection Active"
      : isReady
        ? "Entrance Ready"
        : "Preparing The Archive";

  if (isMobileExperience) {
    return (
      <>
        <div className="mobile-shield">
          <div className="mobile-shield__inner">
            <p className="mobile-shield__kicker">Desktop Only</p>
            <h1 className="mobile-shield__title">From instinct to intention.</h1>
            <p className="mobile-shield__copy">
              This immersive 3D experience utilizes heavy real-time computing and cinematic sound design.
            </p>
            <p className="mobile-shield__copy">
              To experience it in maximum fidelity, please view on a desktop or laptop.
            </p>
          </div>
        </div>

        <style>{`
          .mobile-shield {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1.5rem;
            background:
              radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 28%),
              linear-gradient(180deg, rgba(8, 8, 8, 0.96) 0%, rgba(0, 0, 0, 1) 100%);
            color: rgba(255, 248, 236, 0.92);
          }

          .mobile-shield__inner {
            width: min(28rem, 100%);
            text-align: center;
          }

          .mobile-shield__kicker {
            margin: 0 0 0.9rem;
            font-size: 0.68rem;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: rgba(255, 248, 236, 0.46);
          }

          .mobile-shield__title {
            margin: 0;
            font-size: clamp(1.8rem, 6vw, 2.5rem);
            font-weight: 500;
            letter-spacing: 0.02em;
            line-height: 1.12;
            text-wrap: balance;
            text-shadow: 0 0 24px rgba(255, 255, 255, 0.08);
          }

          .mobile-shield__copy {
            margin: 1.15rem 0 0;
            font-size: 0.92rem;
            line-height: 1.75;
            letter-spacing: 0.02em;
            color: rgba(255, 248, 236, 0.72);
          }
        `}</style>
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-black"
      role={isReady ? "button" : undefined}
      tabIndex={isReady ? 0 : -1}
      onClick={handleEnter}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleEnter();
        }
      }}
    >
      {showGorilla ? (
        <>
          <img
            src="/sprites/gorilla.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              filter: "brightness(1.08) contrast(1.04) saturate(0.96)",
            }}
            draggable="false"
          />

          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255, 246, 220, 0.12) 0%, rgba(255, 236, 190, 0.06) 22%, rgba(0, 0, 0, 0) 54%)",
            }}
          />

          <div className="pointer-events-none absolute inset-0 z-10">
            <div
              className="gorilla-selector"
              style={{
                left: `${selectedGorilla.x}%`,
                top: `${selectedGorilla.y}%`,
              }}
            >
              <Suspense fallback={null}>
                <GorillaSelectionMarker />
              </Suspense>
            </div>
          </div>
        </>
      ) : (
        <>
          <img
            src="/sprites/regen1.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            draggable="false"
          />

          <div
            className="absolute inset-x-0 top-0 overflow-hidden"
            style={{
              height: maskHeight,
              clipPath: "inset(0 0 0 0)",
              WebkitClipPath: "inset(0 0 0 0)",
              willChange: "height",
            }}
          >
            <img
              src="/sprites/bg-desert.png"
              alt=""
              className="absolute left-0 top-0 w-full object-cover"
              style={{ height: "100svh" }}
              draggable="false"
            />
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 z-10"
            style={{
              top: revealEdge,
              height: "5rem",
              background:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(10, 8, 6, 0.72) 42%, rgba(0, 0, 0, 0.94) 100%)",
              filter: "blur(14px)",
              opacity: displayedProgress < 100 ? 1 : 0.4,
              willChange: "top",
            }}
          />

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[26vh]"
            style={{
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 0.96) 0%, rgba(8, 7, 6, 0.72) 35%, rgba(8, 7, 6, 0.18) 70%, rgba(0, 0, 0, 0) 100%)",
            }}
          />

          <div className="loading-screen-dust pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[30vh]" />
        </>
      )}

      <div className="loading-screen-vignette pointer-events-none absolute inset-0 z-10" />

      <div
        className={`loading-screen-swallow pointer-events-none absolute z-[15] ${
          swallowPhase === "closing"
            ? "loading-screen-swallow-closing"
            : swallowPhase === "opening"
              ? "loading-screen-swallow-opening"
              : ""
        }`}
      />

      {phase !== "corridor" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex flex-col items-center gap-4 px-6 text-white">
          <div className="loading-screen-status text-[0.62rem] uppercase tracking-[0.55em] opacity-80">
            {statusLabel}
          </div>

          <div className="text-center text-[0.56rem] tracking-[0.18em] text-emerald-50/60">
            Please turn on sound for the full experience.
          </div>

          {phase === "loading" || phase === "ready" ? (
            <div className="loading-screen-percent-wrap">
              <div className="loading-screen-percent-label">Loading</div>
              <div className="loading-screen-percent text-[1.4rem] tracking-[0.28em] sm:text-[1.8rem]">
                {progressLabel}%
              </div>
            </div>
          ) : phase === "selecting" ? (
            <div className="gorilla-selection-panel">
              <div className="gorilla-selection-kicker">
                Choose Your Guide
              </div>
              <div className="gorilla-selection-name">{selectedGorilla.label}</div>
              <div className="gorilla-selection-hint">
                Use arrow keys, press Enter
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {showGuideIntroCard ? (
        <div className="pointer-events-none absolute inset-0 z-[22] flex items-center justify-center px-6 text-white">
          <div className="story-intro-overlay">
            Choose a guide, then enter a portfolio built as a haunted hotel.
          </div>
        </div>
      ) : null}

      {showCorridorTransitionScene ? (
        <div
          className={`pointer-events-none absolute inset-0 overflow-hidden ${
            phase === "selecting"
              ? "z-[12] opacity-0"
              : isBloodFlooding
                ? "z-[12] blood-flood-corridor-reveal opacity-100"
                : isBloodFloodComplete
                  ? "z-[19] opacity-100"
                  : "z-[16] opacity-0"
          }`}
        >
          <Suspense fallback={null}>
            <OverlookCorridorScene previewMode={!isBloodFloodComplete} soundEnabled={soundEnabled} />
          </Suspense>
        </div>
      ) : null}

      {isBloodFlooding ? (
        <div className="pointer-events-none absolute inset-0 z-[18] overflow-hidden">
          <div className="blood-flood-layer blood-flood-layer-back" />
          <div className="blood-flood-layer blood-flood-layer-mid" />
          <div className="blood-flood-layer blood-flood-layer-front" />
          <div className="blood-flood-stream blood-flood-stream-one" />
          <div className="blood-flood-stream blood-flood-stream-two" />
          <div className="blood-flood-stream blood-flood-stream-three" />
          <div className="blood-flood-stream blood-flood-stream-four" />
          <div className="blood-flood-stream blood-flood-stream-five" />
          <div className="blood-flood-spray blood-flood-spray-left" />
          <div className="blood-flood-spray blood-flood-spray-right" />
          <div className="blood-flood-surge blood-flood-surge-left" />
          <div className="blood-flood-surge blood-flood-surge-right" />
        </div>
      ) : null}

      {isReady ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-white">
          <div className="loading-screen-enter text-center text-[1.9rem] uppercase tracking-[0.7em] opacity-100 sm:text-[2.8rem]">
            PRESS ENTER
          </div>
        </div>
      ) : null}

      {!audioUnlocked && soundEnabled && phase !== "corridor" ? (
        <div className="pointer-events-none absolute bottom-[4.35rem] right-[4.35rem] z-[30] flex flex-col items-end gap-2 text-right text-amber-100/74">
          <div
            className="text-[0.68rem] uppercase tracking-[0.22em]"
            style={{ animation: "soundPromptPulse 1.5s ease-in-out infinite" }}
          >
            Click to enable sound
          </div>
          <svg
            width="56"
            height="42"
            viewBox="0 0 56 42"
            fill="none"
            aria-hidden="true"
            style={{ animation: "soundPromptArrow 1.35s ease-in-out infinite" }}
          >
            <path
              d="M4 4C22 4 27 10 34 18C38 23 42 28 49 31"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeDasharray="2 5"
            />
            <path
              d="M42 30L50 31L46 24"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
        onClick={() => {
          setAudioUnlocked(true);
          setSoundEnabled((current) => !current);
        }}
        className={`absolute bottom-5 right-5 z-[30] flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition hover:bg-black/36 hover:text-emerald-50 ${
          !audioUnlocked && soundEnabled
            ? "bg-amber-200/12 text-amber-100 shadow-[0_0_24px_rgba(255,219,128,0.18)]"
            : "bg-black/24 text-emerald-50/70"
        }`}
      >
        {soundEnabled ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 14h3l4 4V6L8 10H5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M16 9.5a4 4 0 010 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18.8 7a7.5 7.5 0 010 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 14h3l4 4V6L8 10H5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M16.5 9.5l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M20.5 9.5l-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <style>{`
        @keyframes soundPromptArrow {
          0%, 100% {
            opacity: 0.38;
            transform: translate(0, 0);
          }
          50% {
            opacity: 1;
            transform: translate(3px, 3px);
          }
        }

        @keyframes soundPromptPulse {
          0%, 100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
