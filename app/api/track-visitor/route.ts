import { NextResponse } from "next/server";
import { adminDb, adminConfigured } from "../../../lib/firebase-admin";
import { extractIp, isLocalOrUnknown, sanitizeIp } from "../../../lib/analytics";
import { FieldValue } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// Interfaces & constants
// ---------------------------------------------------------------------------

interface GeoData {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  isp: string;
}

const GEO_FALLBACK: GeoData = {
  country: "Unknown",
  countryCode: "--",
  city: "Unknown",
  region: "Unknown",
  lat: 0,
  lon: 0,
  isp: "Unknown",
};

// ---------------------------------------------------------------------------
// Geo lookup
// ---------------------------------------------------------------------------

async function fetchGeoData(ip: string): Promise<GeoData> {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,region,lat,lon,isp`,
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();
    if (data.status !== "success") return GEO_FALLBACK;
    return {
      country: data.country ?? "Unknown",
      countryCode: data.countryCode ?? "--",
      city: data.city ?? "Unknown",
      region: data.region ?? "Unknown",
      lat: data.lat ?? 0,
      lon: data.lon ?? 0,
      isp: data.isp ?? "Unknown",
    };
  } catch {
    return GEO_FALLBACK;
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // Validate request body
  let sessionId: string;
  let userAgent: string;
  let clientIp: string | undefined;

  try {
    const body = await request.json();
    sessionId = body.sessionId;
    userAgent = body.userAgent ?? "";
    clientIp = body.clientIp;
  } catch {
    return NextResponse.json({ error: "Missing or invalid sessionId" }, { status: 400 });
  }

  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return NextResponse.json({ error: "Missing or invalid sessionId" }, { status: 400 });
  }

  // Firebase Admin not configured early exit
  if (!adminConfigured) {
    console.warn("Track-visitor: Firebase Admin SDK not configured. Skipping.");
    return NextResponse.json({ tracked: false, reason: "firebase_admin_not_configured" });
  }

  // IP extraction
  let ip = extractIp(request.headers as Headers);
  if (isLocalOrUnknown(ip) && clientIp && typeof clientIp === "string" && clientIp.length > 0) {
    ip = clientIp;
  }
  const sanitizedIp = sanitizeIp(ip);

  // Firestore logic using Admin SDK (bypasses security rules)
  try {
    const docRef = adminDb.collection("visitors").doc(sanitizedIp);
    const snap = await docRef.get();

    if (!snap.exists) {
      // New visitor — fetch geolocation
      let geo: GeoData;
      if (isLocalOrUnknown(ip)) {
        geo = GEO_FALLBACK;
      } else {
        geo = await fetchGeoData(ip);
      }

      const now = new Date().toISOString();
      await docRef.set({
        ip,
        ...geo,
        userAgent,
        firstSeen: now,
        lastSeen: now,
        visitCount: 1,
        sessionIds: [sessionId],
        entryTime: now,
        exitTime: "",
        resumeClicks: 0,
      });

      return NextResponse.json({ tracked: true, new: true });
    } else {
      // Existing visitor
      const data = snap.data()!;
      const now = new Date().toISOString();

      // Check for duplicate session (same tab reload shouldn't recount, but mark active again)
      if (data.sessionIds && data.sessionIds.includes(sessionId)) {
        await docRef.update({
          exitTime: "",
          lastSeen: now,
        });
        return NextResponse.json({ tracked: true, reason: "duplicate_session_reactivated" });
      }

      // New session for existing IP — increment visit count
      await docRef.update({
        lastSeen: now,
        visitCount: FieldValue.increment(1),
        sessionIds: FieldValue.arrayUnion(sessionId),
        userAgent,
        entryTime: now,
        exitTime: "",
      });

      return NextResponse.json({ tracked: true, returning: true });
    }
  } catch (err: any) {
    console.error("Track-visitor Firestore error:", err.message || err);
    return NextResponse.json({ tracked: false, reason: "firestore_error", detail: err.message });
  }
}
