import {
  users,
  studentProfiles,
  teacherProfiles,
  courses,
  notes,
  quizzes,
  quizAttempts,
  doubts,
  doubtComments,
  type User,
  type StudentProfile,
  type TeacherProfile,
  type Course,
  type Notes,
  type Quiz,
  type QuizAttempt,
  type Doubt,
  type DoubtComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUserByEmail(email: string): Promise<(User & { studentProfile?: StudentProfile; teacherProfile?: TeacherProfile }) | undefined>;
  createUser(userData: { name: string; email: string; passwordHash: string; mobile: string; role: string }): Promise<User>;
  createStudentProfile(profileData: { userId: string; classYear: string; branch: string; collegeName?: string }): Promise<StudentProfile>;
  createTeacherProfile(profileData: { userId: string; department: string; experienceYears: number; resumePath?: string }): Promise<TeacherProfile>;
  updateTeacherStatus(userId: string, status: string, testScore?: number): Promise<void>;
  updateStudentXpAndBadges(userId: string, xpToAdd: number, newBadges: string[]): Promise<void>;
  
  createCourse(courseData: { title: string; description: string; classYear: string; branch: string; createdBy: string }): Promise<Course>;
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  getCoursesByTeacher(teacherId: string): Promise<Course[]>;
  
  createNotes(notesData: { courseId: string; teacherId: string; title: string; content?: string; filePath?: string }): Promise<Notes>;
  getNotesByCourse(courseId: string): Promise<Notes[]>;
  getNotesById(id: string): Promise<Notes | undefined>;
  
  createQuiz(quizData: { courseId: string; notesId?: string; createdBy: string; title: string; questions: any }): Promise<Quiz>;
  getQuizzesByCourse(courseId: string): Promise<Quiz[]>;
  getQuizById(id: string): Promise<Quiz | undefined>;
  
  createQuizAttempt(attemptData: { quizId: string; studentId: string; score: number; totalQuestions: number; accuracy: number; timeTakenSeconds: number; xpEarned: number; answers: any }): Promise<QuizAttempt>;
  getAttemptsByStudent(studentId: string): Promise<QuizAttempt[]>;
  
  getGlobalLeaderboard(): Promise<any[]>;
  getCourseLeaderboard(courseId: string): Promise<any[]>;
  getStudentRank(studentId: string): Promise<{ rank: number; totalStudents: number } | null>;
  
  createDoubt(doubtData: { courseId: string; studentId: string; title: string; description: string }): Promise<Doubt>;
  getDoubtsByCourse(courseId: string): Promise<Doubt[]>;
  getDoubtById(id: string): Promise<Doubt | undefined>;
  updateDoubtStatus(id: string, status: string): Promise<void>;
  
  createDoubtComment(commentData: { doubtId: string; authorId: string; text: string }): Promise<DoubtComment>;
  getCommentsByDoubt(doubtId: string): Promise<any[]>;
  
  getTeacherStats(teacherId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return undefined;

    const [studentProfile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, user.id));
    const [teacherProfile] = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id));

    return {
      ...user,
      studentProfile,
      teacherProfile,
    };
  }

  async createUser(userData: { name: string; email: string; passwordHash: string; mobile: string; role: string }) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async createStudentProfile(profileData: { userId: string; classYear: string; branch: string; collegeName?: string }) {
    const [profile] = await db.insert(studentProfiles).values(profileData).returning();
    return profile;
  }

  async createTeacherProfile(profileData: { userId: string; department: string; experienceYears: number; resumePath?: string }) {
    const [profile] = await db.insert(teacherProfiles).values(profileData).returning();
    return profile;
  }

  async updateTeacherStatus(userId: string, status: string, testScore?: number) {
    await db
      .update(teacherProfiles)
      .set({ status, testScore })
      .where(eq(teacherProfiles.userId, userId));
  }

  async updateStudentXpAndBadges(userId: string, xpToAdd: number, newBadges: string[]) {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId));
    if (!profile) return;

    const currentBadges = (profile.badges as string[]) || [];
    const updatedBadges = [...new Set([...currentBadges, ...newBadges])];

    await db
      .update(studentProfiles)
      .set({
        xp: profile.xp + xpToAdd,
        badges: updatedBadges,
      })
      .where(eq(studentProfiles.userId, userId));
  }

  async createCourse(courseData: { title: string; description: string; classYear: string; branch: string; createdBy: string }) {
    const [course] = await db.insert(courses).values(courseData).returning();
    return course;
  }

  async getAllCourses() {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getCourseById(id: string) {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByTeacher(teacherId: string) {
    return await db.select().from(courses).where(eq(courses.createdBy, teacherId)).orderBy(desc(courses.createdAt));
  }

  async createNotes(notesData: { courseId: string; teacherId: string; title: string; content?: string; filePath?: string }) {
    const [note] = await db.insert(notes).values(notesData).returning();
    return note;
  }

  async getNotesByCourse(courseId: string) {
    return await db.select().from(notes).where(eq(notes.courseId, courseId)).orderBy(desc(notes.createdAt));
  }

  async getNotesById(id: string) {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async createQuiz(quizData: { courseId: string; notesId?: string; createdBy: string; title: string; questions: any }) {
    const [quiz] = await db.insert(quizzes).values(quizData).returning();
    return quiz;
  }

  async getQuizzesByCourse(courseId: string) {
    return await db.select().from(quizzes).where(eq(quizzes.courseId, courseId)).orderBy(desc(quizzes.createdAt));
  }

  async getQuizById(id: string) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuizAttempt(attemptData: { quizId: string; studentId: string; score: number; totalQuestions: number; accuracy: number; timeTakenSeconds: number; xpEarned: number; answers: any }) {
    const [attempt] = await db.insert(quizAttempts).values(attemptData).returning();
    return attempt;
  }

  async getAttemptsByStudent(studentId: string) {
    return await db.select().from(quizAttempts).where(eq(quizAttempts.studentId, studentId)).orderBy(desc(quizAttempts.completedAt));
  }

  async getGlobalLeaderboard() {
    const result = await db
      .select({
        userId: users.id,
        name: users.name,
        classYear: studentProfiles.classYear,
        branch: studentProfiles.branch,
        xp: studentProfiles.xp,
        badges: studentProfiles.badges,
      })
      .from(studentProfiles)
      .innerJoin(users, eq(users.id, studentProfiles.userId))
      .orderBy(desc(studentProfiles.xp));

    const leaderboard = await Promise.all(
      result.map(async (entry, index) => {
        const attempts = await db
          .select()
          .from(quizAttempts)
          .where(eq(quizAttempts.studentId, entry.userId));

        const avgAccuracy = attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length)
          : 0;

        return {
          rank: index + 1,
          ...entry,
          accuracy: avgAccuracy,
        };
      })
    );

    return leaderboard;
  }

  async getCourseLeaderboard(courseId: string) {
    const courseQuizzes = await db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.courseId, courseId));
    
    if (courseQuizzes.length === 0) return [];

    const quizIds = courseQuizzes.map(q => q.id);
    
    const allAttempts = await db.select().from(quizAttempts);
    const attempts = allAttempts.filter(a => quizIds.includes(a.quizId));

    const studentXp = new Map<string, number>();
    const studentAccuracies = new Map<string, number[]>();

    attempts.forEach(attempt => {
      studentXp.set(attempt.studentId, (studentXp.get(attempt.studentId) || 0) + attempt.xpEarned);
      const accuracies = studentAccuracies.get(attempt.studentId) || [];
      accuracies.push(attempt.accuracy);
      studentAccuracies.set(attempt.studentId, accuracies);
    });

    const leaderboard = await Promise.all(
      Array.from(studentXp.entries()).map(async ([studentId, courseXp]) => {
        const [user] = await db.select().from(users).where(eq(users.id, studentId));
        const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, studentId));
        const accuracies = studentAccuracies.get(studentId) || [];
        const avgAccuracy = accuracies.length > 0
          ? Math.round(accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length)
          : 0;

        return {
          userId: studentId,
          name: user?.name || "Unknown",
          classYear: profile?.classYear || "",
          branch: profile?.branch || "",
          courseXp,
          accuracy: avgAccuracy,
        };
      })
    );

    leaderboard.sort((a, b) => b.courseXp - a.courseXp);
    return leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  async getStudentRank(studentId: string) {
    const allStudents = await db
      .select({
        userId: studentProfiles.userId,
        xp: studentProfiles.xp,
      })
      .from(studentProfiles)
      .orderBy(desc(studentProfiles.xp));

    const rank = allStudents.findIndex(s => s.userId === studentId) + 1;
    return rank > 0 ? { rank, totalStudents: allStudents.length } : null;
  }

  async createDoubt(doubtData: { courseId: string; studentId: string; title: string; description: string }) {
    const [doubt] = await db.insert(doubts).values(doubtData).returning();
    return doubt;
  }

  async getDoubtsByCourse(courseId: string) {
    return await db.select().from(doubts).where(eq(doubts.courseId, courseId)).orderBy(desc(doubts.createdAt));
  }

  async getDoubtById(id: string) {
    const [doubt] = await db.select().from(doubts).where(eq(doubts.id, id));
    return doubt;
  }

  async updateDoubtStatus(id: string, status: string) {
    await db.update(doubts).set({ status }).where(eq(doubts.id, id));
  }

  async createDoubtComment(commentData: { doubtId: string; authorId: string; text: string }) {
    const [comment] = await db.insert(doubtComments).values(commentData).returning();
    return comment;
  }

  async getCommentsByDoubt(doubtId: string) {
    const comments = await db
      .select({
        id: doubtComments.id,
        text: doubtComments.text,
        createdAt: doubtComments.createdAt,
        authorId: doubtComments.authorId,
        authorName: users.name,
        authorRole: users.role,
      })
      .from(doubtComments)
      .innerJoin(users, eq(users.id, doubtComments.authorId))
      .where(eq(doubtComments.doubtId, doubtId))
      .orderBy(doubtComments.createdAt);

    return comments;
  }

  async getTeacherStats(teacherId: string) {
    const teacherCourses = await this.getCoursesByTeacher(teacherId);
    const coursesCount = teacherCourses.length;

    let notesCount = 0;
    let quizzesCount = 0;
    let attemptsCount = 0;

    for (const course of teacherCourses) {
      const courseNotes = await this.getNotesByCourse(course.id);
      notesCount += courseNotes.length;

      const courseQuizzes = await this.getQuizzesByCourse(course.id);
      quizzesCount += courseQuizzes.length;

      for (const quiz of courseQuizzes) {
        const attempts = await db.select().from(quizAttempts).where(eq(quizAttempts.quizId, quiz.id));
        attemptsCount += attempts.length;
      }
    }

    return { coursesCount, notesCount, quizzesCount, attemptsCount };
  }
}

export const storage = new DatabaseStorage();
