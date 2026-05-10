import { Html } from "@react-three/drei";
import { useEffect } from "react";
import useIsSafari from "../useIsSafari";

const RESUME_URL = "/data/Yu-Nien-Liu_Resume.pdf";

const RESUME_DATA = {
  name: "YU-NIEN LIU",
  location: "Taipei, Taiwan",
  email: "rfiv12679@gmail.com",
  phone: "+886 970 839 018",
  linkedin: "in/yu-nien-liu",
  portfolio: "stanly-xi.vercel.app",
  summary:
    "Senior-level Front-End Developer and Creative Technologist specializing in React architecture, Web3D (R3F/Three.js), and enterprise-grade AI UI integration. Expert at bridging human instinct and digital intention through cinematic audio-visual storytelling. Proven track record in optimizing high-performance systems and architecting complex global state for mission-critical industrial AI applications.",
  experience: [
    {
      title: "Front-End Developer",
      company: "Neurelli",
      period: "Oct 2024 - Feb 2026",
      location: "Taipei",
      intro:
        "Built enterprise-grade React interfaces for AI-driven industrial systems, turning complex computer vision workflows into production-ready operator tools.",
      bullets: [
        "Developed enterprise React applications for AI-driven defect detection, translating high-complexity computer vision models into intuitive, production-ready UI solutions.",
        "Engineered interactive PyQt camera feed integrations featuring ROI adjustments, dynamic heatmaps, and precise image analysis tools for manufacturing precision.",
        "Architected global state management using Redux and Redux Persist, ensuring seamless cross-component synchronization and data persistence for long-running sessions.",
        "Optimized client-side memory handling and migrated real-time monitoring to the browser, reducing server-side overhead by 30% while maintaining 60FPS visual fidelity.",
      ],
    },
    {
      title: "Front-End Developer",
      company: "Asia Road Technology Co., Ltd.",
      period: "Jul 2023 - Oct 2024",
      location: "Taipei",
      intro:
        "Delivered high-performance web builds for enterprise and e-commerce clients, with a strong focus on execution quality, scalability, and UX polish.",
      bullets: [
        "Delivered high-performance web solutions and large-scale e-commerce platforms for 30+ corporate clients, transforming complex UI/UX designs into pixel-perfect experiences.",
        "Spearheaded the restructuring of legacy codebases, significantly improving SEO metrics, accessibility scores, and page load speeds across global deployments.",
      ],
    },
  ],
  projects: [
    {
      title: "Stanly - 3D Narrative Portfolio",
      meta: "Portfolio Project",
      linkLabel: "stanly-xi.vercel.app",
      linkHref: "https://stanly-xi.vercel.app",
      period: "March 2026 - Present",
      bullets: [
        'Engineered a cinematic 3D journey using React Three Fiber (R3F), featuring dynamic voxel evolution and custom post-processing, inspired by Kubrick\'s "2001: A Space Odyssey."',
        'Implemented advanced audio logic via Web Audio API, including spatial sound attenuation and seamless transition filters to mirror the visual "evolution" narrative.',
        "Optimized heavy 3D assets (400MB+) using GLTF/Draco compression and customized asset streaming strategies to achieve rapid initial load times on mobile and desktop.",
      ],
    },
    {
      title: "Entropy Void - Real-time AI Visualizer",
      meta: "Personal Project",
      linkLabel: "charlie-entropy-void.vercel.app",
      linkHref: "https://charlie-entropy-void.vercel.app/",
      period: "March 2026",
      bullets: [
        "Architected a real-time thermodynamic visualizer using React and Transformers.js for zero-latency, on-device sentiment analysis without backend dependency.",
        "Integrated Firebase for instant global synchronization and authored custom CSS architectures to bypass native mobile rendering constraints for full-screen immersion.",
      ],
    },
  ],
  education: {
    degree: "Bachelor of Science in Engineering Science",
    school: "National Cheng Kung University",
    location: "Tainan",
    year: "2018",
  },
  skills: [
    {
      label: "Frontend & Architecture",
      value: "React, Next.js, ES6+, Redux, GSAP, Framer Motion, HTML5/CSS3.",
    },
    {
      label: "Creative Tech & AI",
      value: "Three.js, React Three Fiber (R3F), Web Audio API, Transformers.js, GLTF/Draco.",
    },
    {
      label: "Cloud & Infrastructure",
      value: "Node.js, MongoDB, Firebase (Real-time), RESTful APIs, Git, Vercel/CI/CD.",
    },
  ],
};

export default function ResumePanel({
  isOpen,
  onClose,
  position = [0, 0, 0],
}: {
  isOpen: boolean;
  onClose: () => void;
  position?: [number, number, number];
}) {
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

  if (!isOpen) {
    return null;
  }

  return (
    <Html
      transform={!isSafari}
      fullscreen={isSafari}
      position={position}
      distanceFactor={1.28}
      occlude={false}
      zIndexRange={[40, 0]}
      wrapperClass="resume-panel__html-root"
    >
      <div className={isSafari ? "resume-panel__viewport is-safari" : "resume-panel__viewport"}>
        <article
          className={isSafari ? "resume-panel resume-panel--safari" : "resume-panel"}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
        <header className="resume-panel__hero">
          <div>
            <p className="resume-panel__eyebrow">Paper Tablet Resume</p>
            <h2 className="resume-panel__name">{RESUME_DATA.name}</h2>
          </div>

          <div className="resume-panel__actions">
            <a className="resume-panel__action" href={RESUME_URL} download="Yu-Nien-Liu_Resume.pdf">
              Download
            </a>
            <button className="resume-panel__action resume-panel__action--solid" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        <section className="resume-panel__contact">
          <span>{RESUME_DATA.location}</span>
          <span>{RESUME_DATA.email}</span>
          <span>{RESUME_DATA.phone}</span>
          <span>{RESUME_DATA.linkedin}</span>
          <span>{RESUME_DATA.portfolio}</span>
        </section>

        <section className="resume-panel__section">
          <h3>Summary</h3>
          <p>{RESUME_DATA.summary}</p>
        </section>

        <section className="resume-panel__section">
          <h3>Experience</h3>
          <div className="resume-panel__stack">
            {RESUME_DATA.experience.map((item) => (
              <article key={`${item.company}-${item.period}`} className="resume-panel__entry">
                <div className="resume-panel__row">
                  <div>
                    <h4>{item.title}</h4>
                    <p className="resume-panel__company">{item.company}</p>
                  </div>
                  <p className="resume-panel__meta">
                    {item.period}, {item.location}
                  </p>
                </div>
                <p className="resume-panel__intro">{item.intro}</p>
                <ul className="resume-panel__list">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-panel__section">
          <h3>Project</h3>
          {RESUME_DATA.projects.map((project) => (
            <article key={project.title} className="resume-panel__entry">
              <div className="resume-panel__row">
                <div>
                  <h4>{project.title}</h4>
                  <p className="resume-panel__company">
                    {project.meta} ·{" "}
                    <a href={project.linkHref} target="_blank" rel="noreferrer">
                      {project.linkLabel}
                    </a>
                  </p>
                </div>
                <p className="resume-panel__meta">{project.period}</p>
              </div>
              <ul className="resume-panel__list">
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="resume-panel__split">
          <div className="resume-panel__section">
            <h3>Education</h3>
            <article className="resume-panel__entry">
              <h4>{RESUME_DATA.education.degree}</h4>
              <p className="resume-panel__company">
                {RESUME_DATA.education.school} · {RESUME_DATA.education.location} · {RESUME_DATA.education.year}
              </p>
            </article>
          </div>

          <div className="resume-panel__section">
            <h3>Skills</h3>
            <div className="resume-panel__stack">
              {RESUME_DATA.skills.map((skill) => (
                <p key={skill.label} className="resume-panel__skill">
                  <strong>{skill.label}:</strong> {skill.value}
                </p>
              ))}
            </div>
          </div>
        </section>
        </article>
      </div>

      <style>{`
        .resume-panel__html-root {
          pointer-events: auto;
          touch-action: manipulation;
        }

        .resume-panel__viewport {
          display: contents;
        }

        .resume-panel__viewport.is-safari {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          padding: 1.25rem;
          box-sizing: border-box;
          pointer-events: none;
        }

        .resume-panel {
          width: min(56rem, 86vw);
          max-height: min(46rem, 84vh);
          overflow: auto;
          padding: 1.5rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(87, 61, 36, 0.18);
          background:
            radial-gradient(circle at top, rgba(255, 250, 242, 0.96), rgba(247, 239, 227, 0.97) 38%, rgba(240, 229, 212, 0.98) 100%);
          color: #2c241c;
          box-shadow:
            0 2rem 5rem rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(16px);
          font-family: Georgia, "Times New Roman", serif;
        }

        .resume-panel--safari {
          width: min(80rem, 98vw);
          max-height: min(92vh, 68rem);
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

        .resume-panel__hero,
        .resume-panel__row,
        .resume-panel__contact,
        .resume-panel__split {
          display: flex;
          gap: 1rem;
        }

        .resume-panel__hero,
        .resume-panel__row {
          align-items: flex-start;
          justify-content: space-between;
        }

        .resume-panel__hero {
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(63, 46, 28, 0.14);
        }

        .resume-panel__eyebrow {
          margin: 0 0 0.35rem;
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(109, 78, 48, 0.75);
        }

        .resume-panel__name {
          margin: 0;
          font-size: 2.1rem;
          letter-spacing: 0.04em;
        }

        .resume-panel__actions {
          display: flex;
          gap: 0.7rem;
          font-family: "SF Pro Display", "Inter", system-ui, sans-serif;
        }

        .resume-panel__action {
          border: 1px solid rgba(78, 57, 35, 0.18);
          background: rgba(255, 255, 255, 0.52);
          color: #3d2d1f;
          border-radius: 999px;
          padding: 0.62rem 0.96rem;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
        }

        .resume-panel__action--solid {
          background: #3b2a1d;
          color: #fff7ec;
        }

        .resume-panel--safari .resume-panel__action {
          position: relative;
          z-index: 1;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .resume-panel__contact {
          flex-wrap: wrap;
          margin: 0.9rem 0 1.1rem;
          color: #5f4f40;
          font-family: "SF Pro Text", "Inter", system-ui, sans-serif;
          font-size: 0.88rem;
        }

        .resume-panel__contact span::before {
          content: "•";
          margin-right: 0.55rem;
          color: rgba(121, 89, 55, 0.72);
        }

        .resume-panel__contact span:first-child::before {
          content: "";
          margin-right: 0;
        }

        .resume-panel__section {
          margin-top: 1.1rem;
        }

        .resume-panel__section h3 {
          margin: 0 0 0.72rem;
          padding-bottom: 0.38rem;
          border-bottom: 2px solid rgba(46, 35, 25, 0.88);
          font-size: 1.18rem;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .resume-panel__section p,
        .resume-panel__list {
          margin: 0;
          font-size: 0.98rem;
          line-height: 1.58;
        }

        .resume-panel__stack {
          display: grid;
          gap: 0.95rem;
        }

        .resume-panel__entry {
          display: grid;
          gap: 0.22rem;
        }

        .resume-panel__entry h4 {
          margin: 0;
          font-size: 1.18rem;
        }

        .resume-panel__company,
        .resume-panel__meta,
        .resume-panel__intro {
          color: #5b4b3e;
        }

        .resume-panel__company,
        .resume-panel__meta {
          font-size: 0.94rem;
          font-weight: 600;
        }

        .resume-panel__meta {
          white-space: nowrap;
        }

        .resume-panel__intro {
          font-style: italic;
        }

        .resume-panel__list {
          padding-left: 1.15rem;
        }

        .resume-panel__skill {
          margin: 0;
        }

        .resume-panel__split {
          align-items: flex-start;
        }

        .resume-panel__split > * {
          flex: 1 1 0;
        }

        .resume-panel a {
          color: #1f5fb5;
        }

        @media (max-width: 900px) {
          .resume-panel {
            width: min(92vw, 42rem);
            max-height: 82vh;
            padding: 1.08rem;
          }

          .resume-panel__hero,
          .resume-panel__row,
          .resume-panel__split {
            flex-direction: column;
          }

          .resume-panel__meta {
            white-space: normal;
          }

          .resume-panel__name {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </Html>
  );
}
