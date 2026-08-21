"use client";

import React, { useEffect, useState } from "react";
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
  updateDoc,
  onSnapshot,
  writeBatch,
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
  ShieldBan,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-react";

import { type VisitorRecord, computeMetrics, parseBrowserName, formatRelativeTime, sanitizeIp } from "../../lib/analytics";
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

const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

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
  no: string;
  co: string;
  role: string;
  stack: string;
  when: string;
  where: string;
  points: string[];
  order: number;
  visible?: boolean;
}

// Reel number stamped on records that are hidden from the public portfolio —
// they are skipped when the visible records are numbered.
const HIDDEN_NO = "--";

type OrderedCollection = "projects" | "experiences";

interface OrderedRecord {
  id?: string;
  no: string;
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
    "projects" | "experiences" | "socials" | "resume" | "starring" | "backstory" | "skills" | "credits" | "analytics" | "graphs" | "feedback" | "tips"
  >("projects");

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState<VisitorRecord[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorSortField, setVisitorSortField] = useState<string>("lastSeen");
  const [visitorSortAsc, setVisitorSortAsc] = useState(false);
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorPageSize, setVisitorPageSize] = useState<number>(10);
  const [chartFilter, setChartFilter] = useState<"day" | "month" | "year">("day");
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([]);
  const [countryPage, setCountryPage] = useState(1);
  const [browserPage, setBrowserPage] = useState(1);

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
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackPageSize, setFeedbackPageSize] = useState<number>(10);
  const [feedbackFilterRating, setFeedbackFilterRating] = useState<string>("all");
  const [expandedFeedbackIds, setExpandedFeedbackIds] = useState<string[]>([]);
  
  // Placement Tips States
  const [tipsList, setTipsList] = useState<any[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsPage, setTipsPage] = useState(1);
  const [tipsPageSize, setTipsPageSize] = useState<number>(10);
  const [expandedTipsIds, setExpandedTipsIds] = useState<string[]>([]);

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

  // Drag-to-reorder state, shared by the projects and experiences lists.
  const [dragState, setDragState] = useState<{
    list: OrderedCollection;
    from: number;
    over: number;
  } | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await onConfirm();
      },
    });
  };

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

  // Load saved tab on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("adminActiveTab");
    if (savedTab && [
      "projects", "experiences", "socials", "resume", "starring", "backstory", "skills", "credits", "analytics", "graphs"
    ].includes(savedTab)) {
      setActiveTab(savedTab as any);
    }
  }, []);

  // Sync tab to localStorage
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("adminActiveTab", activeTab);
    }
  }, [activeTab]);

  // Real-time visitor logs subscription (onSnapshot)
  useEffect(() => {
    if (!isConfigured || !user) return;

    setAnalyticsLoading(true);
    setAnalyticsError("");

    const unsubscribe = onSnapshot(
      collection(db, "visitors"),
      (snap) => {
        const records = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as VisitorRecord[];
        setAnalyticsData(records);
        setAnalyticsLoading(false);
      },
      (err: any) => {
        console.error("Real-time analytics subscription error:", err);
        setAnalyticsError(err.message || "Failed to subscribe to visitor logs.");
        setAnalyticsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time feedback subscription (onSnapshot)
  useEffect(() => {
    if (!isConfigured || !user) return;

    setFeedbackLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "feedback"),
      (snap) => {
        const records = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as any[];
        // Sort by createdAt descending
        records.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setFeedbackList(records);
        setFeedbackLoading(false);
      },
      (err: any) => {
        console.error("Real-time feedback subscription error:", err);
        setFeedbackLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time placement tips subscription (onSnapshot)
  useEffect(() => {
    if (!isConfigured || !user) return;

    setTipsLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "tips"),
      (snap) => {
        const records = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as any[];
        // Sort by createdAt descending
        records.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setTipsList(records);
        setTipsLoading(false);
      },
      (err: any) => {
        console.error("Real-time tips subscription error:", err);
        setTipsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDeleteFeedback = (id: string) => {
    triggerConfirm(
      "DELETE AUDIENCE SCORE",
      "Are you sure you want to delete this audience rating and critique log? This action is permanent and cannot be undone.",
      async () => {
        try {
          showStatus("Deleting feedback...");
          await deleteDoc(doc(db, "feedback", id));
          showStatus("Feedback deleted successfully!");
        } catch (err: any) {
          console.error("Error deleting feedback:", err);
          showStatus("Failed to delete feedback.", "error");
        }
      }
    );
  };

  const toggleExpandFeedback = (id: string) => {
    setExpandedFeedbackIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteTip = (id: string) => {
    triggerConfirm(
      "DELETE PLACEMENT TIP",
      "Are you sure you want to delete this placement tip record? This action is permanent and cannot be undone.",
      async () => {
        try {
          showStatus("Deleting placement tip...");
          await deleteDoc(doc(db, "tips", id));
          showStatus("Placement tip deleted successfully!");
        } catch (err: any) {
          console.error("Error deleting tip:", err);
          showStatus("Failed to delete tip.", "error");
        }
      }
    );
  };

  const toggleExpandTip = (id: string) => {
    setExpandedTipsIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
  };

  // --- Ordering & auto-numbering ---------------------------------------------
  // `order` mirrors the drag position and covers every record, hidden or not.
  // `no` is the public reel number and only counts records that are visible, so
  // hiding one automatically renumbers everything below it.
  const applySequence = <T extends OrderedRecord>(list: T[]): T[] => {
    let reel = 0;
    return list.map((item, idx) => {
      const isVisible = item.visible !== false;
      if (isVisible) reel += 1;
      return {
        ...item,
        order: idx + 1,
        no: isVisible ? String(reel).padStart(2, "0") : HIDDEN_NO,
      };
    });
  };

  // Writes back only the records whose number or position actually moved.
  const persistSequence = async (
    collectionName: OrderedCollection,
    previous: OrderedRecord[],
    next: OrderedRecord[]
  ) => {
    const before = new Map(previous.map((item) => [item.id, item]));
    const batch = writeBatch(db);
    let writes = 0;

    next.forEach((item) => {
      if (!item.id) return;
      const old = before.get(item.id);
      if (old && old.order === item.order && old.no === item.no) return;
      batch.update(doc(db, collectionName, item.id), { order: item.order, no: item.no });
      writes += 1;
    });

    if (writes > 0) await batch.commit();
  };

  const reorderList = <T,>(list: T[], from: number, to: number): T[] => {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  };

  const handleDragStart = (list: OrderedCollection, index: number) => {
    setDragState({ list, from: index, over: index });
  };

  const handleDragEnter = (list: OrderedCollection, index: number) => {
    setDragState((prev) =>
      prev && prev.list === list && prev.over !== index ? { ...prev, over: index } : prev
    );
  };

  // Moves a record to the dropped position, renumbers the list optimistically
  // and rolls the UI back if Firestore rejects the write.
  const commitDrop = async (list: OrderedCollection, to: number) => {
    const active = dragState;
    setDragState(null);
    if (!active || active.list !== list || active.from === to) return;

    const isProjects = list === "projects";
    const previous: OrderedRecord[] = isProjects ? projectsList : experiencesList;
    const next = applySequence(reorderList(previous, active.from, to));

    if (isProjects) setProjectsList(next as ProjectData[]);
    else setExperiencesList(next as ExperienceData[]);

    try {
      await persistSequence(list, previous, next);
      showStatus(isProjects ? "Reel order updated." : "Shoot order updated.");
    } catch (err) {
      console.error(err);
      if (isProjects) setProjectsList(previous as ProjectData[]);
      else setExperiencesList(previous as ExperienceData[]);
      showStatus("Failed to save the new order.", "error");
    }
  };

  const fetchAdminData = async () => {
    if (!isConfigured) return;
    try {
      // Load Projects — positions and reel numbers are re-derived from the
      // stored order so gaps left by deletes or hidden records close up.
      const projSnap = await getDocs(collection(db, "projects"));
      const projs = projSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectData[];
      projs.sort((a, b) => (a.order !== undefined ? a.order : 0) - (b.order !== undefined ? b.order : 0));
      const sequencedProjs = applySequence(projs);
      setProjectsList(sequencedProjs);
      await persistSequence("projects", projs, sequencedProjs);

      // Load Experiences
      const expSnap = await getDocs(collection(db, "experiences"));
      const exps = expSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as ExperienceData[];
      exps.sort((a, b) => (a.order !== undefined ? a.order : 0) - (b.order !== undefined ? b.order : 0));
      const sequencedExps = applySequence(exps);
      setExperiencesList(sequencedExps);
      await persistSequence("experiences", exps, sequencedExps);

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

  const fetchAnalytics = async () => {
    if (!isConfigured) return;
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const snap = await getDocs(collection(db, "visitors"));
      const records = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as VisitorRecord[];
      setAnalyticsData(records);
    } catch (err: any) {
      console.error("Error fetching analytics data:", err);
      setAnalyticsError(err.message || "Failed to fetch analytics records.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const deleteVisitor = async (ipAddress: string) => {
    if (!isConfigured) return;
    triggerConfirm(
      "Delete Visitor Record",
      `Are you sure you want to delete visitor record for IP: ${ipAddress}?`,
      async () => {
        try {
          const docId = ipAddress.replace(/[.:]/g, "_");
          await deleteDoc(doc(db, "visitors", docId));
          showStatus(`Deleted record for ${ipAddress}.`);
          setSelectedVisitors(prev => prev.filter(ip => ip !== ipAddress));
          await fetchAnalytics();
        } catch (err: any) {
          console.error("Failed to delete visitor document:", err);
          showStatus("Failed to delete record.", "error");
        }
      }
    );
  };

  const deleteSelectedVisitors = async () => {
    if (!isConfigured || selectedVisitors.length === 0) return;
    triggerConfirm(
      "Delete Selected Records",
      `Are you sure you want to delete ${selectedVisitors.length} selected visitor record(s)?`,
      async () => {
        try {
          await Promise.all(
            selectedVisitors.map((ip) => {
              const docId = ip.replace(/[.:]/g, "_");
              return deleteDoc(doc(db, "visitors", docId));
            })
          );
          showStatus(`Successfully deleted ${selectedVisitors.length} record(s).`);
          setSelectedVisitors([]);
          await fetchAnalytics();
        } catch (err: any) {
          console.error("Failed to delete selected visitors:", err);
          showStatus("Failed to delete some records.", "error");
        }
      }
    );
  };

  const toggleBlockVisitor = async (ip: string, currentlyBlocked: boolean) => {
    if (!isConfigured) return;
    const nextBlocked = !currentlyBlocked;
    const action = nextBlocked ? "block" : "unblock";
    triggerConfirm(
      `${nextBlocked ? "Block" : "Unblock"} Connection`,
      `Are you sure you want to ${action} IP: ${ip}?`,
      async () => {
        try {
          const docId = sanitizeIp(ip);
          await updateDoc(doc(db, "visitors", docId), { blocked: nextBlocked });
          showStatus(`IP ${ip} has been ${nextBlocked ? "blocked" : "unblocked"}.`);
        } catch (err: any) {
          console.error(`Failed to ${action} visitor:`, err);
          showStatus(`Failed to ${action} visitor.`, "error");
        }
      }
    );
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
      showStatus("Uploading resume file to Vercel Blob...");
      
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("email", user.email || "");

      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = res.ok ? await res.json() : null;
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
      showStatus("Resume file uploaded to Vercel Blob successfully!");
    } catch (err: any) {
      console.error(err);
      showStatus(`Failed: ${err.message || "Check server logs"}`, "error");
    }
  };

  const handleDeleteResume = async () => {
    triggerConfirm(
      "Delete Resume",
      "Are you sure you want to delete the current resume? This will clear it from the database.",
      async () => {
        try {
          showStatus("Deleting resume from Vercel Blob...");
          
          if (user) {
            try {
              await fetch("/api/upload-resume", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email || "", resumeUrl }),
              });
            } catch (err) {
              console.warn("Vercel Blob file deletion failed:", err);
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
      }
    );
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
        // `no` and `order` are provisional here — fetchAdminData re-sequences
        // the whole list once the write lands.
        no: editingProject.no || String(projectsList.length + 1).padStart(2, "0"),
        name: editingProject.name || "Untitled Project",
        year: editingProject.year || "2026",
        role: editingProject.role || "",
        runtime: editingProject.runtime || "",
        logline: editingProject.logline || "",
        stack: editingProject.stack || [],
        bullets: editingProject.bullets || [],
        githubUrl: editingProject.githubUrl || "",
        projectUrl: editingProject.projectUrl || "",
        order: Number(editingProject.order) || projectsList.length + 1,
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
    triggerConfirm(
      "Delete Project",
      `Are you sure you want to delete project: ${name}?`,
      async () => {
        try {
          await deleteDoc(doc(db, "projects", id));
          showStatus(`Deleted project: ${name}`);
          fetchAdminData();
        } catch (err) {
          console.error(err);
          showStatus("Failed to delete project.", "error");
        }
      }
    );
  };

  // --- Experience actions ---
  const saveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience) return;

    try {
      const id = editingExperience.id || `exp_${Date.now()}`;
      const payload = {
        // `no` and `order` are provisional here — fetchAdminData re-sequences
        // the whole list once the write lands.
        no: editingExperience.no || String(experiencesList.length + 1).padStart(2, "0"),
        co: editingExperience.co || "Unknown Company",
        role: editingExperience.role || "",
        stack: editingExperience.stack || "",
        when: editingExperience.when || "",
        where: editingExperience.where || "",
        points: editingExperience.points || [],
        order: Number(editingExperience.order) || experiencesList.length + 1,
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
    triggerConfirm(
      "Delete Experience",
      `Are you sure you want to delete experience at: ${co}?`,
      async () => {
        try {
          await deleteDoc(doc(db, "experiences", id));
          showStatus(`Deleted experience: ${co}`);
          fetchAdminData();
        } catch (err) {
          console.error(err);
          showStatus("Failed to delete experience.", "error");
        }
      }
    );
  };

  const toggleProjectVisibility = async (p: ProjectData) => {
    if (!p.id) return;
    const previous = projectsList;
    const nextVisible = p.visible === false;
    // Flip the flag, then renumber so the visible reels stay 01, 02, 03…
    const next = applySequence(
      previous.map((item) => (item.id === p.id ? { ...item, visible: nextVisible } : item))
    );

    setProjectsList(next);
    try {
      await updateDoc(doc(db, "projects", p.id), { visible: nextVisible });
      await persistSequence("projects", previous, next);
      showStatus(`Project "${p.name}" is now ${nextVisible ? "visible" : "hidden"}.`);
    } catch (err) {
      console.error(err);
      setProjectsList(previous);
      showStatus("Failed to toggle project visibility.", "error");
    }
  };

  const toggleExperienceVisibility = async (e: ExperienceData) => {
    if (!e.id) return;
    const previous = experiencesList;
    const nextVisible = e.visible === false;
    const next = applySequence(
      previous.map((item) => (item.id === e.id ? { ...item, visible: nextVisible } : item))
    );

    setExperiencesList(next);
    try {
      await updateDoc(doc(db, "experiences", e.id), { visible: nextVisible });
      await persistSequence("experiences", previous, next);
      showStatus(`Experience at "${e.co}" is now ${nextVisible ? "visible" : "hidden"}.`);
    } catch (err) {
      console.error(err);
      setExperiencesList(previous);
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
      <main className="min-h-screen bg-black text-foreground font-mono flex flex-col items-center justify-center p-6 pt-20 pb-20 relative overflow-hidden">
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

  // Pre-calculate visitor analytics logic outside the JSX to avoid parser parsing errors
  const metrics = computeMetrics(analyticsData);
  const queryStr = visitorSearch.toLowerCase().trim();
  const sortedAndFilteredVisitors = analyticsData
    .filter((v) => {
      if (!queryStr) return true;
      return (
        v.ip?.toLowerCase().includes(queryStr) ||
        (v.country || "").toLowerCase().includes(queryStr) ||
        (v.city || "").toLowerCase().includes(queryStr) ||
        (v.isp || "").toLowerCase().includes(queryStr) ||
        parseBrowserName(v.userAgent).toLowerCase().includes(queryStr)
      );
    })
    .sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (visitorSortField === "ip") {
        valA = a.ip ?? "";
        valB = b.ip ?? "";
      } else if (visitorSortField === "location") {
        valA = `${a.city ?? ""}, ${a.country ?? ""}`;
        valB = `${b.city ?? ""}, ${b.country ?? ""}`;
      } else if (visitorSortField === "browser") {
        valA = parseBrowserName(a.userAgent);
        valB = parseBrowserName(b.userAgent);
      } else if (visitorSortField === "visitCount") {
        valA = a.visitCount ?? 0;
        valB = b.visitCount ?? 0;
      } else if (visitorSortField === "lastSeen") {
        valA = a.lastSeen ?? "";
        valB = b.lastSeen ?? "";
      } else if (visitorSortField === "entryTime") {
        valA = a.entryTime ?? "";
        valB = b.entryTime ?? "";
      } else if (visitorSortField === "exitTime") {
        valA = a.exitTime ?? "";
        valB = b.exitTime ?? "";
      } else if (visitorSortField === "resumeClicks") {
        valA = a.resumeClicks ?? 0;
        valB = b.resumeClicks ?? 0;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return visitorSortAsc ? valA - valB : valB - valA;
      }
      return visitorSortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  // Pagination helper calculations
  const nowMs = Date.now();
  const totalItems = sortedAndFilteredVisitors.length;
  const totalPages = Math.max(Math.ceil(totalItems / visitorPageSize), 1);
  const currentPage = Math.min(visitorPage, totalPages);
  const startIndex = (currentPage - 1) * visitorPageSize;
  const paginatedVisitors = sortedAndFilteredVisitors.slice(startIndex, startIndex + visitorPageSize);

  // Country breakdown pagination
  const countryPageSize = 5;
  const totalCountryItems = metrics.countryBreakdown.length;
  const totalCountryPages = Math.max(Math.ceil(totalCountryItems / countryPageSize), 1);
  const currentCountryPage = Math.min(countryPage, totalCountryPages);
  const countryStartIndex = (currentCountryPage - 1) * countryPageSize;
  const paginatedCountries = metrics.countryBreakdown.slice(countryStartIndex, countryStartIndex + countryPageSize);

  // Browser breakdown pagination
  const browserPageSize = 5;
  const totalBrowserItems = metrics.browserBreakdown.length;
  const totalBrowserPages = Math.max(Math.ceil(totalBrowserItems / browserPageSize), 1);
  const currentBrowserPage = Math.min(browserPage, totalBrowserPages);
  const browserStartIndex = (currentBrowserPage - 1) * browserPageSize;
  const paginatedBrowsers = metrics.browserBreakdown.slice(browserStartIndex, browserStartIndex + browserPageSize);

  const isAllOnPageSelected =
    paginatedVisitors.length > 0 &&
    paginatedVisitors.every((v) => selectedVisitors.includes(v.ip || "unknown"));

  const toggleSelectAll = () => {
    if (isAllOnPageSelected) {
      const pageIps = paginatedVisitors.map((v) => v.ip || "unknown");
      setSelectedVisitors((prev) => prev.filter((ip) => !pageIps.includes(ip)));
    } else {
      const pageIps = paginatedVisitors.map((v) => v.ip || "unknown");
      setSelectedVisitors((prev) => {
        const next = [...prev];
        pageIps.forEach((ip) => {
          if (!next.includes(ip)) next.push(ip);
        });
        return next;
      });
    }
  };

  const toggleSelectRow = (ip: string) => {
    setSelectedVisitors((prev) =>
      prev.includes(ip) ? prev.filter((item) => item !== ip) : [...prev, ip]
    );
  };

  const handleHeaderClick = (field: string) => {
    if (visitorSortField === field) {
      setVisitorSortAsc(!visitorSortAsc);
    } else {
      setVisitorSortField(field);
      setVisitorSortAsc(false);
    }
  };

  const getSortIndicator = (field: string) => {
    if (visitorSortField !== field) return "";
    return visitorSortAsc ? " ▲" : " ▼";
  };

  const filterVisitorLog = (searchTerm: string) => {
    setVisitorSearch(searchTerm);
    setVisitorPage(1);
    const el = document.getElementById("visitor-log-search");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.focus();
    }
  };

  // --- ADMIN PORTAL INTERFACE ---
  return (
    <main className="min-h-screen bg-black text-foreground font-mono text-xs relative overflow-x-hidden">
      <div className="absolute inset-0 scan opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,123,0,0.04),transparent_50%)] pointer-events-none" />
      
      {/* HUD HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[70] bg-black/90 border-b border-rule backdrop-blur py-4 px-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
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

      {/* ── SIDEBAR (desktop: fixed left, mobile: horizontal scroll at top) ── */}
      <aside className="fixed top-[57px] left-0 bottom-0 z-[65] hidden lg:flex flex-col w-[240px] border-r border-rule bg-black/95 backdrop-blur-md">
        {/* Sidebar brand area — always visible, never scrolls */}
        <div className="flex-shrink-0 p-5 border-b border-rule/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,123,0,0.08),transparent_60%)] pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-ember font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-ember animate-ping" />
              <span>Reel Mgmt</span>
            </div>
            <h2 className="font-display text-2xl tracking-wide italic leading-tight">
              Projection<br /><span className="text-ember">Booth</span>
            </h2>
          </div>
        </div>

        {/* Sidebar nav items — scrollable */}
        <nav className="flex-1 overflow-y-auto cinematic-scroll py-3 px-2 space-y-1">
          {[
            { id: "projects", label: "Filmography", no: "01" },
            { id: "experiences", label: "Shoots & Places", no: "02" },
            { id: "socials", label: "Social Channels", no: "03" },
            { id: "resume", label: "Resume PDF", no: "04" },
            { id: "starring", label: "Starring Bio", no: "05" },
            { id: "backstory", label: "Backstory Notes", no: "06" },
            { id: "skills", label: "Trade Tools", no: "07" },
            { id: "credits", label: "End Credits", no: "08" },
            { id: "analytics", label: "Analytics Log", no: "09" },
            { id: "graphs", label: "Traffic Graphs", no: "10" },
            { id: "feedback", label: "Audience Reviews", no: "11" },
            { id: "tips", label: "Placement Tips", no: "12" },
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
                className={`w-full text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-mono font-semibold transition-all duration-200 flex items-center gap-3 border-l-2 ${
                  isActive
                    ? "bg-ember/10 text-ember border-l-ember"
                    : "text-foreground/45 border-l-transparent hover:text-foreground/80 hover:bg-white/[0.03] hover:border-l-foreground/20"
                }`}
              >
                <span className={`text-[9px] font-mono tabular-nums ${isActive ? "text-ember" : "text-foreground/25"}`}>{tab.no}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-rule/50 font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/30 space-y-1">
          <span className="block">Booths: 01</span>
          <span className="block">Region: Ahmedabad, IN</span>
          <span className="block text-emerald-400/70">● Online</span>
        </div>
      </aside>

      {/* ── MOBILE TAB BAR (visible below lg) ── */}
      <div className="lg:hidden fixed top-[57px] left-0 right-0 z-40 bg-black/95 border-b border-rule backdrop-blur-md">
        <div className="flex overflow-x-auto gap-1 p-2 scrollbar-none">
          {[
            { id: "projects", label: "01. Filmography" },
            { id: "experiences", label: "02. Shoots" },
            { id: "socials", label: "03. Social" },
            { id: "resume", label: "04. Resume" },
            { id: "starring", label: "05. Starring" },
            { id: "backstory", label: "06. Backstory" },
            { id: "skills", label: "07. Tools" },
            { id: "credits", label: "08. Credits" },
            { id: "analytics", label: "09. Log" },
            { id: "graphs", label: "10. Graphs" },
            { id: "feedback", label: "11. Reviews" },
            { id: "tips", label: "12. Tips" },
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
                className={`px-3 py-2 text-[9px] uppercase tracking-wider font-mono font-semibold transition-all duration-200 whitespace-nowrap border ${
                  isActive
                    ? "bg-ember text-black border-ember"
                    : "bg-black/40 text-foreground/45 border-rule/30 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA (offset for sidebar on desktop) ── */}
      <div className="pt-[110px] lg:pt-[73px] lg:pl-[240px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-10">

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
                  <p className="text-[9px] uppercase tracking-wider text-foreground/30 font-mono flex items-center gap-1.5">
                    <GripVertical className="h-3 w-3" /> Drag a reel to reposition it — numbers and order re-sequence automatically
                  </p>
                  {projectsList.map((p, idx) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={() => handleDragStart("projects", idx)}
                      onDragEnter={() => handleDragEnter("projects", idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        commitDrop("projects", idx);
                      }}
                      onDragEnd={() => setDragState(null)}
                      className={`border bg-card/45 p-6 flex items-center justify-between gap-6 transition-all duration-300 hover:border-ember/50 hover:bg-card/70 group cursor-grab active:cursor-grabbing ${
                        dragState?.list === "projects" && dragState.from === idx
                          ? "border-ember/70 opacity-40"
                          : dragState?.list === "projects" && dragState.over === idx
                          ? "border-ember border-dashed"
                          : "border-rule"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <GripVertical className="h-4 w-4 text-foreground/25 group-hover:text-ember/70 transition-colors shrink-0" />
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
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Reel No (Auto)</label>
                      <div className="w-full bg-black/50 border border-rule/50 px-4 py-3 text-sm text-foreground/60 font-mono">
                        {editingProject.id ? editingProject.no || HIDDEN_NO : "—"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Sorting Order (Auto)</label>
                      <div className="w-full bg-black/50 border border-rule/50 px-4 py-3 text-sm text-foreground/60 font-mono">
                        {editingProject.id ? editingProject.order ?? "—" : "—"}
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-foreground/30 font-mono uppercase tracking-wider relative z-10 -mt-3">
                    Set by dragging reels in the list. Hidden reels are skipped when numbering.
                  </p>

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
                      no: String(experiencesList.length + 1).padStart(2, "0"),
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
                  <p className="text-[9px] uppercase tracking-wider text-foreground/30 font-mono flex items-center gap-1.5">
                    <GripVertical className="h-3 w-3" /> Drag a shoot to reposition it — numbers and order re-sequence automatically
                  </p>
                  {experiencesList.map((e, idx) => (
                    <div
                      key={e.id}
                      draggable
                      onDragStart={() => handleDragStart("experiences", idx)}
                      onDragEnter={() => handleDragEnter("experiences", idx)}
                      onDragOver={(ev) => ev.preventDefault()}
                      onDrop={(ev) => {
                        ev.preventDefault();
                        commitDrop("experiences", idx);
                      }}
                      onDragEnd={() => setDragState(null)}
                      className={`border bg-card/45 p-6 flex items-center justify-between gap-6 transition-all duration-300 hover:border-ember/50 hover:bg-card/70 group cursor-grab active:cursor-grabbing ${
                        dragState?.list === "experiences" && dragState.from === idx
                          ? "border-ember/70 opacity-40"
                          : dragState?.list === "experiences" && dragState.over === idx
                          ? "border-ember border-dashed"
                          : "border-rule"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <GripVertical className="h-4 w-4 text-foreground/25 group-hover:text-ember/70 transition-colors shrink-0" />
                          <span className="text-ember font-semibold font-mono text-[14px]">#{e.no}</span>
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
                      <label className="block text-[9px] text-foreground/45 mb-2 uppercase font-mono tracking-wider">Shoot No / Order (Auto)</label>
                      <div className="w-full bg-black/50 border border-rule/50 px-4 py-3 text-sm text-foreground/60 font-mono">
                        {editingExperience.id
                          ? `#${editingExperience.no || HIDDEN_NO} · pos ${editingExperience.order ?? "—"}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-foreground/30 font-mono uppercase tracking-wider relative z-10 -mt-3">
                    Set by dragging shoots in the list. Hidden shoots are skipped when numbering.
                  </p>

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

        {/* ==================== ANALYTICS TAB ==================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="border border-rule bg-card p-6 sm:p-8 space-y-4 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rule pb-3 gap-2 relative z-10">
                <h3 className="text-sm text-ember uppercase tracking-widest font-semibold font-mono flex items-center gap-2">
                  ✦ Audience Analytics & Telemetry
                </h3>
                <button
                  onClick={fetchAnalytics}
                  disabled={analyticsLoading}
                  className="font-mono text-[9px] uppercase tracking-wider text-ember hover:text-white border border-ember/30 bg-ember/5 hover:bg-ember px-3 py-1 transition-all disabled:opacity-40"
                >
                  {analyticsLoading ? "Synching..." : "Refresh Logs"}
                </button>
              </div>

              {/* Loader */}
              {analyticsLoading && analyticsData.length === 0 && (
                <div className="py-12 text-center text-foreground/45 font-mono text-[10px] uppercase tracking-widest animate-pulse relative z-10">
                  Initializing telemetry feed...
                </div>
              )}

              {/* Error */}
              {analyticsError && (
                <div className="p-4 border border-red-500/40 bg-red-950/20 text-red-400 text-xs font-mono text-left space-y-2 relative z-10">
                  <p className="uppercase tracking-wider font-semibold text-[9px] text-red-500">✦ Connection Failure</p>
                  <p className="text-[10px] text-foreground/80">{analyticsError}</p>
                  <button
                    onClick={fetchAnalytics}
                    className="underline text-red-400 hover:text-red-300 font-mono text-[10px] uppercase"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty state */}
              {isConfigured && !analyticsLoading && !analyticsError && analyticsData.length === 0 && (
                <div className="border border-dashed border-rule p-12 text-center text-foreground/30 font-mono text-[10px] uppercase tracking-wider relative z-10">
                  No visitors recorded yet.
                </div>
              )}

              {/* Dashboard content */}
              {isConfigured && !analyticsLoading && !analyticsError && analyticsData.length > 0 && (
                <div className="space-y-8 relative z-10">
                  {/* Aggregate metric cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-rule bg-card/45 p-6">
                      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50 mb-2">
                        Unique Visitors
                      </p>
                      <p className="font-display text-4xl italic text-ember">
                        {metrics.uniqueVisitorCount}
                      </p>
                    </div>
                    <div className="border border-rule bg-card/45 p-6">
                      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50 mb-2">
                        Total Visits
                      </p>
                      <p className="font-display text-4xl italic text-ember">
                        {metrics.totalVisitCount}
                      </p>
                    </div>
                  </div>

                  {/* Breakdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Country breakdown */}
                    <div className="border border-rule bg-card/45 p-6 flex flex-col justify-between min-h-[270px]">
                      <div className="space-y-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50 border-b border-rule pb-3">
                          Top Countries
                        </p>
                        <div className="space-y-2">
                          {paginatedCountries.map((entry) => (
                            <div
                              key={entry.country}
                              onClick={() => filterVisitorLog(entry.country)}
                              className="flex items-center justify-between border-b border-rule/40 pb-2 hover:bg-white/[0.04] px-2 py-1.5 rounded cursor-pointer transition-all duration-200 group"
                              title={`Click to filter visitor log by ${entry.country}`}
                            >
                              <span className="font-mono text-xs text-foreground/80 group-hover:text-ember transition-colors">{entry.country || "Unknown"}</span>
                              <span className="font-mono text-xs text-ember font-bold">{entry.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {totalCountryPages > 1 && (
                        <div className="flex items-center justify-between font-mono text-[9px] pt-3 mt-2 border-t border-rule/20">
                          <span className="text-foreground/40 uppercase tracking-widest">
                            Page {currentCountryPage} / {totalCountryPages}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setCountryPage((p) => Math.max(p - 1, 1))}
                              disabled={currentCountryPage === 1}
                              className="p-1 border border-rule/50 bg-black text-foreground hover:bg-card hover:text-ember disabled:opacity-20 disabled:hover:text-foreground disabled:hover:bg-black transition-colors cursor-pointer"
                              title="Previous page"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCountryPage((p) => Math.min(p + 1, totalCountryPages))}
                              disabled={currentCountryPage === totalCountryPages}
                              className="p-1 border border-rule/50 bg-black text-foreground hover:bg-card hover:text-ember disabled:opacity-20 disabled:hover:text-foreground disabled:hover:bg-black transition-colors cursor-pointer"
                              title="Next page"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Browser breakdown */}
                    <div className="border border-rule bg-card/45 p-6 flex flex-col justify-between min-h-[270px]">
                      <div className="space-y-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50 border-b border-rule pb-3">
                          Top Browsers
                        </p>
                        <div className="space-y-2">
                          {paginatedBrowsers.map((entry) => (
                            <div
                              key={entry.browser}
                              onClick={() => filterVisitorLog(entry.browser)}
                              className="flex items-center justify-between border-b border-rule/40 pb-2 hover:bg-white/[0.04] px-2 py-1.5 rounded cursor-pointer transition-all duration-200 group"
                              title={`Click to filter visitor log by ${entry.browser}`}
                            >
                              <span className="font-mono text-xs text-foreground/80 group-hover:text-ember transition-colors">{entry.browser || "Unknown"}</span>
                              <span className="font-mono text-xs text-ember font-bold">{entry.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {totalBrowserPages > 1 && (
                        <div className="flex items-center justify-between font-mono text-[9px] pt-3 mt-2 border-t border-rule/20">
                          <span className="text-foreground/40 uppercase tracking-widest">
                            Page {currentBrowserPage} / {totalBrowserPages}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setBrowserPage((p) => Math.max(p - 1, 1))}
                              disabled={currentBrowserPage === 1}
                              className="p-1 border border-rule/50 bg-black text-foreground hover:bg-card hover:text-ember disabled:opacity-20 disabled:hover:text-foreground disabled:hover:bg-black transition-colors cursor-pointer"
                              title="Previous page"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setBrowserPage((p) => Math.min(p + 1, totalBrowserPages))}
                              disabled={currentBrowserPage === totalBrowserPages}
                              className="p-1 border border-rule/50 bg-black text-foreground hover:bg-card hover:text-ember disabled:opacity-20 disabled:hover:text-foreground disabled:hover:bg-black transition-colors cursor-pointer"
                              title="Next page"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visitors Table Header controls */}
                  <div className="border border-rule bg-card/45 space-y-4 p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50">
                          Visitor Log ({sortedAndFilteredVisitors.length} recorded)
                        </p>
                        {selectedVisitors.length > 0 && (
                          <button
                            type="button"
                            onClick={deleteSelectedVisitors}
                            className="bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 px-3 py-1 font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] animate-fade-in"
                          >
                            <Trash className="h-3 w-3" />
                            Delete Selected ({selectedVisitors.length})
                          </button>
                        )}
                      </div>
                      <div className="relative w-full sm:w-64">
                        <input
                          id="visitor-log-search"
                          type="text"
                          placeholder="Search IP, Country, City, Browser..."
                          value={visitorSearch}
                          onChange={(e) => {
                            setVisitorSearch(e.target.value);
                            setVisitorPage(1);
                          }}
                          className="bg-black border border-rule/65 pl-3 pr-8 py-1.5 outline-none focus:border-ember text-[11px] font-mono text-foreground placeholder-foreground/30 w-full transition-all"
                        />
                        {visitorSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setVisitorSearch("");
                              setVisitorPage(1);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/45 hover:text-ember transition-colors p-0.5 cursor-pointer"
                            title="Clear search filter"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-rule">
                            <th className="w-10 px-4 py-3 text-left">
                              <input
                                type="checkbox"
                                checked={isAllOnPageSelected}
                                onChange={toggleSelectAll}
                                className="accent-ember h-3.5 w-3.5 cursor-pointer bg-black border border-rule rounded-sm focus:ring-0 outline-none"
                              />
                            </th>
                            {[
                              { id: "ip", label: "IP Address" },
                              { id: "location", label: "Location" },
                              { id: "browser", label: "Browser" },
                              { id: "visitCount", label: "Visits" },
                              { id: "resumeClicks", label: "Resume" },
                              { id: "entryTime", label: "Entry Time" },
                              { id: "exitTime", label: "Exit Time" }
                            ].map((col) => (
                              <th
                                key={col.id}
                                onClick={() => handleHeaderClick(col.id)}
                                className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 cursor-pointer select-none hover:text-foreground transition-colors"
                              >
                                {col.label}
                                <span className="text-ember font-bold">{getSortIndicator(col.id)}</span>
                              </th>
                            ))}
                            <th className="text-right px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedVisitors.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="text-center py-6 font-mono text-xs text-foreground/35">
                                No records match search query.
                              </td>
                            </tr>
                          ) : (
                            paginatedVisitors.map((row, i) => {
                              const ipKey = row.ip || "unknown";
                              const isSelected = selectedVisitors.includes(ipKey);
                              const isOnline = (!row.exitTime || (row.entryTime && new Date(row.exitTime) < new Date(row.entryTime))) && (row.lastSeen && nowMs - new Date(row.lastSeen).getTime() < 30 * 60 * 1000);
                              const isBlocked = row.blocked === true;
                              return (
                                <tr key={row.id || i} className={`border-b border-rule/40 transition-colors ${isBlocked ? 'bg-red-950/15 hover:bg-red-950/25' : isSelected ? 'bg-ember/[0.03] hover:bg-ember/[0.05]' : 'hover:bg-white/[0.02]'}`}>
                                  <td className="px-4 py-3 text-left">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleSelectRow(ipKey)}
                                      className="accent-ember h-3.5 w-3.5 cursor-pointer bg-black border border-rule rounded-sm focus:ring-0 outline-none"
                                    />
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[11px] text-foreground/80">
                                    <span className="flex items-center gap-2">
                                      {isBlocked && <ShieldBan className="h-3 w-3 text-red-500 shrink-0" />}
                                      {row.ip || "unknown"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[11px] text-foreground/80">
                                    {row.city || "Unknown"}, {row.country || "Unknown"}
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[11px] text-foreground/80">{parseBrowserName(row.userAgent)}</td>
                                  <td className="px-4 py-3 font-mono text-[11px] text-ember font-semibold">{row.visitCount}</td>
                                  <td className="px-4 py-3 font-mono text-[11px] text-foreground/80">{row.resumeClicks ?? 0}</td>
                                  <td className="px-4 py-3 font-mono text-[11px] text-foreground/50" title={row.entryTime}>
                                    {row.entryTime ? formatRelativeTime(row.entryTime) : "—"}
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[11px]">
                                    {isOnline ? (
                                      <span className="inline-flex items-center gap-1.5 text-ember font-bold">
                                        <span className="relative flex h-1.5 w-1.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ember"></span>
                                        </span>
                                        Online
                                      </span>
                                    ) : (
                                      <span className="text-foreground/40" title={row.exitTime || row.lastSeen}>
                                        {row.exitTime ? formatRelativeTime(row.exitTime) : row.lastSeen ? `${formatRelativeTime(row.lastSeen)} (inactive)` : "—"}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => toggleBlockVisitor(row.ip, isBlocked)}
                                        className={`p-1 transition-all rounded ${
                                          isBlocked
                                            ? 'text-red-500 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30'
                                            : 'text-foreground/40 hover:text-ember hover:bg-ember/10'
                                        }`}
                                        title={isBlocked ? 'Unblock this IP' : 'Block this IP'}
                                      >
                                        {isBlocked ? <ShieldBan className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteVisitor(row.ip)}
                                        className="text-red-500/70 hover:text-red-400 p-1 bg-red-950/0 hover:bg-red-950/20 transition-all rounded"
                                        title="Delete Visitor Record"
                                      >
                                        <Trash className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalItems > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule/40 pt-4 font-mono text-[11px]">
                        <div className="flex items-center gap-4">
                          <span className="text-foreground/40">
                            Showing {startIndex + 1}-{Math.min(startIndex + visitorPageSize, totalItems)} of {totalItems}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-foreground/40">Show:</span>
                            <select
                              value={visitorPageSize}
                              onChange={(e) => {
                                setVisitorPageSize(Number(e.target.value));
                                setVisitorPage(1);
                              }}
                              className="bg-black border border-rule/50 text-foreground/80 px-2 py-0.5 font-mono text-[11px] focus:outline-none focus:border-ember transition-colors cursor-pointer"
                            >
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                            <span className="text-foreground/40">entries</span>
                          </div>
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setVisitorPage(1)}
                              disabled={currentPage === 1}
                              className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                            >
                              &lt;&lt;
                            </button>
                            <button
                              type="button"
                              onClick={() => setVisitorPage(p => Math.max(p - 1, 1))}
                              disabled={currentPage === 1}
                              className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                            >
                              &lt;
                            </button>
                            <span className="px-4 py-1.5 border border-rule/30 bg-card/20 text-foreground/80">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVisitorPage(p => Math.min(p + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                            >
                              &gt;
                            </button>
                            <button
                              type="button"
                              onClick={() => setVisitorPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                            >
                              &gt;&gt;
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== GRAPHS TAB ==================== */}
        {activeTab === "graphs" && (
          <div className="space-y-6">
            <div className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,123,0,0.03),transparent_50%)] pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rule pb-3 gap-2 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-sm text-ember uppercase tracking-widest font-semibold font-mono flex items-center gap-2">
                    ✦ Telemetry Trend Graphs
                  </h3>
                  <p className="text-[10px] text-foreground/40 font-mono uppercase tracking-wider">
                    Visualizing visitor metrics and audience traffic patterns
                  </p>
                </div>
                <button
                  onClick={fetchAnalytics}
                  disabled={analyticsLoading}
                  className="font-mono text-[9px] uppercase tracking-wider text-ember hover:text-white border border-ember/30 bg-ember/5 hover:bg-ember px-3 py-1 transition-all disabled:opacity-40"
                >
                  {analyticsLoading ? "Synching..." : "Refresh Feed"}
                </button>
              </div>

              {/* Loader */}
              {analyticsLoading && analyticsData.length === 0 && (
                <div className="py-12 text-center text-foreground/45 font-mono text-[10px] uppercase tracking-widest animate-pulse relative z-10">
                  Initializing telemetry feed...
                </div>
              )}

              {/* Error */}
              {analyticsError && (
                <div className="p-4 border border-red-500/40 bg-red-950/20 text-red-400 text-xs font-mono text-left space-y-2 relative z-10">
                  <p className="uppercase tracking-wider font-semibold text-[9px] text-red-500">✦ Connection Failure</p>
                  <p className="text-[10px] text-foreground/80">{analyticsError}</p>
                  <button
                    onClick={fetchAnalytics}
                    className="underline text-red-400 hover:text-red-300 font-mono text-[10px] uppercase"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty state */}
              {isConfigured && !analyticsLoading && !analyticsError && analyticsData.length === 0 && (
                <div className="border border-dashed border-rule p-12 text-center text-foreground/30 font-mono text-[10px] uppercase tracking-wider relative z-10">
                  No telemetry recorded yet.
                </div>
              )}

              {/* Graphs dashboard content */}
              {isConfigured && !analyticsLoading && !analyticsError && analyticsData.length > 0 && (
                <div className="space-y-8 relative z-10">
                  {(() => {
                    // Compute chart data based on filter
                    const buckets = new Map<string, number>();
                    const now = new Date();

                    analyticsData.forEach((v) => {
                      if (!v.firstSeen) return;
                      const d = new Date(v.firstSeen);
                      let key = "";
                      if (chartFilter === "day") {
                        key = d.toISOString().slice(0, 10); // YYYY-MM-DD
                      } else if (chartFilter === "month") {
                        key = d.toISOString().slice(0, 7); // YYYY-MM
                      } else {
                        key = String(d.getUTCFullYear()); // YYYY
                      }
                      buckets.set(key, (buckets.get(key) ?? 0) + 1);
                    });

                    // Generate all labels for the range in UTC to avoid timezone shifting/omitting
                    const allLabels: string[] = [];
                    if (chartFilter === "day") {
                      const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                      for (let i = 29; i >= 0; i--) {
                        const d = new Date(utcToday);
                        d.setUTCDate(d.getUTCDate() - i);
                        allLabels.push(d.toISOString().slice(0, 10));
                      }
                    } else if (chartFilter === "month") {
                      for (let i = 11; i >= 0; i--) {
                        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
                        allLabels.push(d.toISOString().slice(0, 7));
                      }
                    } else {
                      const years = Array.from(buckets.keys()).map(Number).filter(Boolean);
                      const currentUtcYear = now.getUTCFullYear();
                      if (years.length > 0) {
                        const minY = Math.min(...years);
                        const maxY = Math.max(...years, currentUtcYear);
                        for (let y = minY; y <= maxY; y++) allLabels.push(String(y));
                      } else {
                        allLabels.push(String(currentUtcYear));
                      }
                    }

                    const chartData = allLabels.map((label) => ({
                      label,
                      count: buckets.get(label) ?? 0,
                    }));
                    const maxCount = Math.max(...chartData.map((d) => d.count), 1);
                    const totalInPeriod = chartData.reduce((s, d) => s + d.count, 0);

                    // SVG dimensions
                    const svgW = 750;
                    const svgH = 290;
                    const padX = 40;
                    const padTop = 20;
                    const padBot = 65;
                    const plotW = svgW - padX * 2;
                    const plotH = svgH - padTop - padBot;

                    const points = chartData.map((d, i) => {
                      const x = padX + (chartData.length > 1 ? (i / (chartData.length - 1)) * plotW : plotW / 2);
                      const y = padTop + plotH - (d.count / maxCount) * plotH;
                      return { x, y, ...d };
                    });
                    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
                    const areaPath = points.length > 0
                      ? `M${points[0].x},${padTop + plotH} ` +
                        points.map((p) => `L${p.x},${p.y}`).join(" ") +
                        ` L${points[points.length - 1].x},${padTop + plotH} Z`
                      : "";

                    // Short label formatter
                    const shortLabel = (l: string) => {
                      if (chartFilter === "day") return l.slice(5); // MM-DD
                      if (chartFilter === "month") {
                        const [y, m] = l.split("-");
                        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                        return months[parseInt(m) - 1] || l;
                      }
                      return l;
                    };

                    return (
                      <div className="space-y-6">
                        {/* Filter controls & Header summary */}
                        <div className="flex items-center justify-between flex-wrap gap-4 border border-rule/35 bg-black/30 p-4">
                          <div className="space-y-1">
                            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/45">
                              Active Filter range
                            </p>
                            <p className="font-mono text-[11px] text-foreground/80">
                              Total new visitors tracked: <span className="text-ember font-bold">{totalInPeriod}</span>
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            {(["day", "month", "year"] as const).map((f) => (
                              <button
                                key={f}
                                onClick={() => setChartFilter(f)}
                                className={`px-4 py-2 font-mono text-[9px] uppercase tracking-wider border transition-all duration-200 ${
                                  chartFilter === f
                                    ? "bg-ember text-black border-ember font-bold"
                                    : "bg-black/40 text-foreground/45 border-rule/45 hover:text-foreground hover:border-rule"
                                }`}
                              >
                                {f === "day" ? "30 Days" : f === "month" ? "12 Months" : "Yearly"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Vertical stack of graphs to maximize width & prevent label truncation */}
                        <div className="space-y-6">
                          {/* Trend Line Chart */}
                          <div className="border border-rule bg-card/45 p-6 overflow-hidden flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center border-b border-rule pb-3 mb-4">
                                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">
                                  ✦ Trend Line Visualizer
                                </p>
                                <p className="font-mono text-[8px] text-foreground/30 uppercase tracking-widest">
                                  Peak: {maxCount} visits
                                </p>
                              </div>
                              <div className="w-full overflow-x-auto">
                                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[600px]" style={{ height: "240px" }}>
                                  <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="oklch(0.72 0.18 55)" stopOpacity="0.4" />
                                      <stop offset="100%" stopColor="oklch(0.72 0.18 55)" stopOpacity="0.01" />
                                    </linearGradient>
                                  </defs>

                                  {/* Grid lines */}
                                  {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                                    const y = padTop + plotH - frac * plotH;
                                    return (
                                      <g key={i}>
                                        <line x1={padX} y1={y} x2={svgW - padX} y2={y} stroke="oklch(0.94 0.02 85 / 0.08)" strokeWidth="1" />
                                        <text
                                          x={padX - 8}
                                          y={y + 3}
                                          textAnchor="end"
                                          fill="oklch(0.94 0.02 85 / 0.45)"
                                          fontSize="9"
                                          fontFamily="system-ui, -apple-system, sans-serif"
                                          fontWeight="500"
                                        >
                                          {Math.round(frac * maxCount)}
                                        </text>
                                      </g>
                                    );
                                  })}

                                  {/* Area fill */}
                                  {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                                  {/* Line */}
                                  {points.length > 1 && (
                                    <polyline
                                      points={polyline}
                                      fill="none"
                                      stroke="oklch(0.72 0.18 55)"
                                      strokeWidth="2.5"
                                      strokeLinejoin="round"
                                      strokeLinecap="round"
                                    />
                                  )}

                                  {/* Data points and rotated labels for ALL days */}
                                  {points.map((p, i) => (
                                    <g key={i}>
                                      <circle cx={p.x} cy={p.y} r="4" fill="oklch(0.72 0.18 55)" stroke="black" strokeWidth="1.5" />
                                      <title>{`${shortLabel(p.label)}: ${p.count} visitor${p.count !== 1 ? "s" : ""}`}</title>
                                      <text
                                        x={p.x}
                                        y={svgH - padBot + 15}
                                        textAnchor="end"
                                        fill="oklch(0.94 0.02 85 / 0.65)"
                                        fontSize="9.5"
                                        fontFamily="system-ui, -apple-system, sans-serif"
                                        fontWeight="600"
                                        transform={`rotate(-45, ${p.x}, ${svgH - padBot + 15})`}
                                      >
                                        {shortLabel(p.label)}
                                      </text>
                                    </g>
                                  ))}
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Bar Graph */}
                          <div className="border border-rule bg-card/45 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center border-b border-rule pb-3 mb-6">
                                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">
                                  ✦ Bar Distribution Graph
                                </p>
                              </div>
                              {/* The container has a height, and each child column has equal baseline */}
                              <div className="flex items-end gap-1.5 sm:gap-2 px-2" style={{ height: "160px" }}>
                                {chartData.map((d, i) => {
                                  const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                                  return (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative">
                                      {/* Tooltip */}
                                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-ember/50 px-2 py-0.5 font-mono text-[8px] text-ember whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                        {d.count} visitor{d.count !== 1 ? "s" : ""}
                                      </div>
                                      {/* Bar */}
                                      <div
                                        className="w-full rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-100"
                                        style={{
                                          height: `${Math.max(pct, d.count > 0 ? 3 : 0)}%`,
                                          background: d.count > 0
                                            ? "linear-gradient(to top, oklch(0.72 0.18 55 / 0.55), oklch(0.72 0.18 55))"
                                            : "oklch(0.94 0.02 85 / 0.06)",
                                          opacity: d.count > 0 ? 0.9 : 0.25,
                                          minHeight: d.count > 0 ? "5px" : "1.5px",
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Separate labels row to guarantee exact vertical alignment for all columns */}
                              <div className="flex gap-1.5 sm:gap-2 px-2 mt-3 h-14 relative overflow-visible">
                                {chartData.map((d, i) => (
                                  <div key={i} className="flex-1 flex items-start justify-center min-w-0 relative">
                                    <span className="absolute top-1 text-[9.5px] text-foreground/65 font-semibold tracking-wider whitespace-nowrap transform -rotate-45 origin-top-right -translate-x-[25%]">
                                      {shortLabel(d.label)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center border-b border-rule pb-4">
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-ember flex items-center gap-2">
                ✦ Audience Reviews & Critique
              </h2>
              <span className="font-mono text-[10px] text-foreground/45">
                {feedbackList.length} REVIEW{feedbackList.length !== 1 ? "S" : ""} RECORDED
              </span>
            </div>

            {(() => {
              const filteredFeedback = feedbackList.filter((item) => {
                if (feedbackFilterRating === "all") return true;
                return String(item.rating) === feedbackFilterRating;
              });

              const totalFeedbackItems = filteredFeedback.length;
              const totalFeedbackPages = Math.max(Math.ceil(totalFeedbackItems / feedbackPageSize), 1);
              const currentFeedbackPage = Math.min(feedbackPage, totalFeedbackPages);
              const feedbackStartIndex = (currentFeedbackPage - 1) * feedbackPageSize;
              const paginatedFeedback = filteredFeedback.slice(
                feedbackStartIndex,
                feedbackStartIndex + feedbackPageSize
              );

              return (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule/35 pb-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-foreground/45">RATING FILTER:</span>
                        <select
                          value={feedbackFilterRating}
                          onChange={(e) => {
                            setFeedbackFilterRating(e.target.value);
                            setFeedbackPage(1);
                          }}
                          className="bg-black border border-rule/50 text-foreground/80 px-2 py-1 font-mono text-[11px] focus:outline-none focus:border-ember transition-colors cursor-pointer"
                        >
                          <option value="all">All Ratings</option>
                          <option value="5">★★★★★ (5 Stars)</option>
                          <option value="4">★★★★☆ (4 Stars)</option>
                          <option value="3">★★★☆☆ (3 Stars)</option>
                          <option value="2">★★☆☆☆ (2 Stars)</option>
                          <option value="1">★☆☆☆☆ (1 Star)</option>
                        </select>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-foreground/45">
                      {totalFeedbackItems} MATCHING REVIEW{totalFeedbackItems !== 1 ? "S" : ""}
                    </span>
                  </div>

                  {feedbackLoading ? (
                    <div className="py-20 text-center font-mono text-[10px] text-foreground/40 uppercase tracking-widest flicker">
                      Loading database records...
                    </div>
                  ) : totalFeedbackItems === 0 ? (
                    <div className="py-20 text-center font-mono text-[10px] text-foreground/40 uppercase tracking-widest">
                      No matching reviews found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border border-rule/50 bg-black/40 overflow-x-auto rounded relative">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-rule bg-card/60">
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none w-10">
                                {/* Chevron */}
                              </th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                                Name
                              </th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                                Email
                              </th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                                Rating
                              </th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                                Date
                              </th>
                              <th className="text-right px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none w-20">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedFeedback.map((item, i) => {
                              const isExpanded = expandedFeedbackIds.includes(item.id);
                              return (
                                <React.Fragment key={item.id || i}>
                                  <tr 
                                    className="border-b border-rule/35 hover:bg-white/[0.02] transition-colors cursor-pointer" 
                                    onClick={() => toggleExpandFeedback(item.id)}
                                  >
                                    <td className="px-4 py-3 text-center">
                                      <span className="text-[10px] text-ember font-mono font-bold transition-transform inline-block">
                                        {isExpanded ? "▼" : "▶"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px] text-foreground font-bold">
                                      {item.name}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px]" onClick={(e) => e.stopPropagation()}>
                                      <a 
                                        href={`mailto:${item.email}`}
                                        className="text-ember hover:underline"
                                      >
                                        {item.email}
                                      </a>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px]">
                                      <div className="flex items-center text-amber-500 text-xs">
                                        {"★".repeat(item.rating || 0)}
                                        {"☆".repeat(5 - (item.rating || 0))}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px] text-foreground/50">
                                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => handleDeleteFeedback(item.id)}
                                        className="p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-all inline-flex items-center justify-center border border-rule/30"
                                        title="Delete review"
                                      >
                                        <Trash className="h-3.5 w-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                  
                                  {isExpanded && (
                                    <tr className="border-b border-rule/35 bg-black/50">
                                      <td colSpan={6} className="px-8 py-4 font-mono text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap border-l-2 border-ember">
                                        <div className="space-y-1">
                                          <div className="text-[8px] uppercase tracking-widest text-foreground/30 font-semibold">Critique & Suggestions Details</div>
                                          <p className="pl-2 border-l border-rule/40 text-foreground/90">{item.message}</p>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {totalFeedbackItems > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule/40 pt-4 font-mono text-[11px]">
                          <div className="flex items-center gap-4">
                            <span className="text-foreground/40">
                              Showing {feedbackStartIndex + 1}-{Math.min(feedbackStartIndex + feedbackPageSize, totalFeedbackItems)} of {totalFeedbackItems}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-foreground/40">Show:</span>
                              <select
                                value={feedbackPageSize}
                                onChange={(e) => {
                                  setFeedbackPageSize(Number(e.target.value));
                                  setFeedbackPage(1);
                                }}
                                className="bg-black border border-rule/50 text-foreground/80 px-2 py-0.5 font-mono text-[11px] focus:outline-none focus:border-ember transition-colors cursor-pointer"
                              >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                              </select>
                              <span className="text-foreground/40">entries</span>
                            </div>
                          </div>

                          {totalFeedbackPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setFeedbackPage(1)}
                                disabled={currentFeedbackPage === 1}
                                className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                              >
                                &lt;&lt;
                              </button>
                              <button
                                type="button"
                                onClick={() => setFeedbackPage(p => Math.max(p - 1, 1))}
                                disabled={currentFeedbackPage === 1}
                                className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                              >
                                &lt;
                              </button>
                              <span className="px-4 py-1.5 border border-rule/30 bg-card/20 text-foreground/80">
                                Page {currentFeedbackPage} of {totalFeedbackPages}
                              </span>
                              <button
                                type="button"
                                onClick={() => setFeedbackPage(p => Math.min(p + 1, totalFeedbackPages))}
                                disabled={currentFeedbackPage === totalFeedbackPages}
                                className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                              >
                                &gt;
                              </button>
                              <button
                                type="button"
                                onClick={() => setFeedbackPage(totalFeedbackPages)}
                                disabled={currentFeedbackPage === totalFeedbackPages}
                                className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                              >
                                &gt;&gt;
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {activeTab === "tips" && (
          <div className="border border-rule bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center border-b border-rule pb-4">
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-ember flex items-center gap-2">
                ✦ Placement & Interview Tips
              </h2>
              <span className="font-mono text-[10px] text-foreground/45">
                {tipsList.length} TIP{tipsList.length !== 1 ? "S" : ""} RECORDED
              </span>
            </div>

            {(() => {
              const totalTipsItems = tipsList.length;
              const totalTipsPages = Math.max(Math.ceil(totalTipsItems / tipsPageSize), 1);
              const currentTipsPage = Math.min(tipsPage, totalTipsPages);
              const tipsStartIndex = (currentTipsPage - 1) * tipsPageSize;
              const paginatedTips = tipsList.slice(
                tipsStartIndex,
                tipsStartIndex + tipsPageSize
              );

              return (
                <>
                  {tipsLoading ? (
                    <div className="py-20 text-center font-mono text-[10px] text-foreground/40 uppercase tracking-widest flicker">
                      Loading database records...
                    </div>
                  ) : totalTipsItems === 0 ? (
                    <div className="py-20 text-center font-mono text-[10px] text-foreground/40 uppercase tracking-widest">
                      No placement tips found yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border border-rule/50 bg-black/40 overflow-x-auto rounded relative">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-rule bg-card/60">
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none w-10">
                                {/* Chevron */}
                              </th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                                Email Address
                              </th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                                Company Name
                              </th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                                Tips
                              </th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none">
                                Date Submitted
                              </th>
                              <th className="text-right px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-foreground/40 select-none w-20">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedTips.map((item, i) => {
                              const isExpanded = expandedTipsIds.includes(item.id);
                              const snippet = item.message && item.message.length > 50 
                                ? item.message.slice(0, 50) + "..." 
                                : item.message;
                              return (
                                <React.Fragment key={item.id || i}>
                                  <tr 
                                    className="border-b border-rule/35 hover:bg-white/[0.02] transition-colors cursor-pointer" 
                                    onClick={() => toggleExpandTip(item.id)}
                                  >
                                    <td className="px-4 py-3 text-center">
                                      <span className="text-[10px] text-ember font-mono font-bold transition-transform inline-block">
                                        {isExpanded ? "▼" : "▶"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px]" onClick={(e) => e.stopPropagation()}>
                                      <a 
                                        href={`mailto:${item.email}`}
                                        className="text-ember hover:underline font-bold"
                                      >
                                        {item.email}
                                      </a>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px]">
                                      {item.isProfessional ? (
                                        <span className="text-amber-500 font-bold">💼 {item.companyName || "Professional"}</span>
                                      ) : (
                                        <span className="text-foreground/35">Individual</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px] text-foreground/70">
                                      {snippet}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px] text-foreground/50">
                                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => handleDeleteTip(item.id)}
                                        className="p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-all inline-flex items-center justify-center border border-rule/30"
                                        title="Delete tip"
                                      >
                                        <Trash className="h-3.5 w-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                  
                                  {isExpanded && (
                                    <tr className="border-b border-rule/35 bg-black/50">
                                      <td colSpan={6} className="px-8 py-4 font-mono text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap border-l-2 border-ember">
                                        <div className="space-y-3">
                                          {item.isProfessional && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#111] p-2 border border-rule/40 rounded text-[10px]">
                                              <div>
                                                <span className="text-foreground/45 block uppercase text-[8px]">Full Name</span>
                                                <span className="font-bold text-foreground/90">{item.fullName || "N/A"}</span>
                                              </div>
                                              <div>
                                                <span className="text-foreground/45 block uppercase text-[8px]">Company</span>
                                                <span className="font-bold text-amber-500">{item.companyName || "N/A"}</span>
                                              </div>
                                              <div>
                                                <span className="text-foreground/45 block uppercase text-[8px]">Contact Number</span>
                                                <span className="font-bold text-foreground/90">{item.contactNumber || "N/A"}</span>
                                              </div>
                                            </div>
                                          )}
                                          <div className="space-y-1">
                                            <div className="text-[8px] uppercase tracking-widest text-foreground/30 font-semibold">Placement Tip & Advice details</div>
                                            <p className="pl-2 border-l border-rule/40 text-foreground/90">{item.message}</p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {totalTipsItems > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule/40 pt-4 font-mono text-[11px]">
                          <div className="flex items-center gap-4">
                            <span className="text-foreground/40">
                              Showing {tipsStartIndex + 1}-{Math.min(tipsStartIndex + tipsPageSize, totalTipsItems)} of {totalTipsItems}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-foreground/40">Show:</span>
                              <select
                                value={tipsPageSize}
                                onChange={(e) => {
                                  setTipsPageSize(Number(e.target.value));
                                  setTipsPage(1);
                                }}
                                className="bg-black border border-rule/50 text-foreground/80 px-2 py-0.5 font-mono text-[11px] focus:outline-none focus:border-ember transition-colors cursor-pointer"
                              >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                              </select>
                              <span className="text-foreground/40">entries</span>
                            </div>
                          </div>

                          {totalTipsPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setTipsPage(1)}
                                disabled={currentTipsPage === 1}
                                className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                              >
                                &lt;&lt;
                              </button>
                              <button
                                type="button"
                                onClick={() => setTipsPage(p => Math.max(p - 1, 1))}
                                disabled={currentTipsPage === 1}
                                className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                              >
                                &lt;
                              </button>
                              <span className="px-4 py-1.5 border border-rule/30 bg-card/20 text-foreground/80">
                                Page {currentTipsPage} of {totalTipsPages}
                              </span>
                              <button
                                type="button"
                                onClick={() => setTipsPage(p => Math.min(p + 1, totalTipsPages))}
                                disabled={currentTipsPage === totalTipsPages}
                                className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                              >
                                &gt;
                              </button>
                              <button
                                type="button"
                                onClick={() => setTipsPage(totalTipsPages)}
                                disabled={currentTipsPage === totalTipsPages}
                                className="px-2.5 py-1.5 border border-rule/50 bg-black text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-black transition-colors"
                              >
                                &gt;&gt;
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-rule bg-card/90 p-1 shadow-2xl relative">
            {/* Clapperboard stripes */}
            <div className="border border-rule/40 bg-black overflow-hidden flex h-6 items-center relative mb-4">
              <div className="absolute inset-0 flex" style={{ background: "repeating-linear-gradient(-45deg, #000, #000 10px, #ff7b00 10px, #ff7b00 20px)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            
            <div className="p-6 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="font-display text-2xl italic tracking-wide text-foreground">
                  {confirmModal.title}
                </h3>
                <p className="font-mono text-xs text-foreground/60 leading-relaxed break-all">
                  {confirmModal.message}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 border border-rule bg-black/40 hover:bg-black/80 text-foreground/75 hover:text-foreground font-mono text-[10px] uppercase tracking-widest py-3 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 border border-ember bg-ember/15 text-ember hover:bg-ember hover:text-black font-mono text-[10px] uppercase tracking-widest py-3 font-semibold transition-colors cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
