import { clerkClient } from "@clerk/express";
import { PrismaClient } from "../src/generated/prisma/index.js";
import nodemailer from "nodemailer";
const prisma = new PrismaClient();

// checks if an email is of the right format
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

  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  if (!host || !portRaw || !user || !pass || !from) return null;

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) return null;

  return { host, port, user, pass, from, secure };
}

async function sendWaitlistAdminEmail(
  newUserEmail: string,
  firstName: string,
  lastName: string,
): Promise<void> {
  console.log("[waitlist-email] called for:", newUserEmail);

  const smtp = getSmtpEnv();
  if (!smtp) {
    console.error("[waitlist-email] Missing/invalid SMTP env vars.");
    return;
  }

  console.log("[waitlist-email] querying admins from Clerk...");

  // Fetch users (returns PaginatedResourceResponse<User[]>)
  const allUsers = await clerkClient.users.getUserList({ limit: 100 });

  // Access the actual array
  const userArray = allUsers.data;

  // Filter for admins based on publicMetadata.role
  const admins = userArray.filter(
    (u: any) =>
      u.publicMetadata?.role === "ADMIN" && u.emailAddresses.length > 0,
  );

  // Map to email addresses
  const recipients = admins
    .map((u: any) => u.emailAddresses[0].emailAddress)
    .filter((e: any): e is string => !!e);

  if (recipients.length === 0) {
    console.warn(
      "[waitlist-email] No admin recipients found in Clerk (role=ADMIN).",
    );
    return;
  }

  console.log(
    `[waitlist-email] Sending email to ${recipients.length} admin(s):`,
    recipients,
  );

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const dashboardUrl =
    process.env.ADMIN_DASHBOARD_URL || "[ADMIN DASHBOARD PLACEHOLDER URL]";

  const subject = `New waitlist signup: ${firstName} ${lastName} (${newUserEmail})`;
  const text = [
    "A new user has joined the waitlist.",
    "",
    `Name: ${firstName} ${lastName}`,
    `Email: ${newUserEmail}`,
    "",
    `Review: ${dashboardUrl}/admin`,
  ].join("\n");

  console.log("[waitlist-email] sending via nodemailer...");
  const info = await transporter.sendMail({
    from: smtp.from,
    to: recipients,
    subject,
    text,
  });

  console.log(
    "[waitlist-email] Email successfully sent. messageId:",
    info.messageId,
  );
}

export default async function handler(req: any, res: any) {
  console.log("req.method:", req.method);
  console.log("req.body:", req.body);
  const method = req.method;

  if (method === "GET") {
    try {
      const entries = await prisma.waitlist.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });
      return res.status(200).json(entries);
    } catch (error: any) {
      console.error("Error fetching waitlist users:", error);
      return res.status(500).json({ error: "Failed to fetch waitlist users" });
    }
  } else if (method === "POST") {
    // ---------------- ADD TO WAITLIST ----------------
    try {
      const rawFirstName = String(req.body?.firstName ?? "").trim();
      const rawLastName = String(req.body?.lastName ?? "").trim();
      const email = String(req.body?.email ?? "").trim().toLowerCase();
      console.log("Checking Clerk API for email:", email);

      if (!rawFirstName || !rawLastName || !email) {
        return res.status(400).json({
          error: "First name, last name, and email are required",
        });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Checks if user already exists on Waitlist or in Clerk
      const [existingWaitlist, existingClerkUsers] = await Promise.all([
        prisma.waitlist.findUnique({ where: { email } }),
        clerkClient.users.getUserList({ emailAddress: [email] }),
      ]);

      if (existingClerkUsers.data.length > 0) {
        return res.status(409).json({
          error: "An account with this email already exists",
          code: "CLERK_DUPLICATE",
        });
      } else if (existingWaitlist) {
        return res.status(409).json({
          error: "This email is already on the waitlist",
          code: "WAITLIST_DUPLICATE",
        });
      }

      // Creates a new entry and adds it to the db
      const newEntry = await prisma.waitlist.create({
        data: { email, firstName: rawFirstName, lastName: rawLastName },
      });

      try {
        await sendWaitlistAdminEmail(newEntry.email, rawFirstName, rawLastName);
      } catch (err) {
        console.error("[waitlist-email] Failed to send admin email:", err);
      }

      return res.status(201).json({
        message: "Successfully added to waitlist",
        data: {
          email: newEntry.email,
          firstName: newEntry.firstName,
          lastName: newEntry.lastName,
        },
      });
    } catch (error: any) {
      console.error("Error creating waitlist user:", error);

      return res.status(500).json({
        error: "Failed to add user to waitlist",
      });
    }
  } else if (method === "DELETE") {
    // ---------------- REMOVE FROM WAITLIST ----------------
    try {
      const email: string = String(req.body.email).trim().toLowerCase();

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const existingWaitlist = await prisma.waitlist.findUnique({
        where: { email },
      });

      if (!existingWaitlist) {
        return res.status(404).json({
          error: "This email is not on the waitlist",
        });
      }

      await prisma.waitlist.delete({ where: { email } });

      return res.status(200).json({
        message: "Successfully removed from waitlist",
        data: { email },
      });
    } catch (error: any) {
      console.error("Error removing waitlist user:", error);
      return res
        .status(500)
        .json({ error: "Failed to remove user from waitlist" });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ error: "Method not allowed" });
  }
}
