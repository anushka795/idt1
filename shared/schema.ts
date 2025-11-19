import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  mobile: text("mobile").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  classYear: text("class_year").notNull(),
  branch: text("branch").notNull(),
  collegeName: text("college_name"),
  xp: integer("xp").notNull().default(0),
  badges: jsonb("badges").notNull().default([]),
});

export const teacherProfiles = pgTable("teacher_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  department: text("department").notNull(),
  experienceYears: integer("experience_years").notNull(),
  resumePath: text("resume_path"),
  status: text("status").notNull().default("pending"),
  testScore: integer("test_score"),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  classYear: text("class_year").notNull(),
  branch: text("branch").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content"),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  notesId: varchar("notes_id").references(() => notes.id, { onDelete: "set null" }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  title: text("title").notNull(),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  accuracy: integer("accuracy").notNull(),
  timeTakenSeconds: integer("time_taken_seconds").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  answers: jsonb("answers").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const doubts = pgTable("doubts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const doubtComments = pgTable("doubt_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doubtId: varchar("doubt_id").notNull().references(() => doubts.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  teacherProfile: one(teacherProfiles, {
    fields: [users.id],
    references: [teacherProfiles.userId],
  }),
  courses: many(courses),
  quizAttempts: many(quizAttempts),
  doubts: many(doubts),
  comments: many(doubtComments),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const teacherProfilesRelations = relations(teacherProfiles, ({ one }) => ({
  user: one(users, {
    fields: [teacherProfiles.userId],
    references: [users.id],
  }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [courses.createdBy],
    references: [users.id],
  }),
  notes: many(notes),
  quizzes: many(quizzes),
  doubts: many(doubts),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  course: one(courses, {
    fields: [notes.courseId],
    references: [courses.id],
  }),
  teacher: one(users, {
    fields: [notes.teacherId],
    references: [users.id],
  }),
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
  notes: one(notes, {
    fields: [quizzes.notesId],
    references: [notes.id],
  }),
  teacher: one(users, {
    fields: [quizzes.createdBy],
    references: [users.id],
  }),
  attempts: many(quizAttempts),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  student: one(users, {
    fields: [quizAttempts.studentId],
    references: [users.id],
  }),
}));

export const doubtsRelations = relations(doubts, ({ one, many }) => ({
  course: one(courses, {
    fields: [doubts.courseId],
    references: [courses.id],
  }),
  student: one(users, {
    fields: [doubts.studentId],
    references: [users.id],
  }),
  comments: many(doubtComments),
}));

export const doubtCommentsRelations = relations(doubtComments, ({ one }) => ({
  doubt: one(doubts, {
    fields: [doubtComments.doubtId],
    references: [doubts.id],
  }),
  author: one(users, {
    fields: [doubtComments.authorId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  xp: true,
  badges: true,
});

export const insertTeacherProfileSchema = createInsertSchema(teacherProfiles).omit({
  id: true,
  status: true,
  testScore: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertNotesSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  completedAt: true,
});

export const insertDoubtSchema = createInsertSchema(doubts).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertDoubtCommentSchema = createInsertSchema(doubtComments).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type InsertTeacherProfile = z.infer<typeof insertTeacherProfileSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Notes = typeof notes.$inferSelect;
export type InsertNotes = z.infer<typeof insertNotesSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type Doubt = typeof doubts.$inferSelect;
export type InsertDoubt = z.infer<typeof insertDoubtSchema>;
export type DoubtComment = typeof doubtComments.$inferSelect;
export type InsertDoubtComment = z.infer<typeof insertDoubtCommentSchema>;

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface AuthResponse {
  token: string;
  user: User;
  profile: StudentProfile | TeacherProfile;
}
