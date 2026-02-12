import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";

import LoadingAnimation from "../LoadingAnimation";

type ProtectedRouteProps = {
  component: React.ComponentType<any>;
};

export const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setLocation("/login");
    }
  }, [isLoaded, isSignedIn, setLocation]);

  if (!isLoaded) return <LoadingAnimation />;
  if (!isSignedIn) return <LoadingAnimation />; // prevents flicker before redirect effect runs

  return <Component />;
};