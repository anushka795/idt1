import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authenticateToken, requireRole, type AuthRequest } from "./auth";
import { generateQuizFromNotes } from "./ai";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/student/register", upload.none(), async (req, res) => {
    try {
      const { name, email, mobile, password, classYear, branch, collegeName } = req.body;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser({
        name,
        email,
        passwordHash: hashPassword(password),
        mobile,
        role: "student",
      });

      const profile = await storage.createStudentProfile({
        userId: user.id,
        classYear,
        branch,
        collegeName: collegeName || undefined,
      });

      const token = generateToken(user.id, user.role);

      res.json({
        token,
        user,
        profile,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/student/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "student") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.role);

      res.json({
        token,
        user,
        profile: user.studentProfile,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/teacher/register", upload.single("resume"), async (req, res) => {
    try {
      const { name, email, mobile, password, department, experienceYears } = req.body;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser({
        name,
        email,
        passwordHash: hashPassword(password),
        mobile,
        role: "teacher",
      });

      const profile = await storage.createTeacherProfile({
        userId: user.id,
        department,
        experienceYears: parseInt(experienceYears),
        resumePath: req.file?.path,
      });

      const token = generateToken(user.id, user.role);

      res.json({
        token,
        user,
        profile,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/teacher/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "teacher") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.role);

      res.json({
        token,
        user,
        profile: user.teacherProfile,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/teacher/verification-test", authenticateToken, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const { answers } = req.body;
      const userId = req.user!.userId;

      const correctAnswers = ["1", "2", "1", "2", "1"];
      let correct = 0;
      Object.entries(answers).forEach(([questionId, answerIndex]) => {
        const qIndex = parseInt(questionId.replace("q", "")) - 1;
        if (correctAnswers[qIndex] === answerIndex) {
          correct++;
        }
      });

      const score = Math.round((correct / correctAnswers.length) * 100);
      const passed = score >= 60;

      await storage.updateTeacherStatus(userId, passed ? "verified" : "pending", score);

      res.json({ passed, score });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", authenticateToken, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const { title, description, classYear, branch } = req.body;
      const userId = req.user!.userId;

      const course = await storage.createCourse({
        title,
        description,
        classYear,
        branch,
        createdBy: userId,
      });

      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses", authenticateToken, async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", authenticateToken, async (req, res) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teacher/courses", authenticateToken, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const courses = await storage.getCoursesByTeacher(req.user!.userId);
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teacher/stats", authenticateToken, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getTeacherStats(req.user!.userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notes/upload", authenticateToken, requireRole("teacher"), upload.single("file"), async (req: AuthRequest, res) => {
    try {
      const { courseId, title, content } = req.body;
      const userId = req.user!.userId;

      const note = await storage.createNotes({
        courseId,
        teacherId: userId,
        title,
        content: content || undefined,
        filePath: req.file?.path,
      });

      res.json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id/notes", authenticateToken, async (req, res) => {
    try {
      const notes = await storage.getNotesByCourse(req.params.id);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/notes/:id", authenticateToken, async (req, res) => {
    try {
      const note = await storage.getNotesById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Notes not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quizzes/generate", authenticateToken, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const { notesId, title } = req.body;
      const userId = req.user!.userId;

      const note = await storage.getNotesById(notesId);
      if (!note) {
        return res.status(404).json({ message: "Notes not found" });
      }

      const content = note.content || "";
      if (!content) {
        return res.status(400).json({ message: "Notes content is empty" });
      }

      const questions = await generateQuizFromNotes(content, note.title);

      const quiz = await storage.createQuiz({
        courseId: note.courseId,
        notesId,
        createdBy: userId,
        title,
        questions,
      });

      res.json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id/quizzes", authenticateToken, async (req, res) => {
    try {
      const quizzes = await storage.getQuizzesByCourse(req.params.id);
      res.json(quizzes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quizzes/:id", authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuizById(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quizzes/:id/submit", authenticateToken, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const { answers, timeTakenSeconds } = req.body;
      const quizId = req.params.id;
      const userId = req.user!.userId;

      const quiz = await storage.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const questions = quiz.questions as any[];
      let correct = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correctIndex) {
          correct++;
        }
      });

      const score = correct;
      const totalQuestions = questions.length;
      const accuracy = Math.round((correct / totalQuestions) * 100);
      
      let xpEarned = score * 10;
      if (timeTakenSeconds < totalQuestions * 60) {
        xpEarned += 20;
      }
      if (accuracy >= 90) {
        xpEarned += 30;
      }

      const newBadges: string[] = [];
      if (accuracy >= 90) newBadges.push("Top Scorer");
      if (timeTakenSeconds < totalQuestions * 45) newBadges.push("Fast Solver");

      await storage.createQuizAttempt({
        quizId,
        studentId: userId,
        score,
        totalQuestions,
        accuracy,
        timeTakenSeconds,
        xpEarned,
        answers,
      });

      await storage.updateStudentXpAndBadges(userId, xpEarned, newBadges);

      res.json({
        score,
        accuracy,
        timeTakenSeconds,
        xpEarned,
        newBadges,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/leaderboard/global", authenticateToken, async (req, res) => {
    try {
      const leaderboard = await storage.getGlobalLeaderboard();
      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/leaderboard/course/:id", authenticateToken, async (req, res) => {
    try {
      const leaderboard = await storage.getCourseLeaderboard(req.params.id);
      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/leaderboard/rank", authenticateToken, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const rank = await storage.getStudentRank(req.user!.userId);
      res.json(rank || { rank: null, totalStudents: 0 });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/doubts", authenticateToken, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const { courseId, title, description } = req.body;
      const userId = req.user!.userId;

      const doubt = await storage.createDoubt({
        courseId,
        studentId: userId,
        title,
        description,
      });

      res.json(doubt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/doubts/course/:courseId", authenticateToken, async (req, res) => {
    try {
      const doubts = await storage.getDoubtsByCourse(req.params.courseId);
      res.json(doubts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/doubts/:id", authenticateToken, async (req, res) => {
    try {
      const doubt = await storage.getDoubtById(req.params.id);
      if (!doubt) {
        return res.status(404).json({ message: "Doubt not found" });
      }
      res.json(doubt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/doubts/:id/resolve", authenticateToken, async (req, res) => {
    try {
      await storage.updateDoubtStatus(req.params.id, "resolved");
      res.json({ message: "Doubt resolved" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/doubts/:id/comments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { text } = req.body;
      const doubtId = req.params.id;
      const userId = req.user!.userId;

      const comment = await storage.createDoubtComment({
        doubtId,
        authorId: userId,
        text,
      });

      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/doubts/:id/comments", authenticateToken, async (req, res) => {
    try {
      const comments = await storage.getCommentsByDoubt(req.params.id);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
