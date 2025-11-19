import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, Award, BookOpen, TrendingUp, Zap } from "lucide-react";
import { getProfile } from "@/lib/auth";

export default function StudentDashboard() {
  const profile = getProfile();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: rankData } = useQuery({
    queryKey: ["/api/leaderboard/rank"],
  });

  const badges = Array.isArray(profile?.badges) ? profile.badges : [];
  const xp = profile?.xp || 0;
  const nextLevelXp = Math.ceil((xp + 100) / 100) * 100;
  const xpProgress = ((xp % 100) / 100) * 100;

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-display mb-2" data-testid="text-dashboard-title">
              Welcome back, {profile?.userId}!
            </h1>
            <p className="text-muted-foreground">Continue your learning journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card data-testid="card-xp">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display mb-2">{xp}</div>
                <Progress value={xpProgress} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">
                  {nextLevelXp - xp} XP to next level
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-rank">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">
                  #{rankData?.rank || "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rankData?.totalStudents ? `out of ${rankData.totalStudents}` : "No ranking yet"}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-badges">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display mb-2">{badges.length}</div>
                {badges.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {badges.slice(0, 3).map((badge: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Complete quizzes to earn badges</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold font-display">Available Courses</h2>
              <Link href="/student/courses">
                <Button variant="outline" data-testid="button-view-all-courses">
                  View All
                </Button>
              </Link>
            </div>

            {coursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : courses && courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.slice(0, 3).map((course: any) => (
                  <Card key={course.id} className="hover-elevate" data-testid={`card-course-${course.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex gap-2 mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {course.classYear}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {course.branch}
                        </Badge>
                      </div>
                      <Link href={`/student/course/${course.id}`}>
                        <Button size="sm" className="w-full" data-testid={`button-view-course-${course.id}`}>
                          View Course
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold font-display">{courses?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Available Courses</p>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display">{badges.length}</div>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display">{xp}</div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display">#{rankData?.rank || "-"}</div>
                  <p className="text-sm text-muted-foreground">Global Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
