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

  useEffect(() => {
    let cancelled = false;

    async function fetchRoleByEmail(email: string) {
      setRoleLoading(true);
      try {
        const resp = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        const json = await resp.json();

        const fetchedRole = (json?.data?.[0]?.role as Role | undefined) ?? "VIEWER";
        if (!cancelled) setRole(fetchedRole);
      } catch (e) {
        // fail closed: treat as non-admin
        if (!cancelled) setRole("VIEWER");
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    }

    if (!isLoaded) return;

    if (!isSignedIn) {
      setRole(null);
      setLocation("/login");
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      setRole("VIEWER");
      return;
    }

    fetchRoleByEmail(email);

    return () => {
      cancelled = true;
    };
  }, [user, isLoaded, isSignedIn, setLocation]);

  // loading: clerk OR role fetch
  if (!isLoaded || roleLoading || role === null) return <LoadingAnimation />;

  if (!isSignedIn) return <LoadingAnimation />;

  useEffect(() => {
    if (!isLoaded || roleLoading || role === null) return;
    if (!isSignedIn) return;
    if (role !== "ADMIN") {
        setLocation("/homepage", {
        state: { adminDenied: true, message: "You do not have admin access.", expiresMs: 8000 },
        });
    }
    }, [isLoaded, roleLoading, role, isSignedIn, setLocation]);

  return <Component />;
};