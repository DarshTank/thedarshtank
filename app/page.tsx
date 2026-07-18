"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  Film,
  Play,
  Mic,
  Volume2,
  VolumeX,
  FileDown,
} from "lucide-react";
import { db, isConfigured } from "../lib/firebase";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";


// Inline SVG components to bypass old lucide-react version lack of Github/Linkedin
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GITHUB = "https://github.com/Darshtank05";
const LINKEDIN = "https://www.linkedin.com/in/darsh-tank";
const EMAIL = "darshtank05@gmail.com";
const PHONE = "+91 94299-12644";

const projects = [
  {
    no: "01",
    name: "AltiShift",
    year: "2026",
    role: "Cross-cloud VM migration platform",
    runtime: "Feature · 2026",
    logline: "One machine, five clouds, zero manual intervention.",
    stack: ["Python", "Frappe", "Bash", "Node.js", "MySQL"],
    bullets: [
      "Bidirectional VM migration pipeline across AWS, GCP, DigitalOcean, CloudStack, and Virtuozzo.",
      "Fully automated transfer using only source/destination API and access keys — no manual steps.",
      "Handles bootloader reinstallation, network reconfiguration, and OS-aware package management across distros.",
      "Live step-by-step migration logging with per-job progress tracking.",
    ],
  },
  {
    no: "02",
    name: "WriteVerse",
    year: "2026",
    role: "Multi-role blogging platform",
    runtime: "Feature · 2026",
    logline: "A newsroom of strangers, moderated in real-time by a polite machine.",
    stack: ["Django", "Python", "SQLite 3", "Gemini API", "Brevo SMTP"],
    bullets: [
      "Multi-role RBAC for Admins, Managers, Writers with SQLite persistence.",
      "Gemini API for real-time toxicity moderation of user comments.",
      "Secure OTP-based auth for registration and password resets via Brevo.",
      "Social engagement: follow system, bookmarking, AJAX-based likes.",
      "Comprehensive admin dashboard for users, categories, content visibility.",
    ],
  },
  {
    no: "03",
    name: "Draft AI",
    year: "2026",
    role: "Gmail AI reply assistant — Chrome Extension",
    runtime: "Short · 2026",
    logline:
      "An invisible assistant slips into your inbox and writes the email you didn't have time for.",
    stack: ["Java", "Spring Boot", "React", "Chrome Ext (MV3)", "Gemini", "Material UI"],
    bullets: [
      "Chrome Extension (Manifest V3) with DOM injection of an AI Reply button into Gmail.",
      "Spring Boot WebFlux backend handling high-concurrency Gemini API requests.",
      "Responsive landing page with dynamic tone-selection modules for professional comms.",
    ],
  },
  {
    no: "04",
    name: "Veil",
    year: "2025",
    role: "Anonymous messaging platform with AI",
    runtime: "Mystery · 2025",
    logline: "Anonymous, but never reckless. A safer place to say the thing.",
    stack: ["Next.js", "Tailwind", "NextAuth", "Zod", "Resend", "Gemini", "MongoDB"],
    bullets: [
      "AI-powered anonymous messaging using Gemini for safer, smarter exchanges.",
      "Modern, responsive UI built with Tailwind CSS for clarity and usability.",
      "OTP verification via Resend Email API to cut down fake signups.",
      "NextAuth + Zod for hardened authentication and schema validation.",
    ],
  },
];

const defaultCredits = [
  ["Directed & Written by", "Darsh Tank"],
  ["Starring", "Java · Spring Boot · Next.js · Django"],
  ["Cinematography", "Tailwind CSS · React"],
  ["Original Score", "Gemini API · Claude · Groq API"],
  ["Filmed on Location", "Ahmedabad · Rajkot · India"],
  [
    "Special Thanks",
    "Nirma University · Atmiya University · STP Web Hosting · InfiniteAI · Technosoft",
  ],
];

const defaultSkills = {
  Languages: ["Java", "Python", "JavaScript", "PHP"],
  Frameworks: [
    "Next.js",
    "Frappe",
    "React",
    "Spring Boot",
    "Django",
    "Express",
    "Node.js",
    "Tailwind CSS",
  ],
  Databases: ["MySQL", "MongoDB", "Firebase", "SQLite"],
  Tooling: [
    "Git / GitHub",
    "Chrome Ext (MV3)",
    "Gemini API",
    "NextAuth",
    "Zod",
    "Resend",
    "EmailJS",
    "Brevo",
  ],
};

const defaultBackstory = {
  quote: "Aspiring Computer Science student with a strong passion for coding and building real-world applications.",
  body: "I see every challenge as an opportunity to learn, experiment, and create impactful solutions. With hands-on experience in web development and Core Java, I bring energy, curiosity, and a problem-solving mindset to everything I touch.",
  footer: "— Coding with purpose, learning with passion, growing with every challenge.",
  location: "Ahmedabad, IN",
  status: "Open to roles",
  duration: "CS · 2024–27"
};

const defaultStarring = "Starring Darsh Tank — a Computer Science student at Nirma University with a habit of turning problems into shippable apps. Built with Java · Spring Boot · Next.js · Django, currently obsessed with making AI a useful collaborator, not a gimmick.";

function useTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const update = () =>
      setT(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kolkata",
          hour12: false,
        }) + " IST",
      );
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);
  return t;
}

function useReveal() {
  useEffect(() => {
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-stagger]"),
    );

    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}

/* Opening countdown — academy leader 3 · 2 · 1 */
function OpeningLeader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n <= 0) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x - 1), 850);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black grain px-4 text-center">
      <div className="absolute inset-0 scan opacity-50" />
      <div className="absolute inset-0 vignette" />
      <div className="relative flex flex-col items-center">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-ember sm:tracking-[0.4em]">
          ✦ A Darsh Tank Picture ✦
        </p>
        {n > 0 ? (
          <div className="relative">
            <div className="absolute inset-0 -m-6 rounded-full border border-ember/50 countdown sm:-m-12" />
            <div className="absolute inset-0 -m-14 rounded-full border border-ember/20 sm:-m-24" />
            <div className="font-display countdown text-[clamp(8rem,38vw,14rem)] leading-none text-ember">
              {n}
            </div>
          </div>
        ) : (
          <p className="font-display iris-in text-5xl italic text-foreground sm:text-6xl">
            presents
          </p>
        )}
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40 sm:tracking-[0.5em]">
          REEL 01 · 24 FPS · {n > 0 ? `0${n}` : "00"}:00
        </p>
      </div>
    </div>
  );
}

/* Reusable Slate (clapperboard) for act titles */
function Slate({ act, title, scene }: { act: string; title: string; scene: string }) {
  return (
    <div className="inline-flex items-center gap-3 border border-rule bg-black/40 backdrop-blur px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/80">
      <Film className="h-3 w-3 text-ember" />
      <span>{act}</span>
      <span className="text-ember">·</span>
      <span>{title}</span>
      <span className="text-foreground/40">·</span>
      <span>SC. {scene}</span>
    </div>
  );
}

/* Elapsed on-page runtime, shown on the ticket stub */
function useElapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/* Synthetic projector "click" — no audio file needed */
function useProjectorClick() {
  const ctxRef = useRef<AudioContext | null>(null);
  return () => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      /* audio unsupported — fail silently */
    }
  };
}

/* Director's Commentary annotation — only visible when toggled on */
function Commentary({ active, children }: { active: boolean; children: ReactNode }) {
  if (!active) return null;
  return (
    <div className="mt-4 max-w-md border border-ember/40 bg-black/70 px-4 py-3 font-mono text-xs leading-relaxed text-ember/90 backdrop-blur">
      <span className="mr-2">🎙</span>
      {children}
    </div>
  );
}

const staticExperiences = [
  {
    co: "STP Web Hosting",
    role: "Intern — Software Developer",
    stack: "Python · Frappe · Node.js · MySQL · HTML · CSS",
    when: "May 2026 — Jun 2026",
    where: "Rajkot, India",
    points: [
      "Contributed to AltiShift, a cross-cloud migration platform supporting VM transfers across GCP, AWS, DigitalOcean, Virtuozzo, and CloudStack.",
      "Built an automated migration pipeline that transfers a client's VM to the destination cloud using only source and destination API, access, and secret keys.",
      "Ensured migrated VMs replicate the source environment's configuration and runtime state with zero manual intervention.",
    ],
  },
  {
    co: "InfiniteAI",
    role: "Intern - Web Development",
    stack: "Frontend: HTML, CSS, JS · Backend: PHP",
    when: "Dec 2023 — Jan 2024",
    where: "Rajkot, India",
    points: [
      "Built a full-stack job platform with seamless client and admin dashboards.",
      "Integrated OTP email verification, reducing fake registrations by 35%.",
      "Improved website performance by 25% through optimization and debugging.",
    ],
  },
  {
    co: "Technosoft",
    role: "Intern - Web Development",
    stack: "HTML · CSS · PHP",
    when: "Apr 2022 — Jun 2022",
    where: "Rajkot, India",
    points: [
      "Optimized website data management, reducing redundant data by 20%.",
      "Contributed to backend (PHP) enhancements, boosting admin efficiency.",
      "Uploaded and structured product data for the company's home decor catalogue.",
    ],
  },
];

export default function Index() {
  const time = useTime();
  const elapsed = useElapsed();
  const playClick = useProjectorClick();
  const [intro, setIntro] = useState(true);
  const [commentary, setCommentary] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [ageClicks, setAgeClicks] = useState(0);
  const [filmAge, setFilmAge] = useState(0);
  useReveal();

  const [dynamicProjects, setDynamicProjects] = useState<any[]>(projects);
  const [dynamicExperiences, setDynamicExperiences] = useState<any[]>(staticExperiences);
  const [dynamicSocials, setDynamicSocials] = useState({
    email: EMAIL,
    phone: PHONE,
    github: GITHUB,
    linkedin: LINKEDIN,
  });
  const [resumeUrl, setResumeUrl] = useState<string>("");

  const [dynamicCredits, setDynamicCredits] = useState<any[]>(defaultCredits);
  const [dynamicSkills, setDynamicSkills] = useState<any>(defaultSkills);
  const [dynamicBackstory, setDynamicBackstory] = useState<any>(defaultBackstory);
  const [dynamicStarring, setDynamicStarring] = useState<string>(defaultStarring);

  // Contact Form State
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error" | "smtp_missing">("idle");
  const [contactError, setContactError] = useState("");

  // Clapperboard Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [snapHinge, setSnapHinge] = useState(false);
  const [linkedinStatus, setLinkedinStatus] = useState("");
  const [linkedinConnected, setLinkedinConnected] = useState(false);

  // Placement Tips State
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [tipsEmail, setTipsEmail] = useState("");
  const [tipsMessage, setTipsMessage] = useState("");
  const [tipsSubmitting, setTipsSubmitting] = useState(false);
  const [tipsError, setTipsError] = useState("");
  const [snapTipsHinge, setSnapTipsHinge] = useState(false);
  const [tipsLinkedinStatus, setTipsLinkedinStatus] = useState("");
  const [tipsIsProfessional, setTipsIsProfessional] = useState(false);
  const [tipsCompanyName, setTipsCompanyName] = useState("");
  const [tipsFullName, setTipsFullName] = useState("");
  const [tipsContactNumber, setTipsContactNumber] = useState("");

  // Cinematic Alert State
  const [cinematicAlert, setCinematicAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const stingerRef = useRef<HTMLDivElement>(null);
  const paperTrailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConfigured) return;

    const fetchData = async () => {
      try {
        const projSnap = await getDocs(collection(db, "projects"));
        if (!projSnap.empty) {
          const projs = projSnap.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((p: any) => p.visible !== false) as any[];
          projs.sort((a, b) => {
            const orderA = a.order !== undefined ? Number(a.order) : parseInt(a.no) || 99;
            const orderB = b.order !== undefined ? Number(b.order) : parseInt(b.no) || 99;
            return orderA - orderB;
          });
          setDynamicProjects(projs);
        }

        const expSnap = await getDocs(collection(db, "experiences"));
        if (!expSnap.empty) {
          const exps = expSnap.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((e: any) => e.visible !== false) as any[];
          exps.sort((a, b) => (a.order !== undefined ? Number(a.order) : 0) - (b.order !== undefined ? Number(b.order) : 0));
          setDynamicExperiences(exps);
        }

        const socSnap = await getDoc(doc(db, "globals", "socials"));
        if (socSnap.exists()) {
          const data = socSnap.data();
          setDynamicSocials({
            email: data.email || EMAIL,
            phone: data.phone || PHONE,
            github: data.github || GITHUB,
            linkedin: data.linkedin || LINKEDIN,
          });
          setResumeUrl(data.resumeUrl || "");
        }

        const credSnap = await getDoc(doc(db, "globals", "credits"));
        if (credSnap.exists()) {
          setDynamicCredits(credSnap.data().credits || defaultCredits);
        }

        const skillSnap = await getDoc(doc(db, "globals", "skills"));
        if (skillSnap.exists()) {
          const { id, ...skillsData } = skillSnap.data();
          setDynamicSkills(skillsData || defaultSkills);
        }

        const backSnap = await getDoc(doc(db, "globals", "backstory"));
        if (backSnap.exists()) {
          setDynamicBackstory(backSnap.data() || defaultBackstory);
        }

        const starSnap = await getDoc(doc(db, "globals", "starring"));
        if (starSnap.exists()) {
          setDynamicStarring(starSnap.data().text || defaultStarring);
        }
      } catch (err) {
        console.error("Error fetching Firestore data:", err);
      }
    };

    fetchData();
  }, []);

  // IP block check — runs immediately (during countdown) and polls every 15 seconds so blocked visitors are restricted within that minute
  useEffect(() => {
    let clientIp = "";

    const checkBlocked = async () => {
      try {
        if (!clientIp) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              clientIp = data.ip || "";
            }
          } catch {
            // Can't determine IP — allow through
            return;
          }
        }

        if (!clientIp) return;

        const res = await fetch(`/api/check-blocked?ip=${encodeURIComponent(clientIp)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.blocked === true) {
            window.location.href = "/blocked";
          }
        }
      } catch {
        // Fail-open: if the check fails, allow the visitor through
      }
    };

    if (typeof window !== "undefined") {
      setLinkedinConnected(sessionStorage.getItem("linkedinConnected") === "true");
    }

    checkBlocked();

    const interval = setInterval(checkBlocked, 15000);
    return () => clearInterval(interval);
  }, []);

  // Clapperboard trigger on scrolling to stinger
  useEffect(() => {
    if (intro) return;
    
    // Check if feedback already dismissed or submitted in this session
    const feedbackDismissed = sessionStorage.getItem("feedbackDismissed");
    if (feedbackDismissed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          const tipsSubmitted = sessionStorage.getItem("tipsSubmitted");
          if (tipsSubmitted !== "true") {
            setShowFeedbackModal(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Trigger even when just 10% of stinger is visible
    );

    if (stingerRef.current) {
      observer.observe(stingerRef.current);
    }

  }, [intro]);

  // Clapperboard trigger on scrolling to paper trail
  useEffect(() => {
    if (intro) return;

    const tipsDismissed = sessionStorage.getItem("tipsDismissed");
    if (tipsDismissed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShowTipsModal(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (paperTrailRef.current) {
      observer.observe(paperTrailRef.current);
    }

    return () => observer.disconnect();
  }, [intro]);

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    sessionStorage.setItem("feedbackDismissed", "true");
  };

  const handleLinkedInConnect = () => {
    const inviteNote = "Hi Darsh, I saw your portfolio at darshtank.in. Let's connect!";
    navigator.clipboard.writeText(inviteNote).then(
      () => {
        setLinkedinStatus("Note copied! Opening LinkedIn...");
        sessionStorage.setItem("linkedinConnected", "true");
        setLinkedinConnected(true);
        setTimeout(() => {
          setLinkedinStatus("");
          window.open(dynamicSocials.linkedin, "_blank");
        }, 1200);
      },
      (err) => {
        console.error("Failed to copy text: ", err);
        sessionStorage.setItem("linkedinConnected", "true");
        setLinkedinConnected(true);
        window.open(dynamicSocials.linkedin, "_blank");
      }
    );
  };

  const handleCloseTipsModal = () => {
    setShowTipsModal(false);
    sessionStorage.setItem("tipsDismissed", "true");
    setTipsIsProfessional(false);
    setTipsCompanyName("");
    setTipsFullName("");
    setTipsContactNumber("");
  };

  const handleTipsLinkedInConnect = () => {
    const inviteNote = "Hi Darsh, saw your portfolio (darshtank.in). Let's connect!";
    navigator.clipboard.writeText(inviteNote).then(
      () => {
        setTipsLinkedinStatus("Note copied! Opening LinkedIn...");
        sessionStorage.setItem("linkedinConnected", "true");
        setLinkedinConnected(true);
        setTimeout(() => {
          setTipsLinkedinStatus("");
          window.open(dynamicSocials.linkedin, "_blank");
        }, 1200);
      },
      (err) => {
        console.error("Failed to copy text: ", err);
        sessionStorage.setItem("linkedinConnected", "true");
        setLinkedinConnected(true);
        window.open(dynamicSocials.linkedin, "_blank");
      }
    );
  };

  const handleTipsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipsEmail || !tipsMessage) {
      setTipsError("Please fill out all fields.");
      return;
    }
    if (tipsIsProfessional && (!tipsCompanyName.trim() || !tipsFullName.trim() || !tipsContactNumber.trim())) {
      setTipsError("Please enter your Company Name, Full Name, and Contact Number.");
      return;
    }
    setTipsError("");
    setTipsSubmitting(true);

    // Trigger physical clapper hinge snap!
    setSnapTipsHinge(true);

    // Wait 350ms for clapper animation to click down
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      // 1. Save to Firestore tips collection
      if (isConfigured) {
        await addDoc(collection(db, "tips"), {
          email: tipsEmail,
          message: tipsMessage,
          isProfessional: tipsIsProfessional,
          companyName: tipsIsProfessional ? tipsCompanyName : "",
          fullName: tipsIsProfessional ? tipsFullName : "",
          contactNumber: tipsIsProfessional ? tipsContactNumber : "",
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Dispatch email notification via contact API route
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tipsEmail,
          subject: tipsIsProfessional 
            ? `Placement Tip from ${tipsFullName} (${tipsCompanyName})`
            : `Placement & Prep Tips from ${tipsEmail}`,
          message: tipsMessage,
          isTip: true,
          fullName: tipsIsProfessional ? tipsFullName : "",
          companyName: tipsIsProfessional ? tipsCompanyName : "",
          contactNumber: tipsIsProfessional ? tipsContactNumber : "",
        }),
      });

      sessionStorage.setItem("tipsDismissed", "true");
      sessionStorage.setItem("tipsSubmitted", "true");
      setShowTipsModal(false);
      setTipsEmail("");
      setTipsMessage("");
      setTipsIsProfessional(false);
      setTipsCompanyName("");
      setTipsFullName("");
      setTipsContactNumber("");
      setCinematicAlert({
        isOpen: true,
        title: "DISPATCH SUCCESSFUL",
        message: "Placement tips submitted successfully! Thank you, Darsh appreciates your advice.",
      });
    } catch (err: any) {
      console.error(err);
      setTipsError("Failed to submit tips. Please try again.");
      setSnapTipsHinge(false); // Reset hinge so they can retry
    } finally {
      setTipsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackEmail || !feedbackMessage || feedbackRating === 0) {
      setFeedbackError(feedbackRating === 0 ? "Please select a rating." : "Please fill out all fields.");
      return;
    }
    setFeedbackError("");
    setFeedbackSubmitting(true);

    // Trigger physical clapper hinge snap!
    setSnapHinge(true);

    // Wait 350ms for clapper animation to click down
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      // 1. Save to Firestore feedback collection
      if (isConfigured) {
        await addDoc(collection(db, "feedback"), {
          name: feedbackName,
          email: feedbackEmail,
          rating: feedbackRating,
          message: feedbackMessage,
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Dispatch email notification via contact API route
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: feedbackEmail,
          subject: `Review by ${feedbackName}`,
          message: feedbackMessage,
          rating: feedbackRating,
        }),
      });

      sessionStorage.setItem("feedbackDismissed", "true");
      setShowFeedbackModal(false);
      setFeedbackName("");
      setFeedbackEmail("");
      setFeedbackRating(0);
      setFeedbackMessage("");
      setCinematicAlert({
        isOpen: true,
        title: "CRITIQUE RECEIVED",
        message: "Critique submitted successfully! Thank you for helping improve the show.",
      });
    } catch (err: any) {
      console.error(err);
      setFeedbackError("Failed to dispatch review. Please try again.");
      setSnapHinge(false); // Reset clapper so they can try again
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Visitor tracking — fires once per browser session after countdown is complete (Req 1.1–1.6, 10.1, 10.4)
  useEffect(() => {
    if (intro) return;

    const fire = async () => {
      try {
        let sessionId = "";
        try {
          sessionId = sessionStorage.getItem("vsid") || "";
          if (!sessionId) {
            if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
              sessionId = crypto.randomUUID();
            } else {
              sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            }
            sessionStorage.setItem("vsid", sessionId);
          }
        } catch {
          sessionId = "fallback-" + Math.random().toString(36).substring(2);
        }

        // Try to fetch public IP so localhost dev shows actual location
        let clientIp = "";
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            clientIp = data.ip || "";
            try {
              sessionStorage.setItem("dt_client_ip", clientIp);
            } catch {
              // ignore
            }
          }
        } catch {
          // silent fallback
        }

        await fetch("/api/track-visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
            clientIp,
          }),
        });
      } catch {
        // silent — must not affect portfolio render
      }
    };
    fire();
  }, [intro]);

  // Exit tracking — fires when the visitor leaves the page
  useEffect(() => {
    if (intro) return;

    const handleExit = () => {
      try {
        const sessionId = sessionStorage.getItem("vsid") || "";
        if (!sessionId) return;
        const clientIp = sessionStorage.getItem("dt_client_ip") || "";

        const payload = JSON.stringify({ sessionId, clientIp });

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/track-exit", blob);
        } else {
          fetch("/api/track-exit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // silent
      }
    };

    window.addEventListener("pagehide", handleExit, { capture: true });
    window.addEventListener("beforeunload", handleExit, { capture: true });

    return () => {
      window.removeEventListener("pagehide", handleExit, { capture: true });
      window.removeEventListener("beforeunload", handleExit, { capture: true });
    };
  }, [intro]);

  // Resume click tracking — fires when the visitor clicks or downloads the resume
  const trackResumeClick = async () => {
    try {
      const sessionId = sessionStorage.getItem("vsid") || "";
      const clientIp = sessionStorage.getItem("dt_client_ip") || "";

      await fetch("/api/track-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, clientIp }),
      });
    } catch {
      // silent
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactSubject || !contactMessage) return;

    setContactStatus("sending");
    setContactError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage,
        }),
      });

      const data = await res.json();

      if (res.status === 501 || (data && data.error === "SMTP_NOT_CONFIGURED")) {
        setContactStatus("smtp_missing");
        setContactError(data.message || "Mail server not configured.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setContactStatus("success");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    } catch (err: any) {
      console.error(err);
      setContactStatus("error");
      setContactError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen text-foreground letterbox">
      {intro && <OpeningLeader onDone={() => setIntro(false)} />}

      {/* Persistent grain over the whole film */}
      <div
        className="grain pointer-events-none fixed inset-0 z-[55]"
        style={{ opacity: 0.4 + (filmAge / 100) * 0.6 }}
      />

      {/* Ticket stub — session runtime */}
      {!intro && (
        <div className="fixed bottom-4 left-4 z-40 hidden items-center gap-2 border border-rule bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60 backdrop-blur sm:flex">
          <Film className="h-3 w-3 text-ember" />
          <span>Runtime</span>
          <span className="text-ember">{elapsed}</span>
        </div>
      )}

      {/* TOP HUD — projection booth */}
      <header className="fixed left-0 right-0 top-9 z-50 sm:top-14">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] sm:px-10 md:px-16 sm:tracking-[0.3em]">
          <div
            className="flex min-h-8 cursor-default items-center gap-3 border border-rule bg-black/60 px-3 py-1.5 backdrop-blur"
            onClick={() => setAgeClicks((c) => c + 1)}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember animate-pulse" />
            <span>REC</span>
            <span className="text-foreground/50">·</span>
            <span>Darsh Tank</span>
          </div>
          {ageClicks >= 5 && (
            <div className="flex min-h-8 items-center gap-2 border border-ember/50 bg-black/60 px-3 py-1.5 backdrop-blur">
              <span className="text-ember">Age the film</span>
              <input
                type="range"
                min={0}
                max={100}
                value={filmAge}
                onChange={(e) => setFilmAge(Number(e.target.value))}
                className="accent-ember"
              />
            </div>
          )}
          <nav
            aria-label="Primary"
            className="flex min-h-8 max-w-full items-center gap-1 overflow-x-auto border border-rule bg-black/60 px-2 py-1.5 backdrop-blur md:px-3"
          >
            {[
              ["#act-i", "Act I"],
              ["#act-ii", "Act II"],
              ["#act-iii", "Act III"],
              ["#credits", "Credits"],
            ].map(([h, l]) => (
              <a
                key={h}
                href={h}
                onClick={() => soundOn && playClick()}
                className="whitespace-nowrap px-2 py-1 transition-colors hover:text-ember focus-visible:text-ember"
              >
                {l}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3 bg-black/50 backdrop-blur border border-rule px-3 py-1.5 text-foreground/60">
            <span>TC</span>
            <span className="text-ember">{time || "--:--:-- IST"}</span>
          </div>
        </div>
      </header>

      {/* ============== ACT I — OPENING SHOT ============== */}
      <section id="act-i" className="relative min-h-screen overflow-hidden vignette">
        {/* Projector beam */}
        <div className="beam" />
        <div className="flare" style={{ top: "12%", left: "8%" }} />
        <div className="flare" style={{ bottom: "18%", right: "10%", animationDelay: "2s" }} />

        <div className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-36 sm:px-10 md:px-16 md:pt-48">
          <div className="fade-up">
            <Slate act="ACT I" title="THE OPENING SHOT" scene="01" />
          </div>

          <div className="mt-10 grid grid-cols-12 gap-6" data-reveal="blur">
            <div className="col-span-12 md:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                Reel №01
                <br />
                Ahmedabad, IN
                <br />
                24 fps · Color
              </p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-ember reveal flicker">
                ✦ Now Showing ✦
              </p>
              <h1
                className="font-display iris-in mt-6 text-[clamp(4.1rem,16vw,11rem)] leading-[0.86] tracking-tight"
                style={{ textShadow: "0 0 80px oklch(0.72 0.18 55 / 0.25)" }}
              >
                Coding
                <br />
                with <em className="italic text-ember">purpose</em>,<br />
                <span className="text-foreground/50">building with</span>{" "}
                <span className="underline decoration-ember decoration-[6px] underline-offset-[18px]">
                  care
                </span>
                .
              </h1>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-12 gap-6 border-t border-rule pt-8 fade-up md:mt-16">
            <p className="col-span-12 text-base leading-relaxed text-foreground/85 md:col-span-6 md:col-start-3 md:text-lg">
              {dynamicStarring}
            </p>
            <div className="col-span-12 flex flex-wrap items-center gap-4 md:col-span-3">
              <a
                href={dynamicSocials.github}
                target="_blank"
                rel="noreferrer"
                className="link-slide inline-flex min-h-11 items-center gap-2 text-sm hover:text-ember"
              >
                On GitHub <ArrowUpRight className="icon-nudge h-4 w-4" />
              </a>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={trackResumeClick}
                  className="link-slide inline-flex min-h-11 items-center gap-2 text-sm hover:text-ember"
                >
                  Resume <ArrowUpRight className="icon-nudge h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <Commentary active={commentary}>
            This whole page is one big excuse to talk about myself in film terms. The countdown
            you saw on load is just chained `setTimeout` calls — no video file anywhere here.
          </Commentary>

          {/* Bottom HUD — film-strip ticker */}
          <div className="mt-24" />
        </div>

        <div className="ticker-track absolute bottom-0 left-0 right-0 border-y border-rule bg-black/70 py-3 backdrop-blur sm:py-4">
          <div className="ticker flex shrink-0 whitespace-nowrap font-display text-3xl italic text-foreground md:text-6xl">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex items-center">
                {[
                  "Full-Stack Developer",
                  "Spring Boot",
                  "Next.js",
                  "Frappe",
                  "Django",
                  "Java",
                  "AI Tinkerer",
                  "CS @ Nirma",
                ].map((w, i) => (
                  <span key={i} className="flex items-center">
                    <span className="px-8">{w}</span>
                    <span className="text-ember">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== ACT II — THE BODY OF WORK ============== */}
      <section id="act-ii" className="relative border-b border-rule overflow-hidden">
        <div className="flare" style={{ top: "20%", right: "5%", animationDelay: "1s" }} />
        <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:px-16 md:py-36">
          <div className="fade-up">
            <Slate act="ACT II" title="THE BODY OF WORK" scene="02" />
          </div>

          <div
            className="mt-10 flex flex-col gap-6 border-b border-foreground/30 pb-8 md:flex-row md:items-end md:justify-between"
            data-reveal
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/50">
                § The Filmography
              </p>
              <h2 className="font-display mt-3 text-[clamp(3.6rem,12vw,8rem)] leading-[0.9] tracking-tight">
                Selected <em className="italic text-ember">works</em>.
              </h2>
            </div>
            <a
              href={dynamicSocials.github}
              target="_blank"
              rel="noreferrer"
              className="link-slide inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-[0.2em] hover:text-ember"
            >
              Full archive <ArrowUpRight className="icon-nudge h-3 w-3" />
            </a>
          </div>

          <Commentary active={commentary}>
            AltiShift is the one I'm proudest of — it taught me that "works on my machine" means
            nothing once you're chrooting into someone else's CentOS box at 2am.
          </Commentary>

          <ul className="mt-4">
            {dynamicProjects.map((p, idx) => (
              <li
                key={p.no || p.id}
                className="card-lift group relative grid grid-cols-12 gap-6 border-b border-rule py-12 pl-8 pr-6 sm:px-10 sm:py-16 md:py-20 transition-colors hover:bg-black/30 cursor-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%200%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20fill%3D%22none%22%20stroke%3D%22%23e8793a%22%20stroke-width%3D%222%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%222%22%20fill%3D%22%23e8793a%22%2F%3E%3C%2Fsvg%3E')_12_12,pointer]"
                data-reveal="blur"
              >
                {/* film perforation strip */}
                <div className="absolute left-2 sm:left-3 top-0 bottom-0 w-3 flex flex-col justify-around">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span key={i} className="block h-1.5 w-1.5 rounded-sm bg-foreground/15" />
                  ))}
                </div>

                <div className="col-span-12 sm:col-span-2 md:col-span-1">
                  <span className="font-mono text-xs text-ember">{p.no}</span>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40 mt-2">
                    Reel
                    <br />0{idx + 1}
                  </p>
                </div>

                <div className="col-span-12 min-w-0 sm:col-span-10 md:col-span-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                    {p.runtime}
                  </p>
                  <h3 className="font-display mt-2 text-[clamp(3rem,12vw,4.5rem)] leading-none italic transition-colors group-hover:text-ember">
                    {p.name}
                  </h3>
                  <p className="mt-3 font-display text-xl italic text-foreground/70">
                    "{p.logline}"
                  </p>
                  <p className="mt-3 text-sm text-foreground/60">{p.role}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.stack?.map((s: string) => (
                      <span
                        key={s}
                        className="border border-rule px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-12 min-w-0 md:col-span-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-3">
                    Scene Breakdown
                  </p>
                  <ul className="space-y-3 text-sm leading-relaxed">
                    {p.bullets?.map((b: string, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-mono text-ember text-[10px] mt-1">
                          {String(i + 1).padStart(2, "0")}.
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-span-12 mt-4 flex items-start gap-3 md:col-span-1 md:mt-0 md:flex-col md:items-end">
                  {p.projectUrl && (
                    <a
                      href={p.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="link-slide inline-flex min-h-10 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] hover:text-ember"
                    >
                      Live <ArrowUpRight className="icon-nudge h-3 w-3" />
                    </a>
                  )}
                  <a
                    href={p.githubUrl || dynamicSocials.github}
                    target="_blank"
                    rel="noreferrer"
                    className="link-slide inline-flex min-h-10 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] hover:text-ember"
                  >
                    Source <ArrowUpRight className="icon-nudge h-3 w-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* INTERMISSION CARD */}
      <section className="relative border-b border-rule bg-black overflow-hidden">
        <div className="grain absolute inset-0 opacity-60" />
        <div className="absolute inset-0 vignette" />
        <div
          className="relative mx-auto max-w-[1400px] px-6 py-20 text-center sm:px-10 md:px-16 md:py-32"
          data-reveal="blur"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-ember">
            — Intermission —
          </p>
          <h2 className="font-display mt-6 text-[clamp(4.5rem,18vw,10rem)] leading-none italic text-foreground/90 flicker">
            Reel change.
          </h2>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40">
            Please remain seated. Act III begins shortly.
          </p>
        </div>
      </section>

      {/* ============== ACT III — BACKSTORY ============== */}
      <section id="act-iii" className="relative border-b border-rule">
        <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:px-16 md:py-36">
          <div className="fade-up">
            <Slate act="ACT III" title="THE BACKSTORY" scene="03" />
          </div>

          {/* About */}
          <div
            className="mt-12 grid grid-cols-12 gap-6 border-b border-rule pb-16 md:pb-20"
            data-reveal
          >
            <div className="col-span-12 md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                § Voiceover
              </p>
              <p className="mt-3 font-display text-4xl italic text-ember">
                A note,
                <br />
                from the desk.
              </p>
            </div>
            <div className="col-span-12 space-y-6 text-base leading-relaxed md:col-span-6 md:col-start-5 md:text-lg">
              <p className="font-display text-2xl leading-snug sm:text-3xl">
                <span className="text-7xl float-left mr-3 mt-1 leading-[0.7] text-ember">"</span>
                {dynamicBackstory.quote}
              </p>
              <p className="text-foreground/80">
                {dynamicBackstory.body}
              </p>
              <p className="font-mono text-sm text-foreground/50">
                {dynamicBackstory.footer}
              </p>
            </div>
            <div className="col-span-12 md:col-span-2 md:col-start-11">
              <ul className="space-y-3 font-mono text-xs">
                <li className="flex items-center gap-2 text-foreground/60">
                  <MapPin className="h-3 w-3" /> {dynamicBackstory.location}
                </li>
                <li className="flex items-center gap-2 text-foreground/60">
                  <span className="h-2 w-2 rounded-full bg-ember animate-pulse" /> {dynamicBackstory.status}
                </li>
                <li className="flex items-center gap-2 text-foreground/60">{dynamicBackstory.duration}</li>
              </ul>
            </div>
          </div>

          {/* Experience */}
          <div
            className="mt-16 grid grid-cols-12 gap-6 border-b border-rule pb-16 md:mt-20 md:pb-20"
            data-reveal
          >
            <div className="col-span-12 md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                § Location Shoots
              </p>
              <p className="mt-3 font-display text-5xl italic">In the wild.</p>
              <Commentary active={commentary}>
                Every one of these taught me something the classroom didn't — mostly that
                production bugs never show up in the demo.
              </Commentary>
            </div>
            <div className="col-span-12 space-y-12 md:col-span-9">
              {dynamicExperiences.map((e) => (
                <div
                  key={e.co || e.id}
                  className="grid grid-cols-12 gap-4 border-t border-rule pt-8 transition-colors hover:border-ember/50"
                >
                  <div className="col-span-12 md:col-span-4">
                    <h3 className="font-display text-3xl text-ember">{e.co}</h3>
                    <p className="mt-1 text-sm text-foreground/70">{e.role}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                      {e.when}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                      {e.where}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-8">
                    <p className="font-mono text-xs text-ember">{e.stack}</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {e.points?.map((pt: string, i: number) => (
                        <li key={i} className="flex gap-3">
                          <span className="font-mono text-foreground/50">0{i + 1}</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mt-16 grid grid-cols-12 gap-6 md:mt-20" data-reveal>
            <div className="col-span-12 md:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                § Film School
              </p>
              <p className="mt-3 font-display text-5xl italic">The paper trail.</p>
            </div>
            <div className="col-span-12 md:col-span-9 grid gap-6 md:grid-cols-2">
              {[
                {
                  school: "Nirma University",
                  deg: "B.Tech, Computer Science & Engineering",
                  when: "Aug 2024 — May 2027",
                  where: "Ahmedabad, India",
                },
                {
                  school: "Atmiya University",
                  deg: "Diploma in Computer Engineering",
                  when: "Sep 2021 — May 2024",
                  where: "Rajkot, India",
                },
              ].map((s) => (
                <div
                  key={s.school}
                  className="card-lift relative overflow-hidden border border-rule bg-card p-6 transition-colors hover:border-ember sm:p-8"
                >
                  <div className="absolute top-3 right-3 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/30">
                    CERT
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                    {s.when}
                  </p>
                  <h3 className="font-display mt-3 text-3xl">{s.school}</h3>
                  <p className="mt-2 text-sm text-foreground/80">{s.deg}</p>
                  <p className="mt-1 text-sm text-foreground/50">{s.where}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STACK — equipment list */}
      <section
        ref={paperTrailRef}
        id="stack"
        className="relative border-b border-rule bg-foreground text-paper overflow-hidden"
      >
        <div className="absolute inset-0 grain opacity-40" />
        <div className="relative mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:px-16 md:py-36" data-reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60">
            § Equipment List
          </p>
          <h2 className="font-display mt-3 text-[clamp(3.6rem,12vw,8rem)] leading-[0.9] tracking-tight">
            Tools of the <em className="italic text-ember">trade</em>.
          </h2>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-paper/50">
            Every shot needs the right lens.
          </p>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 md:mt-16 md:grid-cols-4" data-stagger>
            {Object.entries(dynamicSkills).map(([cat, items]) => (
              <div key={cat}>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60 border-b border-paper/20 pb-2">
                  {cat}
                </p>
                <ul className="mt-5 space-y-2">
                  {(Array.isArray(items) ? items : []).map((it) => (
                    <li
                      key={it}
                      className="font-display cursor-default text-2xl leading-tight transition-all duration-300 hover:translate-x-1 hover:text-ember"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT — final scene */}
      <section id="contact" className="relative overflow-hidden vignette">
        <div className="flare" style={{ top: "10%", right: "20%" }} />
        <div className="flare" style={{ bottom: "20%", left: "15%", animationDelay: "3s" }} />
        <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10 md:px-16 md:py-44" data-reveal="blur">
          <Slate act="EPILOGUE" title="THE FINAL SCENE" scene="FIN" />
          <h2
            className="font-display iris-in mt-8 text-[clamp(4.2rem,16vw,13rem)] leading-[0.85] tracking-tight"
            style={{ textShadow: "0 0 80px oklch(0.72 0.18 55 / 0.3)" }}
          >
            Let's <em className="italic text-ember">build</em>
            <br />
            something.
          </h2>

          <div className="mt-16 grid grid-cols-12 gap-8 border-t border-rule pt-10">
            <div className="col-span-12 md:col-span-6 space-y-6">
              <p className="text-lg leading-relaxed text-foreground/85">
                Open to internships, collaborations, and conversations about interesting problems.
                Fill out the form below or reach out directly.
              </p>
              
              <form onSubmit={handleContactSubmit} className="space-y-4 font-mono text-sm">
                <div>
                  <label htmlFor="contact-email" className="block text-[10px] uppercase tracking-wider text-foreground/60 mb-2">
                    Sender Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full bg-black/40 border border-rule px-4 py-3 text-foreground placeholder-foreground/30 focus:outline-none focus:border-ember transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-[10px] uppercase tracking-wider text-foreground/60 mb-2">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Internship / Collaboration / Hello"
                    className="w-full bg-black/40 border border-rule px-4 py-3 text-foreground placeholder-foreground/30 focus:outline-none focus:border-ember transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-[10px] uppercase tracking-wider text-foreground/60 mb-2">
                    Description / Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your project, role, or proposal in detail..."
                    className="w-full bg-black/40 border border-rule px-4 py-3 text-foreground placeholder-foreground/30 focus:outline-none focus:border-ember transition-colors resize-none"
                  />
                </div>

                {contactStatus === "success" && (
                  <div className="text-emerald-500 text-xs">
                    ✓ Your message has been sent successfully!
                  </div>
                )}

                {contactStatus === "smtp_missing" && (
                  <div className="text-ember text-xs space-y-2">
                    <p>⚠ Email server is not configured in .env.</p>
                    <a
                      href={`mailto:${dynamicSocials.email}?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(contactMessage)}`}
                      className="inline-flex items-center gap-1 border-b border-ember text-ember font-bold hover:text-foreground hover:border-foreground transition-colors"
                    >
                      Send via your email application <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {contactStatus === "error" && (
                  <div className="text-red-500 text-xs">
                    ✗ {contactError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={contactStatus === "sending"}
                  className="btn-press inline-flex min-h-11 items-center gap-2 bg-ember px-5 py-3 text-xs font-semibold text-black uppercase tracking-wider transition-colors hover:bg-foreground hover:text-black disabled:opacity-50 cursor-pointer"
                >
                  {contactStatus === "sending" ? "Sending Reel..." : "✦ Submit Scene"}
                </button>
              </form>
            </div>

            <div className="col-span-12 md:col-span-5 md:col-start-8 space-y-6">
              <div className="hidden md:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60 border-b border-paper/20 pb-2 mb-4">
                  Direct Line
                </p>
                <a
                  href={`mailto:${dynamicSocials.email}`}
                  className="inline-flex max-w-full items-center gap-3 break-all border-b-2 border-foreground pb-2 font-display text-[clamp(1.5rem,3.5vw,2.2rem)] italic transition-colors hover:border-ember hover:text-ember"
                >
                  {dynamicSocials.email} <ArrowUpRight className="icon-nudge h-5 w-5 shrink-0" />
                </a>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60 border-b border-paper/20 pb-2">
                  Social Channels
                </p>
                {[
                  ...(resumeUrl ? [{ Icon: FileDown, label: "Resume", href: resumeUrl, onClick: trackResumeClick }] : []),
                  { Icon: Mail, label: "Email", href: `mailto:${dynamicSocials.email}` },
                  { Icon: Phone, label: dynamicSocials.phone, href: `tel:${dynamicSocials.phone.replace(/\s/g, "")}` },
                  { Icon: Github, label: "GitHub — more projects", href: dynamicSocials.github },
                  { Icon: Linkedin, label: "LinkedIn", href: dynamicSocials.linkedin },
                ].map(({ Icon, label, href, onClick }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") || href.startsWith("/") ? "_blank" : undefined}
                    rel="noreferrer"
                    onClick={onClick}
                    className="group flex min-h-12 items-center justify-between gap-4 border-b border-rule py-3 transition-colors hover:text-ember"
                  >
                    <span className="flex min-w-0 items-center gap-3 break-all">
                      <Icon className="h-4 w-4 shrink-0" /> {label}
                    </span>
                    <ArrowUpRight className="icon-nudge h-4 w-4 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* END CREDITS */}
      <section id="credits" className="relative bg-black overflow-hidden border-t border-rule">
        <div className="grain absolute inset-0 opacity-60" />
        <div
          className="relative mx-auto max-w-[1400px] px-6 py-20 text-center sm:px-10 md:px-16 md:py-24"
          data-reveal
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-ember mb-10">
            — End Credits —
          </p>

          <div className="space-y-8 font-display text-foreground/85" data-stagger>
            {dynamicCredits.map((item) => {
              const role = Array.isArray(item) ? item[0] : item.role;
              const name = Array.isArray(item) ? item[1] : item.name;
              return (
                <div key={role}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/40">
                    {role}
                  </p>
                  <p className="mt-2 text-xl italic sm:text-2xl md:text-4xl">{name}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-20 border-t border-rule pt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50 flex flex-col gap-3 md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} Darsh Tank</p>
            <p>Vol. 01 · Set in Fraunces & Inter Tight</p>
            <p className="text-ember">{time}</p>
          </div>
          <p className="mt-12 font-display text-[clamp(4.5rem,18vw,7rem)] italic text-ember flicker">
            ~ Darsh Tank
          </p>
        </div>
      </section>

      {/* POST-CREDITS STINGER */}
      <section ref={stingerRef} className="relative bg-black py-16 text-center">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16" data-reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/30">
            (stay seated — one more scene)
          </p>
          <p className="mt-4 font-display text-2xl italic text-foreground/60 sm:text-3xl">
            If you scrolled this far, you clearly read credits in real movies too.{" "}
            <a
              href={dynamicSocials.github}
              target="_blank"
              rel="noreferrer"
              className="text-ember hover:underline"
            >
              Here's the source code
            </a>
            .
          </p>
        </div>
      </section>

      {/* CLAPPERBOARD RATING MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[80] overflow-y-auto cinematic-scroll bg-black/85 backdrop-blur-sm p-4 animate-fade-in font-mono text-xs flex justify-center items-start">
          <div className="relative flex flex-col items-center select-none pt-14 pb-8 my-auto">
            {/* Close button */}
            <button 
              onClick={handleCloseFeedbackModal}
              className="absolute top-16 right-0 bg-[#0c0c0c] border border-rule w-7 h-7 flex items-center justify-center text-foreground/50 hover:text-ember rounded-full transition-colors z-20 text-sm cursor-pointer"
              aria-label="Close review form"
            >
              ✕
            </button>
              
              {/* The Clapper Hinge (Top Bar) */}
              <div 
                className="w-[280px] sm:w-[320px] h-[24px] rounded-t-sm"
                style={{
                  background: "repeating-linear-gradient(-45deg, #0c0c0c, #0c0c0c 10px, #ff7b00 10px, #ff7b00 20px)",
                  transformOrigin: "bottom left",
                  transform: snapHinge ? "rotate(0deg)" : "rotate(-12deg)",
                  transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
                  marginBottom: "4px"
                }}
              />

              {/* The Clapper Board (Base) */}
              <div className="w-[280px] sm:w-[320px] bg-[#0c0c0c] border border-rule rounded shadow-lg overflow-hidden">
                {/* Top border of slate base (matching repeating stripes) */}
                <div 
                  className="w-full h-[16px] border-b border-rule"
                  style={{
                    background: "repeating-linear-gradient(-45deg, #0c0c0c, #0c0c0c 10px, #ff7b00 10px, #ff7b00 20px)"
                  }}
                />

                {/* Slate Content Fields */}
                <div className="p-4 space-y-4">
                  
                  {/* Header Readout info */}
                  <div className="grid grid-cols-2 border-b border-rule pb-2 gap-2 text-[10px] text-foreground/50">
                    <div>
                      <span className="text-ember">PROD:</span> thedarshtank
                    </div>
                    <div className="text-right">
                      <span className="text-ember">ROLL:</span> IT-DEV
                    </div>
                    <div>
                      <span className="text-ember">SCENE:</span> 1.0 (Review)
                    </div>
                    <div className="text-right">
                      <span className="text-ember">DATE:</span> {new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </div>
                  </div>

                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      {/* Reviewer Name */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-foreground/40 block">Full Name</label>
                        <input
                          type="text"
                          required
                          value={feedbackName}
                          onChange={(e) => setFeedbackName(e.target.value)}
                          placeholder="e.g. Lead Developer / Reviewer"
                          className="w-full bg-[#111] border border-rule focus:border-ember outline-none px-2 py-1.5 rounded text-[11px] text-foreground font-mono"
                        />
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-foreground/40 block">Email Address</label>
                        <input
                          type="email"
                          required
                          value={feedbackEmail}
                          onChange={(e) => setFeedbackEmail(e.target.value)}
                          placeholder="reviewer@company.com"
                          className="w-full bg-[#111] border border-rule focus:border-ember outline-none px-2 py-1.5 rounded text-[11px] text-foreground font-mono"
                        />
                      </div>

                      {/* Rating Star Selection */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-foreground/40 block">Code Quality & Design Rating</label>
                        <div className="flex items-center gap-1.5 py-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className={`text-base transition-all ${
                                star <= feedbackRating 
                                  ? "text-ember drop-shadow-[0_0_8px_rgba(255,123,0,0.5)] scale-110" 
                                  : "text-foreground/20 hover:text-foreground/40"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                          <span className="text-[9px] text-foreground/50 ml-2 font-mono">
                            {feedbackRating > 0 ? `(${feedbackRating}/5)` : "(Required)"}
                          </span>
                        </div>
                      </div>

                      {/* Critique / Comments logline */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-foreground/40 block">Critique & Suggestions</label>
                        <textarea
                          required
                          rows={3}
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          placeholder="Bug reports, technical reviews, or suggestions..."
                          className="w-full bg-[#111] border border-rule focus:border-ember outline-none px-2 py-1.5 rounded text-[11px] text-foreground resize-none font-mono"
                        />
                      </div>

                      {feedbackError && (
                        <p className="text-red-500 text-[10px] text-center font-mono">{feedbackError}</p>
                      )}

                      {/* Submit clapper trigger */}
                      <button
                        type="submit"
                        disabled={feedbackSubmitting}
                        className="w-full py-2 bg-ember text-black hover:bg-[#ff8f22] font-mono text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        🎬 {feedbackSubmitting ? "Snapping..." : "SNAP & DISPATCH REVIEW"}
                      </button>

                      {!linkedinConnected && (
                        <button
                          type="button"
                          onClick={handleLinkedInConnect}
                          className="w-full py-2 bg-[#0077b5] text-white hover:bg-[#006297] font-mono text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded mt-2 cursor-pointer shadow-[0_2px_10px_rgba(0,119,181,0.25)]"
                        >
                          💼 Connect on LinkedIn
                        </button>
                      )}

                      {linkedinStatus && (
                        <p className="text-amber-500 text-[10px] text-center font-mono mt-2 animate-pulse">
                          &gt; {linkedinStatus}
                        </p>
                      )}
                    </form>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* PLACEMENT TIPS MODAL */}
      {showTipsModal && (
        <div className="fixed inset-0 z-[80] overflow-y-auto cinematic-scroll bg-black/85 backdrop-blur-sm p-4 animate-fade-in font-mono text-xs flex justify-center items-start">
          <div className="relative flex flex-col items-center select-none pt-14 pb-8 my-auto">
            {/* Close button */}
            <button 
              onClick={handleCloseTipsModal}
              className="absolute top-16 right-0 bg-[#0c0c0c] border border-rule w-7 h-7 flex items-center justify-center text-foreground/50 hover:text-ember rounded-full transition-colors z-20 text-sm cursor-pointer"
              aria-label="Close tips form"
            >
              ✕
            </button>
              
              {/* The Clapper Hinge (Top Bar) */}
              <div 
                className="w-[280px] sm:w-[320px] h-[24px] rounded-t-sm"
                style={{
                  background: "repeating-linear-gradient(-45deg, #0c0c0c, #0c0c0c 10px, #ff7b00 10px, #ff7b00 20px)",
                  transformOrigin: "bottom left",
                  transform: snapTipsHinge ? "rotate(0deg)" : "rotate(-12deg)",
                  transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
                  marginBottom: "4px"
                }}
              />

              {/* The Clapper Board (Base) */}
              <div className="w-[280px] sm:w-[320px] bg-[#0c0c0c] border border-rule rounded shadow-lg overflow-hidden">
                {/* Top border of slate base (matching repeating stripes) */}
                <div 
                  className="w-full h-[16px] border-b border-rule"
                  style={{
                    background: "repeating-linear-gradient(-45deg, #0c0c0c, #0c0c0c 10px, #ff7b00 10px, #ff7b00 20px)"
                  }}
                />

                {/* Slate Content Fields */}
                <div className="p-4 space-y-4">
                  
                  {/* Header Readout info */}
                  <div className="grid grid-cols-2 border-b border-rule pb-2 gap-2 text-[10px] text-foreground/50">
                    <div>
                      <span className="text-ember">PROD:</span> Darsh Tank
                    </div>
                    <div className="text-right">
                      <span className="text-ember">ROLE:</span> Student / Dev
                    </div>
                    <div>
                      <span className="text-ember">SCENE:</span> Placement Prep
                    </div>
                    <div className="text-right">
                      <span className="text-ember">DATE:</span> {new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="text-[10px] text-foreground/70 leading-relaxed border-b border-rule/35 pb-2 font-mono">
                    <p className="text-left border-l border-ember pl-2">
                      Hi, I'm Darsh Tank! I'm preparing for my college placements & developer interviews. Share your best tips/resources, and let's connect on LinkedIn!
                    </p>
                  </div>

                  <form onSubmit={handleTipsSubmit} className="space-y-3">
                    {/* Email Address */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-foreground/40 block">Email Address</label>
                      <input
                        type="email"
                        required
                        value={tipsEmail}
                        onChange={(e) => setTipsEmail(e.target.value)}
                        placeholder="reviewer@company.com"
                        className="w-full bg-[#111] border border-rule focus:border-ember outline-none px-2 py-1.5 rounded text-[11px] text-foreground font-mono"
                      />
                    </div>

                    {/* Professional Toggle */}
                    <div className="flex items-center gap-2 py-1 select-none">
                      <input
                        type="checkbox"
                        id="tipsIsProfessional"
                        checked={tipsIsProfessional}
                        onChange={(e) => {
                          setTipsIsProfessional(e.target.checked);
                          if (!e.target.checked) {
                            setTipsCompanyName("");
                            setTipsFullName("");
                            setTipsContactNumber("");
                          }
                        }}
                        className="rounded border-rule bg-black text-ember focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 cursor-pointer accent-[#ff7b00]"
                      />
                      <label htmlFor="tipsIsProfessional" className="text-[9px] uppercase text-foreground/60 cursor-pointer font-mono font-semibold">
                        I am a company professional
                      </label>
                    </div>

                    {/* Company Details (only shown if isProfessional is true) */}
                    {tipsIsProfessional && (
                      <div className="space-y-3 animate-fade-in border-l-2 border-ember/30 pl-2 py-1 my-1">
                        {/* Full Name */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-foreground/40 block">Full Name</label>
                          <input
                            type="text"
                            required
                            value={tipsFullName}
                            onChange={(e) => setTipsFullName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full bg-[#111] border border-rule focus:border-ember outline-none px-2 py-1.5 rounded text-[11px] text-foreground font-mono"
                          />
                        </div>

                        {/* Company Name */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-foreground/40 block">Company Name</label>
                          <input
                            type="text"
                            required
                            value={tipsCompanyName}
                            onChange={(e) => setTipsCompanyName(e.target.value)}
                            placeholder="e.g. Google, Netflix, Indie Prod"
                            className="w-full bg-[#111] border border-rule focus:border-ember outline-none px-2 py-1.5 rounded text-[11px] text-foreground font-mono"
                          />
                        </div>

                        {/* Contact Number */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-foreground/40 block">Contact Number</label>
                          <input
                            type="tel"
                            required
                            value={tipsContactNumber}
                            onChange={(e) => setTipsContactNumber(e.target.value)}
                            placeholder="+91 1234567890"
                            className="w-full bg-[#111] border border-rule focus:border-ember outline-none px-2 py-1.5 rounded text-[11px] text-foreground font-mono"
                          />
                        </div>

                        <p className="text-[8.5px] text-amber-500/90 font-mono leading-relaxed mt-1">
                          * As an industry expert, your Contact details and LinkedIn connection is highly valued. Please click the button below to connect with me!
                        </p>
                      </div>
                    )}

                    {/* Message Box */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-foreground/40 block">Preparation Tips & Advice</label>
                      <textarea
                        required
                        rows={3}
                        value={tipsMessage}
                        onChange={(e) => setTipsMessage(e.target.value)}
                        placeholder="DSA tips, system design, mock interview advice..."
                        className="w-full bg-[#111] border border-rule focus:border-ember outline-none px-2 py-1.5 rounded text-[11px] text-foreground resize-none font-mono"
                      />
                    </div>

                    {tipsError && (
                      <p className="text-red-500 text-[10px] text-center font-mono">{tipsError}</p>
                    )}

                    {/* Submit clapper trigger */}
                    <button
                      type="submit"
                      disabled={tipsSubmitting}
                      className="w-full py-2 bg-ember text-black hover:bg-[#ff8f22] font-mono text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      🎬 {tipsSubmitting ? "Snapping..." : "SNAP & DISPATCH TIPS"}
                    </button>

                    {!linkedinConnected && (
                      <button
                        type="button"
                        onClick={handleTipsLinkedInConnect}
                        className="w-full py-2 bg-[#0077b5] text-white hover:bg-[#006297] font-mono text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded mt-2 cursor-pointer shadow-[0_2px_10px_rgba(0,119,181,0.25)]"
                      >
                        💼 Connect on LinkedIn
                      </button>
                    )}

                    {tipsLinkedinStatus && (
                      <p className="text-amber-500 text-[10px] text-center font-mono mt-2 animate-pulse">
                        &gt; {tipsLinkedinStatus}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Cinematic Custom Alert Dialog */}
      {cinematicAlert.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="border border-ember/45 bg-[#0a0a0a] max-w-sm w-full relative overflow-hidden shadow-[0_0_50px_rgba(255,123,0,0.2)] rounded text-center">
            
            {/* Clapperboard Pattern Strip */}
            <div 
              className="w-full h-4 border-b border-ember/35"
              style={{
                background: "repeating-linear-gradient(-45deg, #000, #000 8px, #ff7b00 8px, #ff7b00 16px)"
              }}
            />
            
            <div className="p-6 space-y-4">
              {/* Star icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ember/10 border border-ember/30 text-ember animate-pulse">
                <span className="text-xl">✦</span>
              </div>
              
              {/* Title */}
              <h3 className="font-display text-lg tracking-[0.15em] text-ember uppercase">
                {cinematicAlert.title}
              </h3>
              
              {/* Message */}
              <p className="font-mono text-[10.5px] leading-relaxed text-foreground/80 px-2">
                {cinematicAlert.message}
              </p>
              
              {/* Close / LinkedIn Suggestion */}
              {!linkedinConnected ? (
                <div className="space-y-3 pt-2 border-t border-rule/35">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-amber-500/90 leading-normal px-2">
                    Let's stay connected! Would you like to connect on LinkedIn?
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const isTipsAlert = cinematicAlert.title.includes("DISPATCH");
                      const inviteNote = isTipsAlert 
                        ? "Hi Darsh, saw your portfolio (darshtank.in). Let's connect!"
                        : "Hi Darsh, I saw your portfolio at darshtank.in. Let's connect!";
                      
                      navigator.clipboard.writeText(inviteNote).then(() => {
                        sessionStorage.setItem("linkedinConnected", "true");
                        setLinkedinConnected(true);
                        window.open(dynamicSocials.linkedin, "_blank");
                        setCinematicAlert({ ...cinematicAlert, isOpen: false });
                      }, () => {
                        sessionStorage.setItem("linkedinConnected", "true");
                        setLinkedinConnected(true);
                        window.open(dynamicSocials.linkedin, "_blank");
                        setCinematicAlert({ ...cinematicAlert, isOpen: false });
                      });
                    }}
                    className="w-full py-2 bg-[#0077b5] text-white hover:bg-[#006297] font-mono text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded cursor-pointer shadow-[0_2px_10px_rgba(0,119,181,0.25)] animate-pulse"
                  >
                    💼 Connect on LinkedIn
                  </button>

                  <button
                    type="button"
                    onClick={() => setCinematicAlert({ ...cinematicAlert, isOpen: false })}
                    className="text-[9px] font-mono text-foreground/45 hover:text-foreground/80 transition-colors uppercase tracking-widest block mx-auto pt-1 cursor-pointer"
                  >
                    No thanks, just close
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCinematicAlert({ ...cinematicAlert, isOpen: false })}
                  className="w-full py-2 bg-ember text-black hover:bg-[#ff8f22] font-mono text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-200 rounded cursor-pointer shadow-[0_4px_12px_rgba(255,123,0,0.2)]"
                >
                  CONTINUE SHOWTIME
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
