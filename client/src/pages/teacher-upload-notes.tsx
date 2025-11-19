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
import { queryClient } from "@/lib/queryClient";
import { Loader2, ChevronLeft, Upload, FileText } from "lucide-react";

export default function TeacherUploadNotes() {
  const [, params] = useRoute("/teacher/course/:id/upload");
  const [, setLocation] = useLocation();
  const courseId = params?.id;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/notes/upload", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notes uploaded!",
        description: "Your notes have been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "notes"] });
      setLocation(`/teacher/course/${courseId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append("courseId", courseId || "");
    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    if (file) {
      submitData.append("file", file);
    }

    uploadMutation.mutate(submitData);
  };

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Link href={`/teacher/course/${courseId}`}>
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-display">Upload Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Notes Title</Label>
                  <Input
                    id="title"
                    placeholder="Chapter 1: Introduction"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Notes Content (Text)</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste your notes here or upload a PDF below..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    data-testid="input-content"
                  />
                  <p className="text-sm text-muted-foreground">
                    You can either paste text content or upload a PDF file
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload PDF (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate">
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      data-testid="input-file"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      {file ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <FileText className="h-8 w-8" />
                          <span className="font-medium">{file.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload PDF or drag and drop
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={uploadMutation.isPending || (!formData.content && !file)}
                  data-testid="button-upload"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Notes
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
