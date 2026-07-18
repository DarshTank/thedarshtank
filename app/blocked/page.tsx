"use client";

import { useEffect, useState } from "react";

export default function BlockedPage() {
  const [dots, setDots] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("Restricted Connection Appeal");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error" | "smtp_missing">("idle");
  const [contactError, setContactError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const i = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 600);
    return () => clearInterval(i);
  }, []);

  // Poll block status every 15 seconds. If unblocked, redirect back to main page.
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
            // Can't retrieve IP — try again on next interval
            return;
          }
        }

        if (!clientIp) return;

        const res = await fetch(`/api/check-blocked?ip=${encodeURIComponent(clientIp)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.blocked === false) {
            window.location.href = "/";
          }
        }
      } catch {
        // Fail-safe
      }
    };

    checkBlocked();

    const interval = setInterval(checkBlocked, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) return;

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
        throw new Error(data.error || "Failed to send appeal.");
      }

      setContactStatus("success");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      console.error(err);
      setContactStatus("error");
      setContactError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-foreground flex flex-col items-center justify-center overflow-hidden px-6 text-center py-16">
      {/* Film grain */}
      <div className="grain pointer-events-none fixed inset-0 z-10" style={{ opacity: 0.5 }} />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Scanlines */}
      <div className="scan pointer-events-none fixed inset-0 z-10 opacity-25" />

      {/* Content */}
      <div className="relative z-20 max-w-lg space-y-8">
        {/* Projector reel icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-red-500/30 bg-red-950/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9.1 12 1.8 1.8 4-4" style={{ display: "none" }} />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-red-500">
            — Access Restricted —
          </p>
          <h1
            className="font-display text-[clamp(2.8rem,10vw,5.5rem)] leading-[0.9] italic tracking-tight"
            style={{ textShadow: "0 0 60px rgba(239, 68, 68, 0.2)" }}
          >
            This screening
            <br />
            is <span className="text-red-500">unavailable</span>.
          </h1>
        </div>

        <p className="text-sm leading-relaxed text-foreground/50 max-w-md mx-auto">
          Access to this portfolio has been restricted for your connection.
          If you believe this is a mistake, please{" "}
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-red-500 hover:text-red-400 underline cursor-pointer focus:outline-none transition-colors"
          >
            reach out to the director
          </button>{" "}
          directly.
        </p>

        {showForm && (
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 font-mono text-sm text-left max-w-md mx-auto border border-red-500/20 bg-black/60 p-6 shadow-xl relative transition-all duration-300"
          >
            <div>
              <label htmlFor="contact-email" className="block text-[10px] uppercase tracking-wider text-red-500/80 mb-2">
                Sender Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="yourname@domain.com"
                className="w-full bg-black/40 border border-red-500/20 px-4 py-3 text-foreground placeholder-foreground/20 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-[10px] uppercase tracking-wider text-red-500/80 mb-2">
                Description / Appeal Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Explain why your access should be restored..."
                className="w-full bg-black/40 border border-red-500/20 px-4 py-3 text-foreground placeholder-foreground/20 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            {contactStatus === "success" && (
              <div className="text-emerald-500 text-xs">
                ✓ Appeal sent successfully! The director will review it.
              </div>
            )}

            {contactStatus === "smtp_missing" && (
              <div className="text-red-500 text-xs space-y-2">
                <p>⚠ Email server is not configured.</p>
                <a
                  href={`mailto:darshtank05@gmail.com?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(contactMessage)}`}
                  className="inline-flex items-center gap-1 border-b border-red-500 text-red-500 font-bold hover:text-foreground hover:border-foreground transition-colors"
                >
                  Send via your email application
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
              className="w-full bg-red-950/20 hover:bg-red-900/40 border border-red-500/40 text-red-500 hover:text-foreground text-xs uppercase tracking-wider py-3 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {contactStatus === "sending" ? "Submitting appeal..." : "✦ Submit Appeal"}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/25">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>Signal blocked{dots}</span>
        </div>
      </div>

      {/* Bottom film strip decoration */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-red-500/15 bg-black/80 py-4 text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/20">
          © {new Date().getFullYear()} Darsh Tank · Projection Denied
        </p>
      </div>
    </main>
  );
}
