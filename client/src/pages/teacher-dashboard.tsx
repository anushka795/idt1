import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { BookOpen, FileText, Brain, Users, AlertCircle, CheckCircle } from "lucide-react";
import { getProfile } from "@/lib/auth";

export default function TeacherDashboard() {
  const profile = getProfile();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/teacher/courses"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/teacher/stats"],
  });

  const isVerified = profile?.status === "verified";

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {!isVerified && (
            <Card className="mb-8 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="p-6 flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Verification Pending</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your account is pending verification. Please complete the verification test to start creating courses.
                  </p>
                  <Link href="/teacher/verification">
                    <Button size="sm" data-testid="button-complete-verification">
                      Complete Verification
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {isVerified && (
            <Card className="mb-8 border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Account Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Your account is verified. You can now create courses and upload notes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-8">
            <h1 className="text-4xl font-bold font-display mb-2" data-testid="text-dashboard-title">
              Teacher Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your courses and track student progress</p>
          </div>

          {isVerified && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card data-testid="card-courses">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display">{stats?.coursesCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active courses</p>
                </CardContent>
              </Card>

              <Card data-testid="card-notes">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notes Uploaded</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display">{stats?.notesCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Course materials</p>
                </CardContent>
              </Card>

              <Card data-testid="card-quizzes">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quizzes Generated</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display">{stats?.quizzesCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">AI-powered assessments</p>
                </CardContent>
              </Card>

              <Card data-testid="card-students">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display">{stats?.attemptsCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Quiz completions</p>
                </CardContent>
              </Card>
            </div>
          )}

          {isVerified && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-display">My Courses</h2>
                <Link href="/teacher/courses/create">
                  <Button data-testid="button-create-course">Create New Course</Button>
                </Link>
              </div>

              {coursesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course: any) => (
                    <Card key={course.id} className="hover-elevate" data-testid={`card-course-${course.id}`}>
                      <CardContent className="p-6">
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
                        <div className="flex gap-2">
                          <Link href={`/teacher/course/${course.id}`}>
                            <Button size="sm" variant="outline" data-testid={`button-manage-${course.id}`}>
                              Manage
                            </Button>
                          </Link>
                          <Link href={`/teacher/course/${course.id}/upload`}>
                            <Button size="sm" data-testid={`button-upload-${course.id}`}>
                              Upload Notes
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">You haven't created any courses yet</p>
                    <Link href="/teacher/courses/create">
                      <Button data-testid="button-create-first-course">Create Your First Course</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
