import { NextResponse } from "next/server";
import { adminDb, adminConfigured } from "../../../lib/firebase-admin";
import { extractIp, isLocalOrUnknown, sanitizeIp } from "../../../lib/analytics";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  let sessionId: string;
  let clientIp: string | undefined;

  try {
    const body = await request.json();
    sessionId = body.sessionId;
    clientIp = body.clientIp;
  } catch {
    return NextResponse.json({ error: "Missing or invalid request body" }, { status: 400 });
  }

  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return NextResponse.json({ error: "Missing or invalid sessionId" }, { status: 400 });
  }

  if (!adminConfigured) {
    return NextResponse.json({ tracked: false, reason: "firebase_admin_not_configured" });
  }

  let ip = extractIp(request.headers as Headers);
  if (isLocalOrUnknown(ip) && clientIp && typeof clientIp === "string" && clientIp.length > 0) {
    ip = clientIp;
  }
  const sanitizedIp = sanitizeIp(ip);

  try {
    const docRef = adminDb.collection("visitors").doc(sanitizedIp);
    const snap = await docRef.get();
    const now = new Date().toISOString();

    if (!snap.exists) {
      await docRef.set({
        ip,
        firstSeen: now,
        lastSeen: now,
        visitCount: 1,
        sessionIds: [sessionId],
        resumeClicks: 1,
        lastResumeClicked: now,
        entryTime: now,
        exitTime: "",
      });
    } else {
      await docRef.update({
        resumeClicks: FieldValue.increment(1),
        lastResumeClicked: now,
      });
    }

    return NextResponse.json({ tracked: true, event: "resume_click" });
  } catch (err: any) {
    console.error("Track-resume Firestore error:", err.message || err);
    return NextResponse.json({ tracked: false, reason: "firestore_error", detail: err.message });
  }
}
