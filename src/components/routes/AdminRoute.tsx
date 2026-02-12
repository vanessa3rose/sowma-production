import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";

import LoadingAnimation from "../LoadingAnimation";

type Role = "ADMIN" | "USER" | "VIEWER";

type AdminRouteProps = {
  component: React.ComponentType<any>;
};

export const AdminRoute = ({ component: Component }: AdminRouteProps) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [, setLocation] = useLocation();

  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // 1) Handle auth + fetch role from backend
  useEffect(() => {
    let cancelled = false;

    async function fetchRoleByEmail(email: string) {
      setRoleLoading(true);
      try {
        const resp = await fetch(
          `/api/users?email=${encodeURIComponent(email)}`,
        );
        const json = await resp.json();

        const fetchedRole =
          (json?.data?.[0]?.role as Role | undefined) ?? "VIEWER";

        if (!cancelled) setRole(fetchedRole);
      } catch {
        // Fail closed: treat as non-admin
        if (!cancelled) setRole("VIEWER");
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    }

    if (!isLoaded) return;

    // If loaded but not signed in, go to login
    if (!isSignedIn) {
      setRole(null);
      setLocation("/login");
      return;
    }

    // Signed in: fetch role based on email
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      // Per your assumption this shouldn't happen, but fail closed anyway
      setRole("VIEWER");
      return;
    }

    fetchRoleByEmail(email);

    return () => {
      cancelled = true;
    };
  }, [user, isLoaded, isSignedIn, setLocation]);

  // 2) If signed in but not admin, redirect to rejection page
  useEffect(() => {
    if (!isLoaded || roleLoading || role === null) return;
    if (!isSignedIn) return;

    if (role !== "ADMIN") {
      setLocation("/admin-rejection");
    }
  }, [isLoaded, roleLoading, role, isSignedIn, setLocation]);

  // 3) Render gating states
  if (!isLoaded || roleLoading || role === null) return <LoadingAnimation />;

  // We redirect in the effect, but keep a safe fallback render
  if (!isSignedIn) return <LoadingAnimation />;

  if (role !== "ADMIN") return <LoadingAnimation />;

  return <Component />;
};