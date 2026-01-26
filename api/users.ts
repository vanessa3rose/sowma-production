import { clerkClient } from "@clerk/clerk-sdk-node"; // Clerk for security

// Below are the user types, declared in schema.prisma
export type Role = "ADMIN" | "USER" | "VIEWER";

// Used when creating a brand-new, nonexistent user
export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  isWaitlisted: boolean;
}

// Used when overwriting an existing user (altering account details)
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: Role;
  isWaitlisted?: boolean;
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

// Creates error object that is returned if a bad user is created
function makeBadRequest(message: string) {
  const err: any = new Error(message);
  err.status = 400;
  return err;
}

function validateCreateUser(body: any): CreateUserInput & { role: Role } {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.firstName)) errors.push("firstName is required");
  if (!isNonEmptyString(body?.lastName)) errors.push("lastName is required");
  if (!isEmail(body?.email)) errors.push("email must be a valid address");
  if (!isNonEmptyString(body?.password) || String(body.password).length < 8) {
    errors.push("password must be at least 8 characters");
  }
  if (
    body?.role &&
    body.role !== "ADMIN" &&
    body.role !== "USER" &&
    body.role !== "VIEWER"
  ) {
    errors.push("role must be 'ADMIN', 'USER', or 'VIEWER'");
  }

  if (errors.length)
    throw makeBadRequest("Validation failed: " + errors.join("; "));

  return {
    firstName: String(body.firstName).trim(),
    lastName: String(body.lastName).trim(),
    email: String(body.email).trim(),
    password: String(body.password),
    role: (body?.role as Role) ?? "VIEWER",
    isWaitlisted: body?.isWaitlisted === true, // Add this - converts to boolean
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
    if (
      body.role !== "ADMIN" &&
      body.role !== "USER" &&
      body.role !== "VIEWER"
    ) {
      throw makeBadRequest("role must be 'ADMIN', 'USER', or 'VIEWER");
    }
    out.role = body.role;
  }
  if (body.isWaitlisted !== undefined) {
    out.isWaitlisted = body.isWaitlisted === true;
  }

  return out;
}

//------- HELPER FUNCTIONS -------//

// Takes a Clerk output and reformats to fit our system
function shapeUser(u: any) {
  const role =
    (u.publicMetadata?.role as "ADMIN" | "USER" | "VIEWER" | undefined) ??
    "USER";
  const isWaitlisted = u.publicMetadata?.isWaitlisted ?? false;
  return {
    id: u.id,
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    email: u.emailAddresses?.[0]?.emailAddress ?? "",
    role,
    isWaitlisted,
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
  if (body.email !== undefined) payload.emailAddress = [body.email];
  if (body.password !== undefined) payload.password = body.password;

  // updates role and waitlisted using payload info 
  if (body.role !== undefined || body.isWaitlisted !== undefined) {
    payload.publicMetadata = {
      ...(payload.publicMetadata ?? {}),
    };
    if (body.role !== undefined) {
      payload.publicMetadata.role = body.role;
    }
    if (body.isWaitlisted !== undefined) {
      payload.publicMetadata.isWaitlisted = body.isWaitlisted;
    }
  }

  if (body.role !== undefined) payload.publicMetadata.role = body.role;
  if (body.isWaitlisted !== undefined) payload.publicMetadata.isWaitlisted = body.isWaitlisted;

  return payload;
}

//------- CRUD FUNCTIONS -------//

export async function createUser(input: CreateUserInput) {
  const parsed = validateCreateUser(input);
  const user = await clerkClient.users.createUser({
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    emailAddress: [parsed.email],
    password: parsed.password,
    publicMetadata: {
      role: parsed.role,
      isWaitlisted: parsed.isWaitlisted,
    },
  });
  return shapeUser(user);
}

export async function getUsers(filter?: { email?: string }) {
  const list = await clerkClient.users.getUserList({
    limit: 50,
    emailAddress: filter?.email ? [filter.email] : undefined,
    orderBy: "-created_at",
  });
  return list.data.map(shapeUser);
}

export async function updateUser(userId: string, updates: UpdateUserInput) {
  const parsed = validateUpdateUser(updates);
  const updated = await clerkClient.users.updateUser(
    userId,
    toClerkUpdatePayload(parsed),
  );
  return shapeUser(updated);
}

export async function deleteUser(userId: string) {
  await clerkClient.users.deleteUser(userId);
  return { id: userId, deleted: true };
}

//------- VERCEL SERVERLESS ENDPOINT -------//

export default async function handler(req: any, res: any) {
  // Extract user ID if present (for PUT/DELETE)
  const userId = req.query.id as string | undefined;

  try {
    // GET /api/users?email=...
    if (req.method === "GET") {
      const email =
        typeof req.query.email === "string" ? req.query.email : undefined;
      const users = await getUsers({ email });
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json({ ok: true, data: users });
    }

    // POST /api/users
    if (req.method === "POST") {
      const created = await createUser(req.body);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(201).json({ ok: true, data: created });
    }

    // PUT /api/users/:id
    if (req.method === "PUT" && userId) {
      const updated = await updateUser(userId, req.body);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json({ ok: true, data: updated });
    }

    // DELETE /api/users/:id
    if (req.method === "DELETE" && userId) {
      const result = await deleteUser(userId);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json({ ok: true, data: result });
    }

    // If method not allowed
    res.setHeader("Allow", "GET,POST,PUT,DELETE");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err: any) {
    console.error("Clerk users error:", JSON.stringify(err, null, 2));
    const status = err?.status === 400 ? 400 : 500;
    const message = err?.message || "Server error";
    return res.status(status).json({ ok: false, error: message });
  }
}
