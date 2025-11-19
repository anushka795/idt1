import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GeneratedQuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  difficulty: "easy" | "medium" | "hard";
}

export async function generateQuizFromNotes(
  content: string,
  title: string
): Promise<GeneratedQuizQuestion[]> {
  try {
    const prompt = `You are an expert educational content creator. Generate a quiz based on the following notes.

Notes Title: ${title}
Notes Content:
${content.slice(0, 4000)}

Generate 5-10 multiple choice questions based on these notes. Each question should:
- Test key concepts from the notes
- Have 4 options
- Have exactly one correct answer
- Vary in difficulty (easy, medium, hard)

Return ONLY a JSON array in this exact format:
[
  {
    "id": "q1",
    "questionText": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "difficulty": "easy"
  }
]

The correctIndex should be 0, 1, 2, or 3 indicating which option is correct.`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert quiz generator. Return only valid JSON arrays of quiz questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const content_text = response.choices[0].message.content;
    if (!content_text) {
      throw new Error("No content generated");
    }

    const parsed = JSON.parse(content_text);
    const questions = parsed.questions || parsed || [];

    if (!Array.isArray(questions)) {
      throw new Error("Invalid response format");
    }

    return questions.map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      questionText: q.questionText || q.question,
      options: q.options || [],
      correctIndex: q.correctIndex ?? 0,
      difficulty: q.difficulty || "medium",
    }));
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}
