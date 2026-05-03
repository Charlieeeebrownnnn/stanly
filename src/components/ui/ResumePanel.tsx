import { Html } from "@react-three/drei";
import { useEffect } from "react";

const RESUME_URL = "/data/Yu%20Nien%20Liu.pdf";

const RESUME_DATA = {
  name: "YU-NIEN LIU",
  location: "Taiwan",
  email: "rfiv12679@gmail.com",
  phone: "+886 970 839 018",
  linkedin: "in/yu-nien-liu",
  summary:
    "Front-End Developer specializing in React architecture, global state management, and enterprise AI UI integration. Experienced in building high-traffic commercial platforms and passionate about elevating interactive web rendering through emerging Web3D and GenAI technologies.",
  experience: [
    {
      title: "Front-End Developer",
      company: "Neurelli",
      period: "October 2024 - February 2026",
      location: "Taipei",
      intro:
        "Neurelli provides AI predictive systems and data analytics, delivering scalable computer vision solutions to enhance manufacturing precision.",
      bullets: [
        "Developed enterprise React applications for AI-driven defect detection and elevator recognition, translating complex models into intuitive, productized UI solutions.",
        "Integrated frontend UI with PyQt camera feeds, engineering interactive features (ROI adjustments, dynamic heatmaps, image zoom) to ensure high-precision visual fidelity.",
        "Architected global frontend state utilizing Redux and Redux Persist, ensuring precise cross-component control and seamless data persistence across sessions.",
        "Optimized client-side performance by implementing rapid memory release for high-resolution images and migrating real-time monitoring to the browser, significantly reducing server overhead.",
      ],
    },
    {
      title: "Front-End Developer",
      company: "Asia Road Technology Co., Ltd.",
      period: "July 2023 - October 2024",
      location: "Taipei",
      intro:
        "A digital agency delivering customized web solutions and large-scale e-commerce platforms for enterprise clients.",
      bullets: [
        "Engineered high-traffic commercial platforms, including the official e-commerce site for the Taiwan National Palace Museum Boutique and Syntrend Digital Life Park, ensuring scalable architecture and seamless UX.",
        "Developed custom web solutions for over 30 corporate clients utilizing HTML5, CSS3, and modern JavaScript, transforming complex UI/UX designs into pixel-perfect websites.",
        "Optimized frontend performance, restructuring legacy codebases to improve page load speeds and overall browsing fluidity across mobile and desktop devices.",
      ],
    },
  ],
  projects: [
    {
      title: "Entropy Void - Real-time AI Visualizer",
      meta: "Personal Project",
      linkLabel: "charlie-entropy-void.vercel.app/",
      linkHref: "https://charlie-entropy-void.vercel.app/",
      period: "March 2026 - March 2026",
      bullets: [
        'Engineered a Real-time "AI to UI" Architecture: Built a 3D thermodynamic visualizer using React and Three.js, integrated with Transformers.js for zero-latency, on-device sentiment analysis without server reliance.',
        "Implemented Global Data Synchronization: Connected Firebase Cloud Firestore to instantly sync emotional frequency inputs across all active users globally, maintaining a real-time, shared HUD experience.",
        "Resolved Critical iOS Safari Rendering Issues: Authored custom CSS architectures to completely bypass native mobile constraints (e.g., rubber-band scrolling, auto-zoom on inputs), achieving a pixel-perfect, native-app-like immersion.",
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
      value: "React, Next.js, JavaScript (ES6+), Redux / Context API, HTML5/CSS3.",
    },
    {
      label: "Creative Tech & AI",
      value: "Three.js, React Three Fiber (R3F), Transformers.js (In-Browser AI).",
    },
    {
      label: "Backend & Cloud Integration",
      value: "Node.js, MongoDB, Firebase (Firestore & Real-time Sync), RESTful API, Git.",
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
      transform
      position={position}
      distanceFactor={1.28}
      occlude={false}
      zIndexRange={[40, 0]}
      wrapperClass="resume-panel__html-root"
    >
      <article
        className="resume-panel"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="resume-panel__hero">
          <div>
            <p className="resume-panel__eyebrow">Paper Tablet Resume</p>
            <h2 className="resume-panel__name">{RESUME_DATA.name}</h2>
          </div>

          <div className="resume-panel__actions">
            <a className="resume-panel__action" href={RESUME_URL} target="_blank" rel="noreferrer">
              Open PDF
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

      <style>{`
        .resume-panel__html-root {
          pointer-events: auto;
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
