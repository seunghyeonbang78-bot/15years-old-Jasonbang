import OpenAI from "openai";

export async function createReply(history, profile) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6",
    store: false,
    instructions: `
You are a helpful personal conversational AI.

Reply naturally in the user's language.
Do not claim to literally be the user.
Do not claim you have been retrained.

You may gently adapt to the user's style, but do not copy slang excessively.

Inferred user profile:
${profile.styleSummary}

Recent examples:
${JSON.stringify(profile.recentExamples)}
    `,
    input: history.map((item) => ({
      role: item.role,
      content: item.content
    }))
  });

  if (!response.output_text?.trim()) {
    throw new Error("AI가 답변을 만들지 못했습니다.");
  }

  return response.output_text.trim();
}
