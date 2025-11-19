import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUser } from "@/lib/auth";
import { ChevronLeft, MessageSquare, CheckCircle, Loader2 } from "lucide-react";

export default function StudentDoubtDetail() {
  const [, params] = useRoute("/student/doubt/:id");
  const doubtId = params?.id;
  const currentUser = getUser();
  const { toast } = useToast();
  
  const [replyText, setReplyText] = useState("");

  const { data: doubt, isLoading: doubtLoading } = useQuery({
    queryKey: ["/api/doubts", doubtId],
    enabled: !!doubtId,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/doubts", doubtId, "comments"],
    enabled: !!doubtId,
  });

  const replyMutation = useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest("POST", `/api/doubts/${doubtId}/comments`, { text });
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["/api/doubts", doubtId, "comments"] });
      toast({
        title: "Reply posted",
        description: "Your reply has been added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reply failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/doubts/${doubtId}/resolve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doubts", doubtId] });
      toast({
        title: "Doubt resolved",
        description: "This doubt has been marked as resolved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      replyMutation.mutate(replyText);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (doubtLoading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!doubt) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-8">
            <p>Doubt not found</p>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const isAuthor = doubt.studentId === currentUser?.id;

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Link href={`/student/course/${doubt.courseId}`}>
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{doubt.title}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Posted {new Date(doubt.createdAt).toLocaleDateString()}</span>
                    <Badge variant={doubt.status === "open" ? "secondary" : "default"}>
                      {doubt.status}
                    </Badge>
                  </div>
                </div>
                {isAuthor && doubt.status === "open" && (
                  <Button
                    size="sm"
                    onClick={() => resolveMutation.mutate()}
                    disabled={resolveMutation.isPending}
                    data-testid="button-resolve"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{doubt.description}</p>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Replies ({comments?.length || 0})
            </h3>

            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment: any) => (
                  <Card key={comment.id} data-testid={`comment-${comment.id}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{comment.authorName}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.authorRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {doubt.status === "open" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add a Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReply} className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts or help solve this doubt..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    data-testid="input-reply"
                  />
                  <Button
                    type="submit"
                    disabled={!replyText.trim() || replyMutation.isPending}
                    data-testid="button-post-reply"
                  >
                    {replyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Reply"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
