import { PrismaClient } from "../src/generated/prisma/index.js";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

/**
 * Keep validation simple and consistent with the ticket.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

type SmtpEnv = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

function getSmtpEnv(): SmtpEnv | null {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  // Optional: allow SMTP_SECURE=true to force TLS
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  if (!host || !portRaw || !user || !pass || !from) return null;

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) return null;

  return { host, port, user, pass, from, secure };
}

async function sendWaitlistAdminEmail(newUserEmail: string): Promise<void> {
  const smtp = getSmtpEnv();
  if (!smtp) {
    // In prod you likely want this configured; but per requirements, don't break endpoint
    console.error(
      "[waitlist-email] Missing/invalid SMTP env vars. Expected SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM (optional SMTP_SECURE)."
    );
    return;
  }

  // 1) Identify admin recipients
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });

  const recipients = admins
    .map((a) => a.email)
    .filter((e): e is string => typeof e === "string" && e.length > 0);

  if (recipients.length === 0) {
    console.warn("[waitlist-email] No admin recipients found (role=ADMIN).");
    return;
  }
  console.log(
  `[waitlist-email] Sending email to ${recipients.length} admin(s):`,
  recipients
)

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure, // true for 465, false for 587/other
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  // Optional sanity check; can be noisy locally, but helps debugging
  // await transporter.verify();

  const dashboardUrl =
    process.env.ADMIN_DASHBOARD_URL || "Open the admin dashboard to review.";

  const subject = `New waitlist signup: ${newUserEmail}`;
  const text = [
    "A new user has joined the waitlist.",
    "",
    `Email: ${newUserEmail}`,
    "",
    `Review: ${dashboardUrl}`,
  ].join("\n");

  await transporter.sendMail({
    from: smtp.from,
    to: recipients, // array is fine
    subject,
    text,
  });
}

// POST /api/waitlist
export default async function handler(req: any, res: any) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user already exists with this email (waitlisted or not)
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    if (existingUser) {
      return res.status(409).json({ error: "A user with this email already exists" });
    }

    // Create new waitlisted user with empty fields
    const newUser = await prisma.user.create({
      data: {
        email,
        role: "VIEWER",
        isWaitlisted: true,
        firstName: "",
        lastName: "",
        username: email.split("@")[0] + "_" + Date.now(),
        password: "",
        phone: "",
      },
      select: {
        email: true,
        role: true,
      },
    });

    // 2) Trigger email AFTER successful waitlist creation (non-blocking)
    void sendWaitlistAdminEmail(newUser.email).catch((err) => {
      console.error("[waitlist-email] Failed to send admin email:", err);
    });

    return res.status(201).json({
      message: "Successfully added to waitlist",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating waitlist user:", error);
    return res.status(500).json({ error: "Failed to add user to waitlist" });
  }

}