import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUser, clearAuth } from "@/lib/auth";
import { LogOut, GraduationCap, BookOpen } from "lucide-react";

export function Navbar() {
  const [, setLocation] = useLocation();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    setLocation("/");
  };

  if (!user) return null;

  const isStudent = user.role === "student";
  const isTeacher = user.role === "teacher";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-2">
          {isStudent ? (
            <GraduationCap className="h-6 w-6 text-primary" />
          ) : (
            <BookOpen className="h-6 w-6 text-primary" />
          )}
          <span className="font-display font-bold text-xl">QuizConnect</span>
        </div>

        <div className="flex-1 flex items-center gap-6 ml-8">
          {isStudent && (
            <>
              <Link href="/student/dashboard">
                <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-dashboard">
                  Dashboard
                </a>
              </Link>
              <Link href="/student/courses">
                <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-courses">
                  Courses
                </a>
              </Link>
              <Link href="/student/leaderboard">
                <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-leaderboard">
                  Leaderboard
                </a>
              </Link>
            </>
          )}
          {isTeacher && (
            <>
              <Link href="/teacher/dashboard">
                <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-dashboard">
                  Dashboard
                </a>
              </Link>
              <Link href="/teacher/courses">
                <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-courses">
                  My Courses
                </a>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" data-testid="badge-role">
            {isStudent ? "Student" : "Teacher"}
          </Badge>
          <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">
            {user.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
