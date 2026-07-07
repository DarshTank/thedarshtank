"use client";

import { useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage, googleProvider, isConfigured } from "../../lib/firebase";
import {
  ArrowLeft,
  Plus,
  Trash,
  Edit3,
  Save,
  LogOut,
  Mail,
  Phone,
  Link2,
  Lock,
  UploadCloud,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";

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

const ALLOWED_EMAIL = "darshtank05@gmail.com";

interface ProjectData {
  id?: string;
  no: string;
  name: string;
  year: string;
  role: string;
  runtime: string;
  logline: string;
  stack: string[];
  bullets: string[];
  githubUrl: string;
  projectUrl: string;
  order: number;
  visible?: boolean;
}

interface ExperienceData {
  id?: string;
  co: string;
  role: string;
  stack: string;
  when: string;
  where: string;
  points: string[];
  order: number;
  visible?: boolean;
}

interface SocialData {
  email: string;
  phone: string;
  github: string;
  linkedin: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "projects" | "experiences" | "socials" | "resume" | "starring" | "backstory" | "skills" | "credits"
  >("projects");

  // Dynamic content states
  const [projectsList, setProjectsList] = useState<ProjectData[]>([]);
  const [experiencesList, setExperiencesList] = useState<ExperienceData[]>([]);
  const [socials, setSocials] = useState<SocialData>({
    email: "",
    phone: "",
    github: "",
    linkedin: "",
  });

  // Resume states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [resumeName, setResumeName] = useState<string>("");
  const [resumeInputUrl, setResumeInputUrl] = useState<string>("");

  // Starring, Backstory, Skills, Credits states
  const [starringText, setStarringText] = useState("");
  const [backstory, setBackstory] = useState({
    quote: "",
    body: "",
    footer: "",
    location: "",
    status: "",
    duration: ""
  });
  const [creditsList, setCreditsList] = useState<any[]>([]);
  const [skillsObj, setSkillsObj] = useState<any>({
    Languages: [],
    Frameworks: [],
    Databases: [],
    Tooling: []
  });

  // Editor states
  const [editingProject, setEditingProject] = useState<Partial<ProjectData> | null>(null);
  const [editingExperience, setEditingExperience] = useState<Partial<ExperienceData> | null>(null);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!isConfigured) {
      setError("Firebase credentials are not configured. Please check your .env file in the workspace root.");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.email === ALLOWED_EMAIL) {
          setUser(currentUser);
          setError("");
          fetchAdminData();
        } else {
          setError(`Access Denied: ${currentUser.email} is not authorized.`);
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
  };

  const fetchAdminData = async () => {
    if (!isConfigured) return;
    try {
      // Load Projects
      const projSnap = await getDocs(collection(db, "projects"));
      const projs = projSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectData[];
      projs.sort((a, b) => (a.order !== undefined ? a.order : 0) - (b.order !== undefined ? b.order : 0));
      setProjectsList(projs);

      // Load Experiences
      const expSnap = await getDocs(collection(db, "experiences"));
      const exps = expSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as ExperienceData[];
      exps.sort((a, b) => (a.order !== undefined ? a.order : 0) - (b.order !== undefined ? b.order : 0));
      setExperiencesList(exps);

      // Load Socials & Resume
      const socSnap = await getDoc(doc(db, "globals", "socials"));
      if (socSnap.exists()) {
        const data = socSnap.data() as any;
        setSocials({
          email: data.email || "",
          phone: data.phone || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        });
        setResumeUrl(data.resumeUrl || "");
        setResumeName(data.resumeName || "");
        setResumeInputUrl(data.resumeUrl || "");
      }

      // Load Credits
      const credSnap = await getDoc(doc(db, "globals", "credits"));
      if (credSnap.exists()) {
        setCreditsList(credSnap.data().credits || []);
      }

      // Load Skills
      const skillSnap = await getDoc(doc(db, "globals", "skills"));
      if (skillSnap.exists()) {
        const { id, ...skillsData } = skillSnap.data();
        setSkillsObj({
          Languages: skillsData.Languages || [],
          Frameworks: skillsData.Frameworks || [],
          Databases: skillsData.Databases || [],
          Tooling: skillsData.Tooling || []
        });
      }

      // Load Backstory
      const backSnap = await getDoc(doc(db, "globals", "backstory"));
      if (backSnap.exists()) {
        const data = backSnap.data();
        setBackstory({
          quote: data.quote || "",
          body: data.body || "",
          footer: data.footer || "",
          location: data.location || "",
          status: data.status || "",
          duration: data.duration || ""
        });
      }

      // Load Starring
      const starSnap = await getDoc(doc(db, "globals", "starring"));
      if (starSnap.exists()) {
        setStarringText(starSnap.data().text || "");
      }
    } catch (err: any) {
      console.error("Error loading admin data:", err);
      showStatus("Failed to load database records.", "error");
    }
  };

  const handleSaveResumeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showStatus("Saving resume URL...");
      await setDoc(doc(db, "globals", "socials"), {
        ...socials,
        resumeUrl: resumeInputUrl,
        resumeName: "External PDF Link"
      });
      setResumeUrl(resumeInputUrl);
      setResumeName("External PDF Link");
      showStatus("Resume URL saved successfully!");
    } catch (err) {
      console.error(err);
      showStatus("Failed to save resume URL.", "error");
    }
  };

  const handleUploadResumeFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile || !user) return;
    try {
      showStatus("Uploading resume file locally...");
      
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("email", user.email || "");

      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.ok ? await res.json() : null;
      if (!res.ok || !data) {
        throw new Error((data && data.error) || "Upload failed");
      }

      // Save metadata to Firestore globals/socials
      await setDoc(doc(db, "globals", "socials"), {
        ...socials,
        resumeUrl: data.url,
        resumeName: data.name,
      });

      setResumeUrl(data.url);
      setResumeName(data.name);
      setResumeInputUrl(data.url);
      setResumeFile(null);
      showStatus("Resume file uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      showStatus(`Failed: ${err.message || "Check server logs"}`, "error");
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm("Are you sure you want to delete the current resume? This will clear it from the database.")) return;
    try {
      showStatus("Deleting resume...");
      
      if (user) {
        try {
          await fetch("/api/upload-resume", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email || "" }),
          });
        } catch (err) {
          console.warn("Local file deletion failed:", err);
        }
      }

      // Delete from firestore socials doc
      await setDoc(doc(db, "globals", "socials"), {
        ...socials,
        resumeUrl: "",
        resumeName: "",
      });
      
      setResumeUrl("");
      setResumeName("");
      setResumeInputUrl("");
      showStatus("Resume deleted successfully!");
    } catch (err: any) {
      console.error(err);
      showStatus("Failed to delete resume.", "error");
    }
  };

  const handleSaveStarring = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showStatus("Saving starring text...");
      await setDoc(doc(db, "globals", "starring"), {
        text: starringText
      });
      showStatus("Starring text saved successfully!");
    } catch (err: any) {
      console.error(err);
      showStatus("Failed to save starring text.", "error");
    }
  };

  const handleSaveBackstory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showStatus("Saving backstory...");
      await setDoc(doc(db, "globals", "backstory"), backstory);
      showStatus("Backstory saved successfully!");
    } catch (err: any) {
      console.error(err);
      showStatus("Failed to save backstory.", "error");
    }
  };

  const handleSaveSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showStatus("Saving skills...");
      await setDoc(doc(db, "globals", "skills"), skillsObj);
      showStatus("Skills saved successfully!");
    } catch (err: any) {
      console.error(err);
      showStatus("Failed to save skills.", "error");
    }
  };

  const handleSaveCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showStatus("Saving credits...");
      await setDoc(doc(db, "globals", "credits"), {
        credits: creditsList
      });
      showStatus("Credits saved successfully!");
    } catch (err: any) {
      console.error(err);
      showStatus("Failed to save credits.", "error");
    }
  };

  const handleLogin = async () => {
    if (!isConfigured) {
      setError("Firebase is not configured in .env yet.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== ALLOWED_EMAIL) {
        setError(`Access Denied: ${result.user.email} is not authorized.`);
        await signOut(auth);
        setUser(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
  };

  // --- Project actions ---
  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const id = editingProject.id || `proj_${Date.now()}`;
      const payload = {
        no: editingProject.no || "00",
        name: editingProject.name || "Untitled Project",
        year: editingProject.year || "2026",
        role: editingProject.role || "",
        runtime: editingProject.runtime || "",
        logline: editingProject.logline || "",
        stack: editingProject.stack || [],
        bullets: editingProject.bullets || [],
        githubUrl: editingProject.githubUrl || "",
        projectUrl: editingProject.projectUrl || "",
        order: Number(editingProject.order) || 0,
        visible: editingProject.visible !== false,
      };

      await setDoc(doc(db, "projects", id), payload);
      showStatus(`Project "${payload.name}" saved successfully.`);
      setEditingProject(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showStatus("Failed to save project document.", "error");
    }
  };

  const deleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project: ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      showStatus(`Deleted project: ${name}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showStatus("Failed to delete project.", "error");
    }
  };

  // --- Experience actions ---
  const saveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience) return;

    try {
      const id = editingExperience.id || `exp_${Date.now()}`;
      const payload = {
        co: editingExperience.co || "Unknown Company",
        role: editingExperience.role || "",
        stack: editingExperience.stack || "",
        when: editingExperience.when || "",
        where: editingExperience.where || "",
        points: editingExperience.points || [],
        order: Number(editingExperience.order) || 0,
        visible: editingExperience.visible !== false,
      };

      await setDoc(doc(db, "experiences", id), payload);
      showStatus(`Experience at "${payload.co}" saved successfully.`);
      setEditingExperience(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showStatus("Failed to save experience document.", "error");
    }
  };

  const deleteExperience = async (id: string, co: string) => {
    if (!confirm(`Are you sure you want to delete experience at: ${co}?`)) return;
    try {
      await deleteDoc(doc(db, "experiences", id));
      showStatus(`Deleted experience: ${co}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showStatus("Failed to delete experience.", "error");
    }
  };

  const toggleProjectVisibility = async (p: ProjectData) => {
    if (!p.id) return;
    try {
      const nextVisible = p.visible === false;
      const updatedPayload = {
        ...p,
        visible: nextVisible
      };
      const { id, ...payloadWithoutId } = updatedPayload;
      await setDoc(doc(db, "projects", p.id), payloadWithoutId);
      showStatus(`Project "${p.name}" is now ${nextVisible ? "visible" : "hidden"}.`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showStatus("Failed to toggle project visibility.", "error");
    }
  };

  const toggleExperienceVisibility = async (e: ExperienceData) => {
    if (!e.id) return;
    try {
      const nextVisible = e.visible === false;
      const updatedPayload = {
        ...e,
        visible: nextVisible
      };
      const { id, ...payloadWithoutId } = updatedPayload;
      await setDoc(doc(db, "experiences", e.id), payloadWithoutId);
      showStatus(`Experience at "${e.co}" is now ${nextVisible ? "visible" : "hidden"}.`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showStatus("Failed to toggle experience visibility.", "error");
    }
  };

  // --- Socials actions ---
  const saveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "globals", "socials"), {
        ...socials,
        resumeUrl,
        resumeName,
      });
      showStatus("Global social configurations updated.");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showStatus("Failed to save social configurations.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-sm text-foreground/50">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-ember border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Authenticating credentials...
        </div>
      </div>
    );
  }

  // --- LOGIN INTERFACE ---
  if (!user) {
    return (
      <main className="min-h-screen bg-black text-foreground font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 scan opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,123,0,0.07),transparent_70%)] pointer-events-none" />
        
        {/* Cinematic light flare background effect */}
        <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-ember/5 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-ember/5 blur-[150px] pointer-events-none" />
        
        {/* CLAPPERBOARD STYLE SLATE CONTAINER */}
        <div className="w-full max-w-lg border border-rule bg-card/70 backdrop-blur p-2 shadow-2xl relative z-10">
          {/* Diagonal stripes on the top of the slate */}
          <div className="border border-rule/40 bg-black overflow-hidden flex h-10 items-center relative mb-6">
            <div className="absolute inset-0 flex" style={{ background: "repeating-linear-gradient(-45deg, #000, #000 15px, #ff7b00 15px, #ff7b00 30px)" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="border border-rule/50 bg-black/40 p-6 sm:p-10 text-center space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-foreground/40 font-mono border-b border-rule/35 pb-3">
                <span>Roll №01</span>
                <span>Scene 00</span>
                <span>Booth Access</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl italic tracking-wide text-foreground mt-4">
                Projection <span className="text-ember">Booth</span>
              </h1>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/45 mt-2">
                Restricted Area • Director Credentials Required
              </p>
            </div>

            {error && (
              <div className="p-4 border border-red-500/40 bg-red-950/20 text-red-400 text-xs font-mono text-left space-y-1">
                <div className="uppercase tracking-wider font-semibold text-[10px] text-red-500">✦ Authorization Error</div>
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <button
                onClick={handleLogin}
                className="w-full relative overflow-hidden group border border-ember bg-ember/15 text-ember hover:bg-ember hover:text-black font-mono text-xs uppercase tracking-widest py-4 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" /> Authenticate via Director Account
              </button>
              
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-center text-[10px] uppercase tracking-widest text-foreground/40 hover:text-ember transition-colors pt-2"
              >
                <ArrowLeft className="h-3 w-3" /> Return to Stage
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- ADMIN PORTAL INTERFACE ---
  return (
    <main className="min-h-screen bg-black text-foreground font-mono text-xs py-28 px-4 sm:px-8 relative overflow-x-hidden">
      <div className="absolute inset-0 scan opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,123,0,0.04),transparent_50%)] pointer-events-none" />
      
      {/* HUD HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-rule backdrop-blur py-4 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase tracking-[0.2em] font-semibold text-[9px] text-foreground/80 font-mono">
              SESSION ACTIVE <span className="text-foreground/30">•</span> <span className="text-ember">{user.email}</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-foreground/50 hover:text-ember transition-colors uppercase tracking-[0.15em] text-[9px] font-semibold font-mono"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Stage
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors uppercase tracking-[0.15em] text-[9px] font-semibold font-mono"
            >
              <LogOut className="h-3.5 w-3.5" /> Close Booth
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto space-y-10">
        {/* Status notification toast */}
        {statusMessage.text && (
          <div
            className={`fixed bottom-8 right-8 z-50 px-6 py-4 border font-mono text-[10px] uppercase tracking-widest shadow-2xl backdrop-blur-md animate-fade-in ${
              statusMessage.type === "error"
                ? "border-red-500/50 bg-red-950/90 text-red-400"
                : "border-ember/50 bg-black/90 text-ember"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${statusMessage.type === "error" ? "bg-red-400 animate-ping" : "bg-ember animate-ping"}`} />
              <span>{statusMessage.text}</span>
            </div>
          </div>
        )}

        {/* Cinematic Console Banner */}
        <div className="border border-rule bg-card/25 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,123,0,0.06),transparent_60%)] pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-ember font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-ember animate-ping" />
              <span>System Operations</span>
              <span className="text-foreground/20">•</span>
              <span>Reel Management</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl tracking-wide italic">
              Projection <span className="text-ember">Booth</span>
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/45 max-w-xl">
              Configure and modify starring sequences, backstory logs, trade tools, end credits, and showreel cards dynamically.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end justify-center font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40 border-t md:border-t-0 md:border-l border-rule/50 pt-4 md:pt-0 md:pl-6 shrink-0 relative z-10">
            <span>Booths Connected: 01</span>
            <span className="mt-1">Region: Ahmedabad, IN</span>
            <span className="mt-1 text-emerald-400">Server Status: Online</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border border-rule bg-card/30 p-2 backdrop-blur">
          <div className="flex overflow-x-auto gap-2 scrollbar-none py-1">
            {[
              { id: "projects", label: "01. Filmography" },
              { id: "experiences", label: "02. Shoots & Places" },
              { id: "socials", label: "03. Social Channels" },
              { id: "resume", label: "04. Resume PDF" },
              { id: "starring", label: "05. Starring Bio" },
              { id: "backstory", label: "06. Backstory Notes" },
              { id: "skills", label: "07. Trade Tools" },
              { id: "credits", label: "08. End Credits" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setEditingProject(null);
                    setEditingExperience(null);
                  }}
                  className={`px-5 py-3 text-[10px] uppercase tracking-widest font-mono font-semibold transition-all duration-300 whitespace-nowrap border ${
                    isActive
                      ? "bg-ember text-black border-ember shadow-[0_0_15px_rgba(255,123,0,0.25)] font-bold"
                      : "bg-black/40 text-foreground/45 border-rule/45 hover:text-foreground hover:border-rule"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================== PROJECTS TAB ==================== */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Project List */}
            <div className="col-span-12 lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-foreground/50 font-mono">
                  Current Filmography ({projectsList.length} Reels)
                </span>
                <button
                  onClick={() =>
                    setEditingProject({
                      no: String(projectsList.length + 1).padStart(2, "0"),
                      name: "",
                      year: "2026",
                      role: "",
                      runtime: "",
                      logline: "",
                      stack: [],
                      bullets: [],
                      githubUrl: "",
                      projectUrl: "",
                      order: projectsList.length + 1,
                      visible: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 bg-ember/15 text-ember hover:bg-ember hover:text-black border border-ember/35 px-4 py-2 font-semibold transition-all duration-300 text-[10px] uppercase tracking-wider"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </button>
              </div>

              {projectsList.length === 0 ? (
                <div className="border border-dashed border-rule p-12 text-center text-foreground/30 font-mono text-[10px] uppercase tracking-wider">
                  No project documents found in Firestore.
                </div>
              ) : (
                <div className="space-y-4">
                  {projectsList.map((p) => (
                    <div
                      key={p.id}
                      className="border border-rule bg-card/45 p-6 flex items-center justify-between gap-6 transition-all duration-300 hover:border-ember/50 hover:bg-card/70 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-ember font-semibold font-mono text-[14px]">#{p.no}</span>
                          <span className="text-sm font-semibold tracking-wide">{p.name}</span>
                          {p.visible === false ? (
                            <span className="text-[8px] uppercase tracking-widest bg-red-950/20 border border-red-500/40 text-red-400 px-2 py-0.5 font-semibold">Hidden</span>
                          ) : (
                            <span className="text-[8px] uppercase tracking-widest bg-emerald-950/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 font-semibold">Visible</span>
                          )}
                        </div>
                        <p className="text-foreground/45 text-[11px] font-mono leading-relaxed">{p.role}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {p.stack?.map((tag) => (
                            <span key={tag} className="border border-rule/60 px-2 py-0.5 text-[9px] text-foreground/60 bg-black/40 font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleProjectVisibility(p)}
                          className={`p-2.5 border transition-all duration-300 ${
                            p.visible === false
                              ? "border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-950/30 shadow-sm"
                              : "border-rule text-foreground/50 hover:border-ember hover:text-ember hover:bg-ember/5"
                          }`}
                          title={p.visible === false ? "Show in Portfolio" : "Hide from Portfolio"}
                        >
                          {p.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditingProject(p)}
                          className="p-2.5 border border-rule text-foreground/50 hover:border-ember hover:text-ember hover:bg-ember/5 transition-all duration-300"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteProject(p.id!, p.name)}
                          className="p-2.5 border border-rule text-foreground/50 hover:border-red-500 hover:text-red-400 hover:bg-red-950/20 transition-all duration-300"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Edit Form */}
            <div className="col-span-12 lg:col-span-6">
              {editingProject ? (
                <form
                  onSubmit={saveProject}
                  className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
                  <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
                    ✦ {editingProject.id ? "Edit Reel Segment Details" : "Record New Reel Segment"}
                  </h3>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Reel No</label>
                      <input
                        type="text"
                        value={editingProject.no || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, no: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Sorting Order</label>
                      <input
                        type="number"
                        value={editingProject.order ?? 0}
                        onChange={(e) => setEditingProject({ ...editingProject, order: Number(e.target.value) })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border border-rule bg-black/30 p-4 relative z-10">
                    <input
                      type="checkbox"
                      id="project-visible"
                      checked={editingProject.visible !== false}
                      onChange={(e) => setEditingProject({ ...editingProject, visible: e.target.checked })}
                      className="accent-ember h-4.5 w-4.5 cursor-pointer"
                    />
                    <label htmlFor="project-visible" className="text-[10px] uppercase tracking-wider font-semibold cursor-pointer select-none text-foreground/80 hover:text-foreground transition-colors font-mono">
                      Show In Public Portfolio
                    </label>
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Project Title</label>
                    <input
                      type="text"
                      value={editingProject.name || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                      className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Release Year</label>
                      <input
                        type="text"
                        value={editingProject.year || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Scene Runtime</label>
                      <input
                        type="text"
                        value={editingProject.runtime || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, runtime: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                        placeholder="Feature · 2026"
                      />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Role & Summary</label>
                    <input
                      type="text"
                      value={editingProject.role || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                      className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                    />
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Logline Quote</label>
                    <textarea
                      value={editingProject.logline || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, logline: e.target.value })}
                      className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all h-20 text-sm text-foreground resize-y"
                    />
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">
                      Technology Stack (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editingProject.stack?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                    />
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">
                      Scene Breakdown Bullets (one bullet per line)
                    </label>
                    <textarea
                      value={editingProject.bullets?.join("\n") || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          bullets: e.target.value.split("\n").filter((s) => s.trim() !== ""),
                        })
                      }
                      className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all h-28 text-sm text-foreground resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">GitHub Link</label>
                      <input
                        type="url"
                        value={editingProject.githubUrl || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Live Link</label>
                      <input
                        type="url"
                        value={editingProject.projectUrl || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, projectUrl: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 relative z-10 border-t border-rule/50">
                    <button
                      type="submit"
                      className="flex-1 bg-ember hover:bg-white text-black hover:text-black font-semibold font-mono tracking-wider py-3.5 transition-all duration-300 text-xs uppercase shadow-[0_0_15px_rgba(255,123,0,0.15)] flex items-center justify-center gap-1.5"
                    >
                      <Save className="h-4 w-4" /> Save Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-6 border border-rule text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all duration-300 font-mono text-xs uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="border border-dashed border-rule bg-card/10 p-16 text-center text-foreground/20 h-full flex flex-col items-center justify-center font-mono space-y-4">
                  <div className="h-10 w-10 rounded-full border border-rule flex items-center justify-center text-foreground/35 bg-black/40">✦</div>
                  <p className="text-[10px] uppercase tracking-widest max-w-[280px] leading-relaxed">
                    Select a showreel project card from the list to modify its contents or record a new one.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== EXPERIENCES TAB ==================== */}
        {activeTab === "experiences" && (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Experience List */}
            <div className="col-span-12 lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-foreground/50 font-mono">
                  Location Shoots / Internships ({experiencesList.length} Shoots)
                </span>
                <button
                  onClick={() =>
                    setEditingExperience({
                      co: "",
                      role: "",
                      stack: "",
                      when: "",
                      where: "",
                      points: [],
                      order: experiencesList.length + 1,
                      visible: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 bg-ember/15 text-ember hover:bg-ember hover:text-black border border-ember/35 px-4 py-2 font-semibold transition-all duration-300 text-[10px] uppercase tracking-wider"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </button>
              </div>

              {experiencesList.length === 0 ? (
                <div className="border border-dashed border-rule p-12 text-center text-foreground/30 font-mono text-[10px] uppercase tracking-wider">
                  No experience records found in Firestore.
                </div>
              ) : (
                <div className="space-y-4">
                  {experiencesList.map((e) => (
                    <div
                      key={e.id}
                      className="border border-rule bg-card/45 p-6 flex items-center justify-between gap-6 transition-all duration-300 hover:border-ember/50 hover:bg-card/70 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-sm font-semibold tracking-wide">{e.co}</h4>
                          {e.visible === false ? (
                            <span className="text-[8px] uppercase tracking-widest bg-red-950/20 border border-red-500/40 text-red-400 px-2 py-0.5 font-semibold">Hidden</span>
                          ) : (
                            <span className="text-[8px] uppercase tracking-widest bg-emerald-950/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 font-semibold">Visible</span>
                          )}
                        </div>
                        <p className="text-ember text-[11px] font-mono font-semibold">{e.role}</p>
                        <p className="text-foreground/45 text-[10px] font-mono">{e.when}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleExperienceVisibility(e)}
                          className={`p-2.5 border transition-all duration-300 ${
                            e.visible === false
                              ? "border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-950/30"
                              : "border-rule text-foreground/50 hover:border-ember hover:text-ember hover:bg-ember/5"
                          }`}
                          title={e.visible === false ? "Show in Portfolio" : "Hide from Portfolio"}
                        >
                          {e.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditingExperience(e)}
                          className="p-2.5 border border-rule text-foreground/50 hover:border-ember hover:text-ember hover:bg-ember/5 transition-all duration-300"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteExperience(e.id!, e.co)}
                          className="p-2.5 border border-rule text-foreground/50 hover:border-red-500 hover:text-red-400 hover:bg-red-950/20 transition-all duration-300"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Edit Form */}
            <div className="col-span-12 lg:col-span-6">
              {editingExperience ? (
                <form
                  onSubmit={saveExperience}
                  className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
                  <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
                    ✦ {editingExperience.id ? "Edit Shoot Location Record" : "Record New Shoot Location"}
                  </h3>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Company / Platform</label>
                      <input
                        type="text"
                        value={editingExperience.co || ""}
                        onChange={(e) => setEditingExperience({ ...editingExperience, co: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Sorting Order</label>
                      <input
                        type="number"
                        value={editingExperience.order ?? 0}
                        onChange={(e) => setEditingExperience({ ...editingExperience, order: Number(e.target.value) })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border border-rule bg-black/30 p-4 relative z-10">
                    <input
                      type="checkbox"
                      id="experience-visible"
                      checked={editingExperience.visible !== false}
                      onChange={(e) => setEditingExperience({ ...editingExperience, visible: e.target.checked })}
                      className="accent-ember h-4.5 w-4.5 cursor-pointer"
                    />
                    <label htmlFor="experience-visible" className="text-[10px] uppercase tracking-wider font-semibold cursor-pointer select-none text-foreground/80 hover:text-foreground transition-colors font-mono">
                      Show In Public Portfolio
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Designation / Role</label>
                      <input
                        type="text"
                        value={editingExperience.role || ""}
                        onChange={(e) => setEditingExperience({ ...editingExperience, role: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Tech Stack</label>
                      <input
                        type="text"
                        value={editingExperience.stack || ""}
                        onChange={(e) => setEditingExperience({ ...editingExperience, stack: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                        placeholder="Python · MySQL · Node.js"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Timeline Period</label>
                      <input
                        type="text"
                        value={editingExperience.when || ""}
                        onChange={(e) => setEditingExperience({ ...editingExperience, when: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                        placeholder="May 2026 — Jun 2026"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Shoot Geography</label>
                      <input
                        type="text"
                        value={editingExperience.where || ""}
                        onChange={(e) => setEditingExperience({ ...editingExperience, where: e.target.value })}
                        className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                        placeholder="Rajkot, India"
                      />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">
                      Shoot Tasks / Bullet Points (one bullet per line)
                    </label>
                    <textarea
                      value={editingExperience.points?.join("\n") || ""}
                      onChange={(e) =>
                        setEditingExperience({
                          ...editingExperience,
                          points: e.target.value.split("\n").filter((s) => s.trim() !== ""),
                        })
                      }
                      className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all h-36 text-sm text-foreground resize-y"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 relative z-10 border-t border-rule/50">
                    <button
                      type="submit"
                      className="flex-1 bg-ember hover:bg-white text-black hover:text-black font-semibold font-mono tracking-wider py-3.5 transition-all duration-300 text-xs uppercase shadow-[0_0_15px_rgba(255,123,0,0.15)] flex items-center justify-center gap-1.5"
                    >
                      <Save className="h-4 w-4" /> Save Experience
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingExperience(null)}
                      className="px-6 border border-rule text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all duration-300 font-mono text-xs uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="border border-dashed border-rule bg-card/10 p-16 text-center text-foreground/20 h-full flex flex-col items-center justify-center font-mono space-y-4">
                  <div className="h-10 w-10 rounded-full border border-rule flex items-center justify-center text-foreground/35 bg-black/40">✦</div>
                  <p className="text-[10px] uppercase tracking-widest max-w-[280px] leading-relaxed">
                    Select a location shoot record to modify its settings or log a new internship.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== SOCIALS TAB ==================== */}
        {activeTab === "socials" && (
          <form
            onSubmit={saveSocials}
            className="max-w-2xl border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
            <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
              ✦ Global Contact & Social Channels
            </h3>

            <div className="space-y-5 relative z-10">
              <div>
                <label className="flex items-center gap-2 text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">
                  <Mail className="h-4 w-4 text-ember" /> Email Address
                </label>
                <input
                  type="email"
                  value={socials.email}
                  onChange={(e) => setSocials({ ...socials, email: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">
                  <Phone className="h-4 w-4 text-ember" /> Telephone No
                </label>
                <input
                  type="text"
                  value={socials.phone}
                  onChange={(e) => setSocials({ ...socials, phone: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">
                  <Github className="h-4 w-4 text-ember" /> GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={socials.github}
                  onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">
                  <Linkedin className="h-4 w-4 text-ember" /> LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={socials.linkedin}
                  onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-rule/50 relative z-10">
              <button
                type="submit"
                className="bg-ember hover:bg-white text-black hover:text-black font-semibold font-mono tracking-wider py-3.5 px-8 transition-all duration-300 text-xs uppercase shadow-[0_0_15px_rgba(255,123,0,0.15)] flex items-center justify-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Update Social Config
              </button>
            </div>
          </form>
        )}

        {/* ==================== RESUME TAB ==================== */}
        {activeTab === "resume" && (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Column: Current Resume Status */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <div className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
                <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5" /> Active Resume Script
                </h3>
                
                {resumeUrl ? (
                  <div className="space-y-4 relative z-10">
                    <div className="bg-black/60 border border-rule p-4 space-y-2">
                      <p className="text-[9px] text-foreground/45 uppercase font-mono tracking-wider">Document Name</p>
                      <p className="text-sm font-mono truncate text-foreground/90 font-semibold">{resumeName || "resume.pdf"}</p>
                    </div>
                    <div className="bg-black/60 border border-rule p-4 space-y-2">
                      <p className="text-[9px] text-foreground/45 uppercase font-mono tracking-wider">Access Link</p>
                      <a 
                        href={resumeUrl}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-mono text-ember hover:underline block truncate"
                      >
                        {resumeUrl}
                      </a>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <a 
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center bg-ember hover:bg-white text-black font-semibold font-mono py-3 text-xs tracking-wider transition-all duration-300 uppercase shadow-[0_0_12px_rgba(255,123,0,0.1)]"
                      >
                        View Live PDF
                      </a>
                      <button
                        type="button"
                        onClick={handleDeleteResume}
                        className="px-4 border border-red-500/30 text-red-400 hover:bg-red-950/20 hover:border-red-500 transition-all duration-300 uppercase font-mono text-[9px] tracking-wider"
                      >
                        Delete Document
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-rule p-8 text-center text-foreground/20 text-xs font-mono py-12">
                    No active resume script uploaded. Select options on the right.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Manage / Upload Forms */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              {/* Option 1: File Upload */}
              <form onSubmit={handleUploadResumeFile} className="border border-rule bg-card p-6 sm:p-8 space-y-4 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
                <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
                  <UploadCloud className="h-4.5 w-4.5" /> Option A: Upload PDF Script File
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed font-mono relative z-10">
                  Upload a PDF script file directly to your local file path. It will compile directly as the portfolio resume.
                </p>
                <div className="space-y-4 relative z-10 pt-2">
                  <div className="border border-dashed border-rule p-8 text-center bg-black/40 hover:border-ember/50 transition-all duration-300 relative cursor-pointer group">
                    <input 
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="h-8 w-8 mx-auto text-foreground/30 group-hover:text-ember transition-colors mb-3" />
                    <p className="text-xs font-mono font-medium">
                      {resumeFile ? resumeFile.name : "Click or drag your resume PDF here"}
                    </p>
                    {resumeFile && (
                      <p className="text-[10px] text-foreground/45 mt-1 font-mono">
                        ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!resumeFile}
                    className={`w-full font-mono font-semibold py-3.5 text-xs tracking-wider transition-all duration-300 uppercase ${
                      resumeFile 
                        ? "bg-ember text-black hover:bg-white shadow-[0_0_15px_rgba(255,123,0,0.15)]" 
                        : "bg-rule text-foreground/20 cursor-not-allowed border border-rule/50"
                    }`}
                  >
                    Upload Script
                  </button>
                </div>
              </form>

              {/* Option 2: Paste Link */}
              <form onSubmit={handleSaveResumeUrl} className="border border-rule bg-card p-6 sm:p-8 space-y-4 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
                <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
                  <Link2 className="h-4.5 w-4.5" /> Option B: Link External Document
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed font-mono relative z-10">
                  Already have your script hosted on Drive or Dropbox? Save the URL.
                </p>
                <div className="space-y-4 relative z-10 pt-2">
                  <div>
                    <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Direct Document URL</label>
                    <input 
                      type="url"
                      placeholder="https://drive.google.com/.../view"
                      value={resumeInputUrl}
                      onChange={(e) => setResumeInputUrl(e.target.value)}
                      className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all font-mono text-sm text-foreground"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-ember hover:bg-white text-black font-semibold font-mono py-3.5 text-xs tracking-wider transition-all duration-300 uppercase shadow-[0_0_15px_rgba(255,123,0,0.15)]"
                  >
                    Link Document URL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== STARRING TAB ==================== */}
        {activeTab === "starring" && (
          <form onSubmit={handleSaveStarring} className="border border-rule bg-card p-6 sm:p-8 space-y-4 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
            <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
              ✦ Edit Hero Starring Description
            </h3>
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Hero Bio Description</label>
                <textarea
                  rows={5}
                  value={starringText}
                  onChange={(e) => setStarringText(e.target.value)}
                  className="w-full bg-black border border-rule px-4 py-3.5 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all font-mono text-sm text-foreground resize-y leading-relaxed"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-ember hover:bg-white text-black font-semibold font-mono tracking-wider py-3.5 px-8 transition-all duration-300 text-xs uppercase shadow-[0_0_15px_rgba(255,123,0,0.15)] flex items-center justify-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Save Starring Text
              </button>
            </div>
          </form>
        )}

        {/* ==================== BACKSTORY TAB ==================== */}
        {activeTab === "backstory" && (
          <form onSubmit={handleSaveBackstory} className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
            <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
              ✦ Edit Backstory (A note, from the desk)
            </h3>
            <div className="grid grid-cols-12 gap-6 relative z-10">
              <div className="col-span-12">
                <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Quote / Highlight Statement</label>
                <input
                  type="text"
                  value={backstory.quote}
                  onChange={(e) => setBackstory({ ...backstory, quote: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                  required
                />
              </div>
              <div className="col-span-12">
                <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Main Paragraph Text</label>
                <textarea
                  rows={4}
                  value={backstory.body}
                  onChange={(e) => setBackstory({ ...backstory, body: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground resize-y leading-relaxed"
                  required
                />
              </div>
              <div className="col-span-12">
                <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Footer / Signature Statement</label>
                <input
                  type="text"
                  value={backstory.footer}
                  onChange={(e) => setBackstory({ ...backstory, footer: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground"
                  required
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Location</label>
                <input
                  type="text"
                  value={backstory.location}
                  onChange={(e) => setBackstory({ ...backstory, location: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                  required
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Status (e.g. Open to roles)</label>
                <input
                  type="text"
                  value={backstory.status}
                  onChange={(e) => setBackstory({ ...backstory, status: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                  required
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Duration Info (e.g. CS · 2024-27)</label>
                <input
                  type="text"
                  value={backstory.duration}
                  onChange={(e) => setBackstory({ ...backstory, duration: e.target.value })}
                  className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                  required
                />
              </div>
            </div>
            <div className="pt-4 border-t border-rule/50 relative z-10">
              <button
                type="submit"
                className="bg-ember hover:bg-white text-black font-semibold font-mono tracking-wider py-3.5 px-8 transition-all duration-300 text-xs uppercase shadow-[0_0_15px_rgba(255,123,0,0.15)] flex items-center justify-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Save Backstory Config
              </button>
            </div>
          </form>
        )}

        {/* ==================== SKILLS TAB ==================== */}
        {activeTab === "skills" && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSkills(e);
            }} 
            className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
            <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
              ✦ Edit Tools of the Trade (Skills categories, comma-separated)
            </h3>
            <div className="space-y-5 relative z-10">
              {["Languages", "Frameworks", "Databases", "Tooling"].map((cat) => (
                <div key={cat}>
                  <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">{cat}</label>
                  <input
                    type="text"
                    value={skillsObj[cat]?.join(", ") || ""}
                    onChange={(e) => {
                      const arr = e.target.value.split(",").map(x => x.trim()).filter(Boolean);
                      setSkillsObj({ ...skillsObj, [cat]: arr });
                    }}
                    placeholder={`Enter ${cat} separated by commas...`}
                    className="w-full bg-black border border-rule px-4 py-3 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-sm text-foreground font-mono"
                  />
                </div>
              ))}
              <div className="pt-2 border-t border-rule/50">
                <button
                  type="submit"
                  className="bg-ember hover:bg-white text-black font-semibold font-mono tracking-wider py-3.5 px-8 transition-all duration-300 text-xs uppercase shadow-[0_0_15px_rgba(255,123,0,0.15)] flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Skills Config
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ==================== CREDITS TAB ==================== */}
        {activeTab === "credits" && (
          <form onSubmit={handleSaveCredits} className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
            <h3 className="text-sm border-b border-rule pb-3 text-ember uppercase tracking-widest font-semibold font-mono relative z-10 flex items-center gap-2">
              ✦ Edit End Credits List
            </h3>
            
            <div className="space-y-4 relative z-10">
              {creditsList.map((item, idx) => {
                const role = Array.isArray(item) ? item[0] : item.role;
                const name = Array.isArray(item) ? item[1] : item.name;
                return (
                  <div key={idx} className="flex gap-4 items-center animate-fade-in bg-black/35 border border-rule/50 p-4">
                    <div className="flex-1">
                      <label className="block text-[8px] text-foreground/45 uppercase font-mono tracking-wider mb-2">Role / Department</label>
                      <input
                        type="text"
                        value={role || ""}
                        onChange={(e) => {
                          const copy = [...creditsList];
                          copy[idx] = { role: e.target.value, name };
                          setCreditsList(copy);
                        }}
                        className="w-full bg-black border border-rule/65 px-3 py-2.5 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-xs text-foreground font-mono"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[8px] text-foreground/45 uppercase font-mono tracking-wider mb-2">Name / Credit</label>
                      <input
                        type="text"
                        value={name || ""}
                        onChange={(e) => {
                          const copy = [...creditsList];
                          copy[idx] = { role, name: e.target.value };
                          setCreditsList(copy);
                        }}
                        className="w-full bg-black border border-rule/65 px-3 py-2.5 outline-none focus:border-ember focus:ring-1 focus:ring-ember/25 transition-all text-xs text-foreground font-mono"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCreditsList(creditsList.filter((_, i) => i !== idx));
                      }}
                      className="mt-6 p-2 text-red-400 hover:text-red-600 hover:bg-red-950/20 border border-transparent hover:border-red-500/30 transition-all duration-300"
                      title="Remove Credit"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              
              <div className="flex justify-between items-center pt-4 border-t border-rule/50">
                <button
                  type="button"
                  onClick={() => {
                    setCreditsList([...creditsList, { role: "", name: "" }]);
                  }}
                  className="inline-flex items-center gap-1.5 bg-ember/15 text-ember hover:bg-ember hover:text-black border border-ember/35 px-5 py-2.5 font-mono font-semibold transition-all duration-300 text-[10px] uppercase tracking-wider"
                >
                  <Plus className="h-4 w-4" /> Add Credit Row
                </button>
                
                <button
                  type="submit"
                  className="bg-ember hover:bg-white text-black font-semibold font-mono tracking-wider py-3.5 px-8 transition-all duration-300 text-xs uppercase shadow-[0_0_15px_rgba(255,123,0,0.15)] flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save End Credits
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
