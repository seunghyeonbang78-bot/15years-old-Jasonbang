import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createReply } from "./ai.js";
import { updateProfile } from "./analyzer.js";
import {
  loadConversation,
  loadProfile,
  saveConversation,
  saveProfile
} from "./memory.js";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("backend/.env 파일에 OPENAI_API_KEY를 넣으세요.");
}

const app = express();
const backendFolder = path.dirname(fileURLToPath(import.meta.url));
const projectFolder = path.resolve(backendFolder, "..");

app.use(express.json({ limit: "50kb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60
  })
);

app.get("/", (_request, response) => {
  response.sendFile(path.join(projectFolder, "index.html"));
});

app.get("/style.css", (_request, response) => {
  response.sendFile(path.join(projectFolder, "style.css"));
});

app.get("/script.js", (_request, response) => {
  response.sendFile(path.join(projectFolder, "script.js"));
});

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/chat", async (request, response) => {
  try {
    const { sessionId, message } = request.body;

    if (
      typeof sessionId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(sessionId)
    ) {
      return response.status(400).json({ error: "잘못된 세션입니다." });
    }

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    ) {
      return response
        .status(400)
        .json({ error: "메시지는 1~4000자여야 합니다." });
    }

    const cleanMessage = message.trim();

    const [profile, oldConversation] = await Promise.all([
      loadProfile(),
      loadConversation(sessionId)
    ]);

    const nextProfile = updateProfile(profile, cleanMessage);

    const conversationForAI = [
      ...oldConversation,
      { role: "user", content: cleanMessage }
    ];

    const reply = await createReply(conversationForAI, nextProfile);

    const nextConversation = [
      ...conversationForAI,
      { role: "assistant", content: reply }
    ];

    await Promise.all([
      saveProfile(nextProfile),
      saveConversation(sessionId, nextConversation)
    ]);

    response.json({ reply });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      error: "서버 오류가 발생했습니다. API 키와 서버 터미널을 확인하세요."
    });
  }
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});
