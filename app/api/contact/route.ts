import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, subject, message } = await request.json();

    if (!email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not configured in .env");
      return NextResponse.json({
        success: false,
        error: "SMTP_NOT_CONFIGURED",
        message: "Resend API key not found. Please configure RESEND_API_KEY in .env to receive direct emails."
      }, { status: 501 });
    }

    // Call Resend API directly via HTTP fetch
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "thedarshtank <onboarding@resend.dev>",
        to: "darshtank05@gmail.com",
        reply_to: email,
        subject: `~thedarshtank ${subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; background-color: #0c0c0c; color: #e5e7eb; border: 1px solid #262626; border-radius: 8px;">
            <h2 style="color: #f97316; font-size: 20px; margin-top: 0; border-bottom: 1px solid #262626; padding-bottom: 12px; font-family: monospace;">✦ NEW SCENE</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #a3a3a3; width: 80px; font-family: monospace;">SENDER:</td>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #f5f5f7;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #a3a3a3; font-family: monospace;">SUBJECT:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #f5f5f7;">${subject}</td>
              </tr>
            </table>
            <div style="background-color: #171717; padding: 16px; border-left: 3px solid #f97316; border-radius: 4px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email via Resend");
    }

    console.log(`✓ Email from ${email} successfully sent via Resend API!`);
    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error: any) {
    console.error("Resend API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
