import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, subject, message, rating, isTip, fullName, contactNumber, companyName } = await request.json();

    if (!email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const gmailTo = process.env.GMAIL_TO;

    if (!gmailUser || !gmailAppPassword || !gmailTo) {
      console.warn("GMAIL_USER, GMAIL_APP_PASSWORD, or GMAIL_TO is not configured in .env");
      return NextResponse.json({
        success: false,
        error: "SMTP_NOT_CONFIGURED",
        message: "Gmail SMTP credentials or recipient email not found. Please configure GMAIL_USER, GMAIL_APP_PASSWORD, and GMAIL_TO in .env."
      }, { status: 501 });
    }

    // Configure Nodemailer transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const isReview = typeof rating === "number" && !isTip;
    
    let mailSubject = `~darshtank.in: ${subject}`;
    let mailHeader = "✦ NEW MESSAGE";

    if (isTip) {
      mailSubject = `~darshtank.in Placement Tip: ${subject}`;
      mailHeader = "✦ NEW PLACEMENT TIP";
    } else if (isReview) {
      mailSubject = `~darshtank.in [Review]: ${rating}/5 Stars - ${subject}`;
      mailHeader = "✦ NEW PORTFOLIO RATING";
    }

    const mailOptions = {
      from: `"darshtank.in" <${gmailUser}>`,
      to: gmailTo,
      replyTo: email,
      subject: mailSubject,
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; background-color: #0c0c0c; color: #e5e7eb; border: 1px solid #262626; border-radius: 8px;">
          <h2 style="color: #f97316; font-size: 20px; margin-top: 0; border-bottom: 1px solid #262626; padding-bottom: 12px; font-family: monospace;">
            ${mailHeader}
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #a3a3a3; width: 100px; font-family: monospace;">SENDER:</td>
              <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #f5f5f7;">${email}</td>
            </tr>
            ${fullName ? `
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #a3a3a3; font-family: monospace;">NAME:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #f5f5f7;">${fullName}</td>
            </tr>
            ` : ""}
            ${companyName ? `
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #a3a3a3; font-family: monospace;">COMPANY:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #f5f5f7;">${companyName}</td>
            </tr>
            ` : ""}
            ${contactNumber ? `
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #a3a3a3; font-family: monospace;">CONTACT:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #f5f5f7;">${contactNumber}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #a3a3a3; font-family: monospace;">SUBJECT:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #f5f5f7;">${subject}</td>
            </tr>
            ${isReview ? `
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #a3a3a3; font-family: monospace;">RATING:</td>
              <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #f97316;">${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)</td>
            </tr>
            ` : ""}
          </table>
          <div style="background-color: #171717; padding: 16px; border-left: 3px solid #f97316; border-radius: 4px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✓ Email from ${email} successfully sent via Gmail SMTP!`);
    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error: any) {
    console.error("Gmail SMTP Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
