import { clerkClient } from "@clerk/express";
import { PrismaClient } from "../src/generated/prisma/index.js";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";

// ---------------- Runtime and DB configuration ----------------
function getDatabaseUrl(): string | null {
  const raw = String(process.env.DATABASE_URL ?? "").trim();
  if (!raw) return null;

  // Vercel/local env loaders can preserve wrapping quotes in some setups.
  const unwrapped = raw.replace(/^['"]|['"]$/g, "");
  return unwrapped || null;
}

function hasValidDatabaseUrl() {
  const url = getDatabaseUrl();
  return !!url && /^(postgresql|postgres):\/\//i.test(url);
}

const prisma = new PrismaClient(
  hasValidDatabaseUrl()
    ? {
        datasources: {
          db: { url: getDatabaseUrl() as string },
        },
      }
    : undefined,
);

// ---------------- Waitlist persistence helpers ----------------
type WaitlistEntry = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
};

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  return prisma.$queryRawUnsafe<WaitlistEntry[]>(
    `
      SELECT
        id,
        email,
        "firstName",
        "lastName",
        "createdAt"
      FROM "Waitlist"
      ORDER BY "createdAt" DESC
    `,
  );
}

async function getWaitlistByEmail(email: string): Promise<{
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
} | null> {
  const rows = await prisma.$queryRawUnsafe<
    Array<{ id: string; email: string; firstName: string | null; lastName: string | null }>
  >(
    `
      SELECT
        id,
        email,
        "firstName" AS "firstName",
        "lastName" AS "lastName"
      FROM "Waitlist"
      WHERE email = $1
      LIMIT 1
    `,
    email,
  );
  return rows[0] ?? null;
}

async function createWaitlistEntry(
  email: string,
  firstName: string,
  lastName: string,
): Promise<
  | { created: true; email: string; firstName: string | null; lastName: string | null }
  | { created: false }
> {
  const id = randomUUID();
  const rows = await prisma.$queryRawUnsafe<
    Array<{ email: string; firstName: string | null; lastName: string | null }>
  >(
    `
      INSERT INTO "Waitlist" (id, email, "firstName", "lastName")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING email, "firstName" AS "firstName", "lastName" AS "lastName"
    `,
    id,
    email,
    firstName,
    lastName,
  );
  if (rows[0]) return { created: true, ...rows[0] };
  return { created: false };
}

async function deleteWaitlistByEmail(email: string): Promise<void> {
  await prisma.$executeRawUnsafe(`DELETE FROM "Waitlist" WHERE email = $1`, email);
}

// Basic email format validation for waitlist submissions.
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ---------------- Email helpers ----------------
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

function createSmtpTransporter(smtp: SmtpEnv) {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
}

function getInviteRedirectUrl(req?: any): string {
  const origin = String(req?.headers?.origin ?? "").trim();
  if (origin) return `${origin.replace(/\/+$/, "")}/accept-invite`;

  const forwardedProto = String(req?.headers?.["x-forwarded-proto"] ?? "").trim();
  const forwardedHost = String(req?.headers?.["x-forwarded-host"] ?? "").trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}/accept-invite`;
  }

  const host = String(req?.headers?.host ?? "").trim();
  if (host) return `http://${host}/accept-invite`;

  const frontend = process.env.FRONTEND_URL;
  if (frontend) return `${frontend.replace(/\/+$/, "")}/accept-invite`;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, "")}/accept-invite`;

  return "http://localhost:4000/accept-invite";
}

async function sendWaitlistAdminEmail(
  newUserEmail: string,
  firstName: string,
  lastName: string,
): Promise<void> {
  const smtp = getSmtpEnv();
  if (!smtp) {
    console.error("[waitlist-email] Missing/invalid SMTP env vars.");
    return;
  }

  const allUsers = await clerkClient.users.getUserList({ limit: 100 });
  const userArray = allUsers.data;
  const admins = userArray.filter(
    (u: any) =>
      u.publicMetadata?.role === "ADMIN" && u.emailAddresses.length > 0,
  );
  const recipients = admins
    .map((u: any) => u.emailAddresses[0].emailAddress)
    .filter((e: any): e is string => !!e);

  if (recipients.length === 0) {
    console.warn(
      "[waitlist-email] No admin recipients found in Clerk (role=ADMIN).",
    );
    return;
  }

  const transporter = createSmtpTransporter(smtp);

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

  await transporter.sendMail({
    from: smtp.from,
    to: recipients,
    subject,
    text,
  });
}

async function sendWaitlistInviteEmail(
  email: string,
  firstName: string | null,
  inviteUrl: string,
): Promise<void> {
  const smtp = getSmtpEnv();
  if (!smtp) {
    throw new Error("Missing/invalid SMTP env vars.");
  }

  const transporter = createSmtpTransporter(smtp);

  const name = firstName?.trim() || "there";
  const subject = "Your School on Wheels Analytics invite";
  const text = [
    `Hi ${name},`,
    "",
    "Your waitlist request to join the SOWMA Analytics Dashboard has been approved.",
    "Please use the link below to accept your invitation and set your password:",
    "",
    inviteUrl,
    "",
    "If you were not expecting this email, you can ignore it.",
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5; max-width: 560px;">
      <p style="margin: 0 0 16px;">Hi ${name},</p>
      <p style="margin: 0 0 16px;">Your waitlist request has been approved.</p>
      <p style="margin: 0 0 20px;">Use the button below to accept your invitation and set your password:</p>
      <p style="margin: 0 0 20px;">
        <a
          href="${inviteUrl}"
          style="
            display: inline-block;
            padding: 10px 16px;
            background: #4f46e5;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Accept Your Invitation
        </a>
      </p>
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
        If the button doesn't work, copy and paste this URL into your browser:
      </p>
      <p style="margin: 0 0 16px; font-size: 13px; word-break: break-all;">
        <a href="${inviteUrl}" style="color: #4f46e5;">${inviteUrl}</a>
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">
        If you were not expecting this email, you can ignore it.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject,
    text,
    html,
  });
}

export default async function handler(req: any, res: any) {
  const method = req.method;

  if (!hasValidDatabaseUrl()) {
    return res.status(500).json({
      error:
        "DATABASE_URL missing or invalid in API runtime (must start with postgres:// or postgresql://).",
    });
  }

  if (method === "GET") {
    // Return the full queue for the admin waitlist table.
    try {
      const entries = await getWaitlistEntries();
      return res.status(200).json(entries);
    } catch (error: any) {
      console.error("Error fetching waitlist users:", error);
      return res.status(500).json({ error: "Failed to fetch waitlist users" });
    }
  } else if (method === "POST") {
    // Create a waitlist entry and notify admins.
    try {
      const rawFirstName = String(req.body?.firstName ?? "").trim();
      const rawLastName = String(req.body?.lastName ?? "").trim();
      const email = normalizeEmail(req.body?.email);

      if (!rawFirstName || !rawLastName || !email) {
        return res.status(400).json({
          error: "First name, last name, and email are required",
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const existingClerkUsers = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (existingClerkUsers.data.length > 0) {
        return res.status(409).json({
          error: "An account with this email already exists",
          code: "CLERK_DUPLICATE",
        });
      }

      const newEntry = await createWaitlistEntry(
        email,
        rawFirstName,
        rawLastName,
      );
      if (!newEntry.created) {
        return res.status(409).json({
          error: "This email is already on the waitlist",
          code: "WAITLIST_DUPLICATE",
        });
      }

      try {
        await sendWaitlistAdminEmail(newEntry.email, rawFirstName, rawLastName);
      } catch (err) {
        console.error("[waitlist-email] Failed to send admin email:", err);
      }

      return res.status(201).json({
        message: "Successfully added to waitlist",
        data: {
          email: newEntry.email,
          firstName: newEntry.firstName ?? rawFirstName,
          lastName: newEntry.lastName ?? rawLastName,
        },
      });
    } catch (error: any) {
      console.error("Error creating waitlist user:", error);

      return res.status(500).json({
        error: "Failed to add user to waitlist",
      });
    }
  } else if (method === "PATCH") {
    // Approve or deny a waitlist user from the admin tab.
    try {
      const action = String(req.body?.action ?? "").trim().toLowerCase();
      const email = normalizeEmail(req.body?.email);

      if (!action || !email) {
        return res
          .status(400)
          .json({ error: "Action and email are required" });
      }

      if (action !== "approve" && action !== "deny") {
        return res
          .status(400)
          .json({ error: "Action must be either 'approve' or 'deny'" });
      }

      const existingWaitlist = await getWaitlistByEmail(email);

      if (!existingWaitlist) {
        return res.status(404).json({
          error: "This email is not on the waitlist",
        });
      }

      if (action === "approve") {
        if (!process.env.CLERK_SECRET_KEY) {
          console.error("CLERK_SECRET_KEY is not set in environment variables");
          return res.status(500).json({ error: "Server misconfiguration" });
        }

        const existingClerkUsers = await clerkClient.users.getUserList({
          emailAddress: [email],
        });

        if (existingClerkUsers.data.length > 0) {
          return res.status(409).json({
            error: "Failed: User email already in use",
            code: "CLERK_DUPLICATE",
          });
        }

        const pendingInvitations = await clerkClient.invitations.getInvitationList({
          status: "pending",
          query: email,
          limit: 100,
        });

        const matchingPendingInvites = (pendingInvitations?.data ?? []).filter(
          (invite: any) =>
            String(invite?.emailAddress ?? "").toLowerCase() === email,
        );

        // Ensure only one active invitation exists per email.
        let revokedCount = 0;
        for (const invite of matchingPendingInvites) {
          if (!invite?.id) continue;
          await clerkClient.invitations.revokeInvitation(invite.id);
          revokedCount += 1;
        }

        let invitation: Awaited<
          ReturnType<typeof clerkClient.invitations.createInvitation>
        >;
        try {
          invitation = await clerkClient.invitations.createInvitation({
            emailAddress: email,
            redirectUrl: getInviteRedirectUrl(req),
            notify: false,
          });
        } catch (inviteError: any) {
          const inviteErrors = Array.isArray(inviteError?.errors)
            ? inviteError.errors
            : [];
          const hasDuplicateInvitation = inviteErrors.some(
            (err: any) =>
              err?.code === "duplicate_record" &&
              typeof err?.message === "string" &&
              err.message.toLowerCase().includes("duplicate invitation"),
          );

          if (hasDuplicateInvitation) {
            return res.status(409).json({
              error: "Failed: Invitation already sent",
              code: "CLERK_INVITATION_PENDING",
            });
          }

          throw inviteError;
        }

        const invitationUrl = invitation?.url ?? "";
        if (!invitationUrl) {
          throw new Error("Failed to generate invitation URL");
        }

        try {
          await sendWaitlistInviteEmail(
            email,
            existingWaitlist.firstName,
            invitationUrl,
          );
        } catch (emailError) {
          // Avoid leaving a pending invite if custom email delivery fails.
          if (invitation?.id) {
            await clerkClient.invitations.revokeInvitation(invitation.id);
          }
          throw emailError;
        }

        await deleteWaitlistByEmail(email);

        return res.status(200).json({
          message:
            revokedCount > 0
              ? `Resent invitation to ${email}`
              : `Approved and invited ${email}`,
          data: {
            email,
            action,
            resent: revokedCount > 0,
            invitationUrl,
          },
        });
      }

      await deleteWaitlistByEmail(email);

      return res.status(200).json({
        message: `Denied ${email}`,
        data: { email, action },
      });
    } catch (error: any) {
      console.error("Error updating waitlist user:", error);
      return res.status(500).json({
        error: "Failed to update waitlist user",
      });
    }
  } else if (method === "DELETE") {
    // Remove a waitlist user directly from the admin tab.
    try {
      const email: string = normalizeEmail(req.body?.email);

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const existingWaitlist = await getWaitlistByEmail(email);

      if (!existingWaitlist) {
        return res.status(404).json({
          error: "This email is not on the waitlist",
        });
      }

      await deleteWaitlistByEmail(email);

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
  } else if (method === "GET") {
    // ---------------- GET WAITLIST USERS ----------------
    try {
      const users = await prisma.waitlist.findMany({
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ data: users });
    } catch (error) {
      console.error("Error fetching waitlist users:", error);
      return res.status(500).json({ error: "Failed to fetch waitlist users" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
