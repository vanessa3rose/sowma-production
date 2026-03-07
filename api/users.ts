import { clerkClient } from "@clerk/express";

type Role = "ADMIN" | "USER" | "VIEWER";

export default async function handler(req: any, res: any) {
  const method = req.method;

  try {
    if (method === "GET") {
      // ---------------- FETCH USERS ----------------
      const users = await clerkClient.users.getUserList({ limit: 100 });

      const formatted = users.data.map((u: any) => ({
        id: u.id,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.emailAddresses?.[0]?.emailAddress || "",
        role: (u.publicMetadata?.role as Role) || "USER",
      }));

      return res.status(200).json({ data: formatted });
    }

    if (method === "PUT") {
      // ---------------- UPDATE ROLE ----------------
      const { id } = req.query;
      const { role } = req.body;

      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: { role },
      });

      return res.status(200).json({ message: "Role updated" });
    }

    if (method === "DELETE") {
      // ---------------- DELETE USER ----------------
      const { id } = req.query;

      await clerkClient.users.deleteUser(id);

      return res.status(200).json({ message: "User deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Users API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
