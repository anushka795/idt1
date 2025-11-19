import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ChevronLeft } from "lucide-react";

export default function StudentCreateDoubt() {
  const [, params] = useRoute("/student/course/:id/doubts/new");
  const [, setLocation] = useLocation();
  const courseId = params?.id;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { courseId: string }) => {
      return await apiRequest("POST", "/api/doubts", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Doubt posted!",
        description: "Your question has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doubts/course"] });
      setLocation(`/student/doubt/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Post failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseId) {
      createMutation.mutate({ ...formData, courseId });
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Link href={`/student/course/${courseId}`}>
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-display">Ask a Doubt</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Question Title</Label>
                  <Input
                    id="title"
                    placeholder="What's your question?"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about your doubt..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={8}
                    required
                    data-testid="input-description"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                  data-testid="button-post"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Doubt"
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
