import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const email = formData.get("email") as string;

    const allowedEmail = process.env.ADMIN_EMAIL;
    if (!allowedEmail) {
      return NextResponse.json(
        { error: "Server misconfiguration: ADMIN_EMAIL not set" },
        { status: 500 }
      );
    }

    if (email !== allowedEmail) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Server misconfiguration: BLOB_READ_WRITE_TOKEN environment variable not set" },
        { status: 500 }
      );
    }

    // Upload directly to Vercel Blob store
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobPath = `resumes/${Date.now()}-${safeFilename}`;

    const blob = await put(blobPath, file, {
      access: "public",
      token,
    });

    console.log(`✓ Resume uploaded to Vercel Blob: ${blob.url}`);

    return NextResponse.json({
      success: true,
      url: blob.url,
      name: file.name,
    });
  } catch (error: any) {
    console.error("Vercel Blob Upload API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload resume to Vercel Blob" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { email, resumeUrl } = await request.json();
    const allowedEmail = process.env.ADMIN_EMAIL;
    if (!allowedEmail) {
      return NextResponse.json(
        { error: "Server misconfiguration: ADMIN_EMAIL not set" },
        { status: 500 }
      );
    }
    if (email !== allowedEmail) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (resumeUrl && token) {
      try {
        await del(resumeUrl, { token });
        console.log(`✓ Deleted resume from Vercel Blob: ${resumeUrl}`);
      } catch (delError) {
        console.warn("Failed to delete blob file:", delError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Vercel Blob Delete API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resume from Vercel Blob" },
      { status: 500 }
    );
  }
}
