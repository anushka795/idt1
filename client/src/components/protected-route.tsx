import { useEffect } from "react";
import { useLocation } from "wouter";
import { isAuthenticated, getUser } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "teacher";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      setLocation("/");
    }
  }, [requiredRole, user, setLocation]);

  if (!isAuthenticated() || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
