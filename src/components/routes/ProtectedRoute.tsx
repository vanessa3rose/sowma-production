import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";

import LoadingAnimation from "../LoadingAnimation";

type ProtectedRouteProps = {
  component: React.ComponentType<any>;
};

export const ProtectedRoute = ({
  component: Component,
}: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setLocation("/login");
    }
  }, [isLoaded, isSignedIn, setLocation]);

  // For invitees: hydrate Clerk profile names from waitlist metadata if missing.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const metadata = (user.publicMetadata ?? {}) as Record<string, unknown>;
    const waitlistFirstName = String(metadata.waitlistFirstName ?? "").trim();
    const waitlistLastName = String(metadata.waitlistLastName ?? "").trim();

    const needsFirst = !user.firstName && !!waitlistFirstName;
    const needsLast = !user.lastName && !!waitlistLastName;
    if (!needsFirst && !needsLast) return;

    void user
      .update({
        firstName: needsFirst ? waitlistFirstName : user.firstName ?? undefined,
        lastName: needsLast ? waitlistLastName : user.lastName ?? undefined,
      })
      .catch((err) => {
        console.error("Failed to sync waitlist name into Clerk profile:", err);
      });
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) return <LoadingAnimation />;
  if (!isSignedIn) return <LoadingAnimation />; // prevents flicker before redirect effect runs

  return <Component />;
};
