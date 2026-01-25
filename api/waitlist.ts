// waitlist.route.js or in your routes file

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST /api/waitlist
export async function createWaitlistUser(req, res) {
  try {
    const { email } = req.body;

    // Validate email is provided
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /n^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Check if user already exists with this email (waitlisted or not)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "A user with this email already exists",
      });
    }

    // Create new waitlisted user with empty fields
    const newUser = await prisma.user.create({
      data: {
        email: email,
        role: "WAITLISTED",
        isWaitlisted: true,
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        phone: "",
      },
    });

    return res.status(201).json({
      message: "Successfully added to waitlist",
      user: {
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating waitlist user:", error);
    return res.status(500).json({
      error: "Failed to add user to waitlist",
    });
  }
}
