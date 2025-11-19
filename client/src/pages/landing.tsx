import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Trophy, Users, BookOpen, Zap, Award } from "lucide-react";
import heroImage from "@assets/generated_images/College_students_collaborating_campus_b03a1d9f.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="College students collaborating"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 font-display" data-testid="text-hero-title">
            QuizConnect
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-medium" data-testid="text-hero-tagline">
            AI-Powered Learning, Real Results
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/student/login">
              <Button
                size="lg"
                className="text-lg px-8 h-14 bg-primary/90 backdrop-blur-sm border border-primary-border hover-elevate active-elevate-2"
                data-testid="button-student-portal"
              >
                <Users className="mr-2 h-5 w-5" />
                Student Portal
              </Button>
            </Link>
            <Link href="/teacher/login">
              <Button
                size="lg"
                className="text-lg px-8 h-14 bg-card/90 backdrop-blur-sm border hover-elevate active-elevate-2"
                data-testid="button-teacher-portal"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Teacher Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 font-display" data-testid="text-features-title">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-elevate" data-testid="card-feature-1">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Quiz Generation</h3>
                <p className="text-muted-foreground">
                  Upload notes and let AI automatically create engaging quizzes with multiple-choice questions tailored to your content.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-feature-2">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Live Leaderboards</h3>
                <p className="text-muted-foreground">
                  Compete with peers in real-time. Rankings based on accuracy, speed, and XP earned from quiz performances.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-feature-3">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Peer Collaboration</h3>
                <p className="text-muted-foreground">
                  Connect with classmates, discuss doubts, share solutions, and learn together in dedicated course forums.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 font-display" data-testid="text-howitworks-title">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">For Teachers</h3>
                  <p className="text-muted-foreground">Upload course notes → AI generates quizzes → Students compete and learn</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">For Students</h3>
                  <p className="text-muted-foreground">Browse courses → Take quizzes → Earn XP and badges → Climb the leaderboard</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card data-testid="card-stat-1">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold font-display mb-1">10,000+</div>
                  <div className="text-sm text-muted-foreground">Quizzes Generated</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-2">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold font-display mb-1">5,000+</div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-3">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold font-display mb-1">500+</div>
                  <div className="text-sm text-muted-foreground">Verified Teachers</div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-4">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold font-display mb-1">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display" data-testid="text-cta-title">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students and teachers already using QuizConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/student/signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 h-14"
                data-testid="button-student-signup"
              >
                Get Started as Student
              </Button>
            </Link>
            <Link href="/teacher/signup">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                data-testid="button-teacher-signup"
              >
                Join as Teacher
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 QuizConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
