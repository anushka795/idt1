import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getProfile } from "@/lib/auth";
import { CheckCircle, Loader2 } from "lucide-react";

const VERIFICATION_QUESTIONS = [
  {
    id: "q1",
    question: "What is the primary goal of assessment in education?",
    options: [
      "To rank students",
      "To measure learning outcomes and guide instruction",
      "To assign grades only",
      "To compare students",
    ],
    correctIndex: 1,
  },
  {
    id: "q2",
    question: "Which teaching method encourages active student participation?",
    options: [
      "Lecture-only method",
      "Passive learning",
      "Interactive discussions and problem-solving",
      "Reading textbooks alone",
    ],
    correctIndex: 2,
  },
  {
    id: "q3",
    question: "What does differentiated instruction mean?",
    options: [
      "Teaching the same way to all students",
      "Adapting teaching methods to meet diverse student needs",
      "Only teaching advanced students",
      "Using one textbook for all",
    ],
    correctIndex: 1,
  },
  {
    id: "q4",
    question: "Why is feedback important in learning?",
    options: [
      "It's not important",
      "Only for grading",
      "It helps students understand mistakes and improve",
      "To criticize students",
    ],
    correctIndex: 2,
  },
  {
    id: "q5",
    question: "What is formative assessment?",
    options: [
      "Final exams only",
      "Ongoing assessment during learning to guide teaching",
      "Standardized tests",
      "Grade assignment",
    ],
    correctIndex: 1,
  },
];

export default function TeacherVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const profile = getProfile();
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!profile || profile.status !== "pending") {
    setLocation("/teacher/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/teacher/verification-test", { answers });
      
      if (response.passed) {
        toast({
          title: "Verification successful!",
          description: `You scored ${response.score}%. You can now create courses.`,
        });
        setLocation("/teacher/dashboard");
      } else {
        toast({
          title: "Verification incomplete",
          description: `You scored ${response.score}%. You need 60% to pass. Please contact support.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const allAnswered = VERIFICATION_QUESTIONS.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-display">Teacher Verification Test</CardTitle>
            <CardDescription>
              Answer these questions to verify your teaching credentials. You need 60% to pass.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {VERIFICATION_QUESTIONS.map((q, index) => (
                <div key={q.id} className="space-y-3">
                  <Label className="text-base font-semibold">
                    {index + 1}. {q.question}
                  </Label>
                  <RadioGroup
                    value={answers[q.id]}
                    onValueChange={(value) => setAnswers({ ...answers, [q.id]: value })}
                    data-testid={`question-${index + 1}`}
                  >
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={optIndex.toString()}
                          id={`${q.id}-${optIndex}`}
                          data-testid={`question-${index + 1}-option-${optIndex}`}
                        />
                        <Label
                          htmlFor={`${q.id}-${optIndex}`}
                          className="font-normal cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!allAnswered || loading}
                  className="flex-1"
                  data-testid="button-submit-test"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Test
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
