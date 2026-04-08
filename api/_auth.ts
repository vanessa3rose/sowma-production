import { authenticateRequest, clerkClient } from "@clerk/express";

type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => {
    json: (body: unknown) => unknown;
  };
};

type AuthResult =
  | { ok: true; userId: string | null; isInternal: boolean }
  | { ok: false };

function getHeader(req: ApiRequest, name: string): string {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? "";
  return String(value ?? "");
}

function hasInternalApiSecret(req: ApiRequest): boolean {
  const secret = String(process.env.INTERNAL_API_SECRET ?? "").trim();
  if (!secret) return false;
  return getHeader(req, "authorization") === `Bearer ${secret}`;
}

async function authenticateWithClerk(req: ApiRequest): Promise<AuthResult> {
  const requestState = await authenticateRequest({
    clerkClient,
    request: req as any,
    options: {},
  });

  const auth = requestState.toAuth();
  return {
    ok: true,
    userId: auth?.userId ?? null,
    isInternal: false,
  };
}

async function getRequestAuth(req: ApiRequest): Promise<AuthResult> {
  if (hasInternalApiSecret(req)) {
    return { ok: true, userId: null, isInternal: true };
  }

  try {
    return await authenticateWithClerk(req);
  } catch (error) {
    console.error("[api-auth] Clerk authentication failed:", error);
    return { ok: false };
  }
}

export async function requireSignedInApi(req: ApiRequest, res: ApiResponse) {
  const auth = await getRequestAuth(req);
  if (!auth.ok) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (auth.isInternal) {
    return auth;
  }

  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return auth;
}

export async function requireAdminApi(req: ApiRequest, res: ApiResponse) {
  const auth = await getRequestAuth(req);
  if (!auth.ok) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (auth.isInternal) {
    return auth;
  }

  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const user = await clerkClient.users.getUser(auth.userId);
  const role = String(user.publicMetadata?.role ?? "VIEWER").toUpperCase();
  if (role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }

  return auth;
}
