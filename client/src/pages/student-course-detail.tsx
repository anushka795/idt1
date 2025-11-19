import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, ChevronLeft, Clock, Target } from "lucide-react";

export default function StudentCourseDetail() {
  const [, params] = useRoute("/student/course/:id");
  const courseId = params?.id;

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "quizzes"],
    enabled: !!courseId,
  });

  const { data: doubts, isLoading: doubtsLoading } = useQuery({
    queryKey: ["/api/doubts/course", courseId],
    enabled: !!courseId,
  });

  if (courseLoading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <p>Course not found</p>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/student/courses">
              <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
            <h1 className="text-4xl font-bold font-display mb-2">{course.title}</h1>
            <p className="text-muted-foreground mb-4">{course.description}</p>
            <div className="flex gap-2">
              <Badge variant="secondary">{course.classYear}</Badge>
              <Badge variant="secondary">{course.branch}</Badge>
            </div>
          </div>

          <Tabs defaultValue="quizzes" className="space-y-6">
            <TabsList>
              <TabsTrigger value="quizzes" data-testid="tab-quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="doubts" data-testid="tab-doubts">Doubts</TabsTrigger>
            </TabsList>

            <TabsContent value="quizzes" className="space-y-6">
              {quizzesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : quizzes && quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quizzes.map((quiz: any) => (
                    <Card key={quiz.id} className="hover-elevate" data-testid={`card-quiz-${quiz.id}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          {quiz.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="h-4 w-4" />
                            {quiz.questions?.length || 0} Questions
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Est. {Math.ceil((quiz.questions?.length || 0) * 1.5)} minutes
                          </div>
                        </div>
                        <Link href={`/student/quiz/${quiz.id}`}>
                          <Button className="w-full" data-testid={`button-start-quiz-${quiz.id}`}>
                            Start Quiz
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No quizzes available yet for this course</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="doubts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Course Doubts</h3>
                <Link href={`/student/course/${courseId}/doubts/new`}>
                  <Button data-testid="button-ask-doubt">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask a Doubt
                  </Button>
                </Link>
              </div>

              {doubtsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : doubts && doubts.length > 0 ? (
                <div className="space-y-4">
                  {doubts.map((doubt: any) => (
                    <Card key={doubt.id} className="hover-elevate" data-testid={`card-doubt-${doubt.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{doubt.title}</h4>
                          <Badge variant={doubt.status === "open" ? "secondary" : "default"}>
                            {doubt.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {doubt.description}
                        </p>
                        <Link href={`/student/doubt/${doubt.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-view-doubt-${doubt.id}`}>
                            View Discussion
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No doubts posted yet for this course</p>
                    <Link href={`/student/course/${courseId}/doubts/new`}>
                      <Button data-testid="button-ask-first-doubt">Ask the First Question</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
