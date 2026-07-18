import { NextResponse } from "next/server";
import { adminDb, adminConfigured } from "../../../lib/firebase-admin";
import { sanitizeIp } from "../../../lib/analytics";

/**
 * GET /api/check-blocked?ip=<ip_address>
 *
 * Checks whether a visitor IP is blocked in Firestore.
 * Called by the Edge Middleware before serving pages.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    return NextResponse.json({ blocked: false });
  }

  if (!adminConfigured) {
    return NextResponse.json({ blocked: false });
  }

  try {
    const docId = sanitizeIp(ip);
    const snap = await adminDb.collection("visitors").doc(docId).get();

    if (!snap.exists) {
      return NextResponse.json({ blocked: false });
    }

    const data = snap.data();
    return NextResponse.json({ blocked: data?.blocked === true });
  } catch (err: any) {
    console.error("check-blocked error:", err.message || err);
    return NextResponse.json({ blocked: false });
  }
}
