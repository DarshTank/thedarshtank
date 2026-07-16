import { NextResponse } from "next/server";
import { adminDb, adminConfigured } from "../../../lib/firebase-admin";
import { extractIp, isLocalOrUnknown, sanitizeIp } from "../../../lib/analytics";

export async function POST(request: Request) {
  let sessionId = "";
  let clientIp = "";

  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text);
      sessionId = body.sessionId || "";
      clientIp = body.clientIp || "";
    }
  } catch {
    try {
      const body = await request.json();
      sessionId = body.sessionId || "";
      clientIp = body.clientIp || "";
    } catch {
      return NextResponse.json({ error: "Missing or invalid request body" }, { status: 400 });
    }
  }

  if (!sessionId) {
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

    if (snap.exists) {
      const data = snap.data()!;
      if (data.sessionIds && data.sessionIds.includes(sessionId)) {
        await docRef.update({
          exitTime: now,
        });
      }
    }

    return NextResponse.json({ tracked: true, event: "exit" });
  } catch (err: any) {
    console.error("Track-exit Firestore error:", err.message || err);
    return NextResponse.json({ tracked: false, reason: "firestore_error", detail: err.message });
  }
}
