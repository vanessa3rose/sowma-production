import { clerkClient } from "@clerk/express";
import { PrismaClient } from "../src/generated/prisma/index.js";
const prisma = new PrismaClient();

// POST /api/waitlist
export default async function handler(req: any, res: any) {
  const method = req.method;

  if (method === "POST") {
    // ---------------- ADD TO WAITLIST ----------------
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Email is required",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Invalid email format",
        });
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
        data: { email },
      });

      return res.status(201).json({
        message: "Successfully added to waitlist",
        data: { email: newEntry.email },
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
