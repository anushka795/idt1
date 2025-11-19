import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Trophy, Target, Award, Zap } from "lucide-react";

export default function StudentQuiz() {
  const [, params] = useRoute("/student/quiz/:id");
  const [, setLocation] = useLocation();
  const quizId = params?.id;
  const { toast } = useToast();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["/api/quizzes", quizId],
    enabled: !!quizId,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/quizzes/${quizId}/submit`, data);
    },
    onSuccess: (data) => {
      setResults(data);
      setQuizCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/rank"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    submitMutation.mutate({ answers, timeTakenSeconds: timeTaken });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <p>Loading quiz...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!quiz) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <p>Quiz not found</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (quizCompleted && results) {
    const accuracy = Math.round(results.accuracy);
    const earnedBadges = results.newBadges || [];

    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-12">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-display">Quiz Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-3xl font-bold font-display mb-1">{results.score}</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-3xl font-bold font-display mb-1">{accuracy}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-3xl font-bold font-display mb-1">{formatTime(results.timeTakenSeconds)}</div>
                    <div className="text-sm text-muted-foreground">Time</div>
                  </div>
                  <div className="text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-3xl font-bold font-display mb-1">+{results.xpEarned}</div>
                    <div className="text-sm text-muted-foreground">XP Earned</div>
                  </div>
                </div>

                {earnedBadges.length > 0 && (
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">New Badges Earned!</h3>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {earnedBadges.map((badge: string, i: number) => (
                        <Badge key={i} variant="default" className="text-sm">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation("/student/dashboard")}
                    data-testid="button-dashboard"
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setLocation("/student/leaderboard")}
                    data-testid="button-leaderboard"
                  >
                    View Leaderboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">{quiz.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              {formatTime(timeElapsed)}
            </div>
          </div>

          <Progress value={progress} className="mb-6" />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQ?.questionText}</CardTitle>
              {currentQ?.difficulty && (
                <Badge variant="secondary" className="w-fit mt-2">
                  {currentQ.difficulty}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={(value) => setAnswers({ ...answers, [currentQuestion]: parseInt(value) })}
                className="space-y-3"
              >
                {currentQ?.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-4 rounded-lg border hover-elevate">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} data-testid={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  data-testid="button-previous"
                >
                  Previous
                </Button>
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    className="flex-1"
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    disabled={answers[currentQuestion] === undefined}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length !== questions.length || submitMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
