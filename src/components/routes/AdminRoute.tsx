import { useEffect } from "react";
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

  // Extract role directly from Clerk
  const role = (user?.publicMetadata?.role as Role | undefined) ?? "VIEWER";

  // Redirect if not signed in
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setLocation("/login");
    }
  }, [user, isLoaded, isSignedIn, setLocation]);

  // Redirect if signed in but not ADMIN
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    if (role !== "ADMIN") {
      setLocation("/admin-rejection");
    }
  }, [isLoaded, isSignedIn, role, setLocation]);

  // Render gating states
  if (!isLoaded) return <LoadingAnimation />;
  if (!isSignedIn) return <LoadingAnimation />;
  if (role !== "ADMIN") return <LoadingAnimation />;

  return <Component />;
};
