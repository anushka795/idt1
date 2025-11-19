import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ChevronLeft, Brain, Sparkles } from "lucide-react";

export default function TeacherGenerateQuiz() {
  const [, params] = useRoute("/teacher/notes/:id/generate-quiz");
  const [, setLocation] = useLocation();
  const notesId = params?.id;
  const { toast } = useToast();
  
  const [quizTitle, setQuizTitle] = useState("");

  const { data: note, isLoading: noteLoading } = useQuery({
    queryKey: ["/api/notes", notesId],
    enabled: !!notesId,
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { notesId: string; title: string }) => {
      return await apiRequest("POST", "/api/quizzes/generate", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz generated!",
        description: "AI has successfully created a quiz from your notes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setLocation(`/teacher/course/${data.courseId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (notesId) {
      generateMutation.mutate({ notesId, title: quizTitle });
    }
  };

  if (noteLoading) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!note) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 py-8">
            <p>Notes not found</p>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Link href={`/teacher/course/${note.courseId}`}>
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-3xl font-display flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                Generate AI Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-2">Source Notes: {note.title}</h3>
                <p className="text-sm text-muted-foreground">
                  AI will analyze your notes and generate multiple-choice questions automatically
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="quizTitle">Quiz Title</Label>
                  <Input
                    id="quizTitle"
                    placeholder="Quiz on Chapter 1"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    required
                    data-testid="input-quiz-title"
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">AI will generate:</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• 5-10 multiple choice questions</li>
                    <li>• 4 options per question</li>
                    <li>• Varied difficulty levels (easy, medium, hard)</li>
                    <li>• Questions covering key concepts from your notes</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Quiz... This may take a moment
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Quiz with AI
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
