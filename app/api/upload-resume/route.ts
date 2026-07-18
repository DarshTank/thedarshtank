import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const email = formData.get("email") as string;

    const allowedEmail = process.env.ADMIN_EMAIL;
    if (!allowedEmail) {
      return NextResponse.json({ error: "Server misconfiguration: ADMIN_EMAIL not set" }, { status: 500 });
    }

    // Simple security check: Ensure it matches the authorized email
    if (email !== allowedEmail) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to the public folder
    const publicPath = join(process.cwd(), "public", "resume.pdf");
    await writeFile(publicPath, buffer);

    console.log(`✓ Resume PDF saved locally to public/resume.pdf`);
    return NextResponse.json({ 
      success: true, 
      url: "/resume.pdf", 
      name: file.name 
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save file" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();
    const allowedEmail = process.env.ADMIN_EMAIL;
    if (!allowedEmail) {
      return NextResponse.json({ error: "Server misconfiguration: ADMIN_EMAIL not set" }, { status: 500 });
    }
    if (email !== allowedEmail) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const publicPath = join(process.cwd(), "public", "resume.pdf");
    if (existsSync(publicPath)) {
      await unlink(publicPath);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete file" }, { status: 500 });
  }
}
