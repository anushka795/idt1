import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import StudentLogin from "@/pages/student-login";
import StudentSignup from "@/pages/student-signup";
import TeacherLogin from "@/pages/teacher-login";
import TeacherSignup from "@/pages/teacher-signup";
import TeacherVerification from "@/pages/teacher-verification";
import StudentDashboard from "@/pages/student-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentCourses from "@/pages/student-courses";
import StudentCourseDetail from "@/pages/student-course-detail";
import StudentQuiz from "@/pages/student-quiz";
import StudentLeaderboard from "@/pages/student-leaderboard";
import StudentCreateDoubt from "@/pages/student-create-doubt";
import StudentDoubtDetail from "@/pages/student-doubt-detail";
import TeacherCreateCourse from "@/pages/teacher-create-course";
import TeacherCourseDetail from "@/pages/teacher-course-detail";
import TeacherUploadNotes from "@/pages/teacher-upload-notes";
import TeacherGenerateQuiz from "@/pages/teacher-generate-quiz";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      <Route path="/student/login" component={StudentLogin} />
      <Route path="/student/signup" component={StudentSignup} />
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/courses" component={StudentCourses} />
      <Route path="/student/course/:id" component={StudentCourseDetail} />
      <Route path="/student/quiz/:id" component={StudentQuiz} />
      <Route path="/student/leaderboard" component={StudentLeaderboard} />
      <Route path="/student/course/:id/doubts/new" component={StudentCreateDoubt} />
      <Route path="/student/doubt/:id" component={StudentDoubtDetail} />
      
      <Route path="/teacher/login" component={TeacherLogin} />
      <Route path="/teacher/signup" component={TeacherSignup} />
      <Route path="/teacher/verification" component={TeacherVerification} />
      <Route path="/teacher/dashboard" component={TeacherDashboard} />
      <Route path="/teacher/courses/create" component={TeacherCreateCourse} />
      <Route path="/teacher/course/:id" component={TeacherCourseDetail} />
      <Route path="/teacher/course/:id/upload" component={TeacherUploadNotes} />
      <Route path="/teacher/notes/:id/generate-quiz" component={TeacherGenerateQuiz} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
