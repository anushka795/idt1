import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Brain, ChevronLeft, Upload } from "lucide-react";

export default function TeacherCourseDetail() {
  const [, params] = useRoute("/teacher/course/:id");
  const courseId = params?.id;

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "notes"],
    enabled: !!courseId,
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "quizzes"],
    enabled: !!courseId,
  });

  if (courseLoading) {
    return (
      <ProtectedRoute requiredRole="teacher">
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
      <ProtectedRoute requiredRole="teacher">
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
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/teacher/dashboard">
              <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold font-display mb-2">{course.title}</h1>
                <p className="text-muted-foreground mb-4">{course.description}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{course.classYear}</Badge>
                  <Badge variant="secondary">{course.branch}</Badge>
                </div>
              </div>
              <Link href={`/teacher/course/${courseId}/upload`}>
                <Button data-testid="button-upload-notes">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Notes
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="notes" className="space-y-6">
            <TabsList>
              <TabsTrigger value="notes" data-testid="tab-notes">Notes</TabsTrigger>
              <TabsTrigger value="quizzes" data-testid="tab-quizzes">Quizzes</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-6">
              {notesLoading ? (
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
              ) : notes && notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {notes.map((note: any) => (
                    <Card key={note.id} className="hover-elevate" data-testid={`card-note-${note.id}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {note.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Uploaded {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                        <Link href={`/teacher/notes/${note.id}/generate-quiz`}>
                          <Button size="sm" data-testid={`button-generate-quiz-${note.id}`}>
                            <Brain className="h-4 w-4 mr-2" />
                            Generate Quiz
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No notes uploaded yet for this course</p>
                    <Link href={`/teacher/course/${courseId}/upload`}>
                      <Button data-testid="button-upload-first-notes">Upload Your First Notes</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

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
                        <div className="text-sm text-muted-foreground mb-2">
                          {quiz.questions?.length || 0} questions
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created {new Date(quiz.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No quizzes generated yet for this course</p>
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
