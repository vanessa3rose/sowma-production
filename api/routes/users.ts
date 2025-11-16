/*
 * File: users.ts
 * Purpose: Manage users & accounts using CLERK
 */

import { Router, Request, Response } from "express"; // Express for nodes
import { clerkClient } from "@clerk/clerk-sdk-node"; // Clerk for security

// Below are the user types, declared in schema.prisma
export type Role = "admin" | "intern";

// Used when creating a brand-new, nonexistent user
export interface CreateUserInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: Role;
}

// Used when overwriting an existing user (altering account details)
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
}

//------- VALIDATION -------//

// Given a string, determine if it is empty or contains only whitespace
function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

// Given a string, determine if it is a valid email (. and @ in the right places)
function isEmail(v: unknown): v is string {
  return typeof v === "string" && /.+@.+\..+/.test(v);
}

// Username validation - between 4 and 64 characters, specific prohibited characters
function isUsername(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (s.length < 4 || s.length > 64) return false;
  if (/[\^\$\!\.\#\+\~]/.test(s)) return false; // forbidden specials
  if (!/^[A-Za-z0-9_-]+$/.test(s)) return false; // Latin letters/numbers/underscore/hyphen
  return true;
}

// Creates error object that is returned if a bad user is created
function makeBadRequest(message: string) {
  const err: any = new Error(message);
  err.status = 400;
  return err;
}

// Validates format of a new user
function validateCreateUser(body: any): CreateUserInput & { role: Role } {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.firstName)) errors.push("firstName is required");
  if (!isNonEmptyString(body?.lastName)) errors.push("lastName is required");
  if (!isUsername(body?.username)) {
    errors.push(
      "username must be 4 and 64 characters, Latin letters/numbers/underscore/hyphen only; no ^$!.#+~",
    );
  }
  if (!isEmail(body?.email)) errors.push("email must be a valid address"); // Uses function isEmail()
  if (!isNonEmptyString(body?.password) || String(body.password).length < 8) {
    // Uses function isNonEmptyString()
    errors.push("password must be at least 8 characters");
  }
  if (body?.role && body.role !== "admin" && body.role !== "intern") {
    errors.push("role must be 'admin' or 'intern'");
  }

  if (errors.length)
    throw makeBadRequest("Validation failed: " + errors.join("; ")); // Called if any errors

  // Returns the CreateUserInput if the body passes validation
  return {
    firstName: String(body.firstName).trim(),
    lastName: String(body.lastName).trim(),
    username: String(body.username).trim(),
    email: String(body.email).trim(),
    password: String(body.password),
    role: (body?.role as Role) ?? "intern",
  };
}

// Validates the body of updating a user. Assumes any existing users are properly formatted
function validateUpdateUser(body: any): UpdateUserInput {
  if (!body || typeof body !== "object")
    throw makeBadRequest("Body must be an object");

  const out: UpdateUserInput = {};

  if (body.firstName !== undefined) {
    if (!isNonEmptyString(body.firstName))
      throw makeBadRequest("firstName must be a non-empty string");
    out.firstName = String(body.firstName).trim();
  }
  if (body.lastName !== undefined) {
    if (!isNonEmptyString(body.lastName))
      throw makeBadRequest("lastName must be a non-empty string");
    out.lastName = String(body.lastName).trim();
  }
  if (body.username !== undefined) {
    if (!isUsername(body.username))
      throw makeBadRequest(
        "username must be 4 and 64 characters, Latin letters/numbers/underscore/hyphen only; no ^$!.#+~",
      );
    out.username = String(body.username).trim();
  }
  if (body.email !== undefined) {
    if (!isEmail(body.email))
      throw makeBadRequest("email must be a valid address");
    out.email = String(body.email).trim();
  }
  if (body.password !== undefined) {
    if (!isNonEmptyString(body.password) || String(body.password).length < 8) {
      throw makeBadRequest("password must be at least 8 characters");
    }
    out.password = String(body.password);
  }
  if (body.role !== undefined) {
    if (body.role !== "admin" && body.role !== "intern") {
      throw makeBadRequest("role must be 'admin' or 'intern'");
    }
    out.role = body.role;
  }

  return out;
}

//------- HELPER FUNCTIONS -------//

// Takes a Clerk output and reformats to fit our system
function shapeUser(u: any) {
  const role =
    (u.publicMetadata?.role as "admin" | "intern" | undefined) ?? "intern";
  return {
    id: u.id,
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    username: u.username ?? "",
    email: u.emailAddress?.[0]?.emailAddress ?? "",
    role,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  };
}

// Merges an existing Clerk object with a UpdateUserInput - any empty fields in
// the UpdateUserInput are filled with the "old" Clerk values.
function toClerkUpdatePayload(body: UpdateUserInput) {
  const payload: Record<string, any> = {};

  if (body.firstName !== undefined) payload.firstName = body.firstName;
  if (body.lastName !== undefined) payload.lastName = body.lastName;
  if (body.username !== undefined) payload.username = body.username;
  if (body.email !== undefined) payload.emailAddress = [body.email];
  if (body.password !== undefined) payload.password = body.password;

  if (body.role !== undefined) {
    payload.publicMetadata = {
      ...(payload.publicMetadata ?? {}),
      role: body.role,
    };
  }

  return payload;
}

//------- CRUD FUNCTIONS -------//

// Creates a NEW user
export async function createUser(input: CreateUserInput) {
  const parsed = validateCreateUser(input);
  const user = await clerkClient.users.createUser({
    emailAddress: [parsed.email],
    password: parsed.password,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    username: parsed.username,
    publicMetadata: { role: parsed.role },
  });
  return shapeUser(user);
}

// Searches for users by keynames (email, username)
export async function getUsers(filter?: { email?: string; username?: string }) {
  const list = await clerkClient.users.getUserList({
    limit: 50,
    emailAddress: filter?.email ? [filter.email] : undefined,
    username: filter?.username ? [filter.username] : undefined,
    orderBy: "-created_at",
  });
  return list.data.map(shapeUser);
}

// Updates an existing user
export async function updateUser(userId: string, updates: UpdateUserInput) {
  const parsed = validateUpdateUser(updates);
  const updated = await clerkClient.users.updateUser(
    userId,
    toClerkUpdatePayload(parsed),
  );
  return shapeUser(updated);
}

// Deletes a preexisting user
export async function deleteUser(userId: string) {
  await clerkClient.users.deleteUser(userId);
  return { id: userId, deleted: true };
}

//------- API ENDPOINTS -------//

export const usersRouter = Router();

// Posts a new user
usersRouter.post("/", async (req, res) => {
  try {
    const created = await createUser(req.body);
    return res.status(201).json({ ok: true, data: created });
  } catch (err: any) {
    // LOG full error to server console
    console.error("Clerk createUser error:", JSON.stringify(err, null, 2));
    const status = (err as any)?.status === 400 ? 400 : 422; // Clerk validation errors are 422
    const message =
      err?.errors?.map((e: any) => e.long_message || e.message).join("; ") ||
      err?.message ||
      "Failed to create user";
    return res
      .status(status)
      .json({ ok: false, error: message, raw: err?.errors });
  }
});

// Gets a user
usersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const email =
      typeof req.query.email === "string" ? req.query.email : undefined;
    const username =
      typeof req.query.username === "string" ? req.query.username : undefined;
    const users = await getUsers({ email, username });
    return res.status(200).json({ ok: true, data: users });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Failed to fetch users" });
  }
});

// Overwrites (Updates) a user
usersRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateUser(id, req.body);
    return res.status(200).json({ ok: true, data: updated });
  } catch (err: any) {
    const message = err?.message || "Failed to update user";
    const status = (err as any)?.status === 400 ? 400 : 500;
    return res.status(status).json({ ok: false, error: message });
  }
});

// Deletes a user
usersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);
    return res.status(200).json({ ok: true, data: result });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Failed to delete user" });
  }
});

export default usersRouter;
