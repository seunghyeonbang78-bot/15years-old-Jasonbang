import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { emptyProfile } from "./analyzer.js";

const folder = path.dirname(fileURLToPath(import.meta.url));
const dataFolder = path.join(folder, "data");
const conversationFolder = path.join(dataFolder, "conversations");
const profileFile = path.join(dataFolder, "user_profile.json");

async function ensureFolders() {
  await mkdir(conversationFolder, { recursive: true });
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

async function saveJson(filePath, data) {
  await ensureFolders();

  const temporaryFile = `${filePath}.tmp`;

  await writeFile(
    temporaryFile,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  await rename(temporaryFile, filePath);
}

export async function loadProfile() {
  return readJson(profileFile, emptyProfile());
}

export async function saveProfile(profile) {
  return saveJson(profileFile, profile);
}

export async function loadConversation(sessionId) {
  const filePath = path.join(conversationFolder, `${sessionId}.json`);
  return readJson(filePath, []);
}

export async function saveConversation(sessionId, conversation) {
  const filePath = path.join(conversationFolder, `${sessionId}.json`);

  // 최근 대화 20개만 저장
  return saveJson(filePath, conversation.slice(-20));
}
