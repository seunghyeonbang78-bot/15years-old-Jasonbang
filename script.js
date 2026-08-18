const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const messages = document.querySelector("#messages");
const button = document.querySelector("#send-button");

function getSessionId() {
  let sessionId = localStorage.getItem("jason-ai-session-id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("jason-ai-session-id", sessionId);
  }

  return sessionId;
}

function addMessage(role, text) {
  const element = document.createElement("p");
  element.className = `message ${role}`;
  element.textContent = text;
  messages.appendChild(element);
  messages.scrollTop = messages.scrollHeight;
  return element;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";
  input.disabled = true;
  button.disabled = true;

  const waiting = addMessage("assistant", "생각 중...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
        message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "요청에 실패했습니다.");
    }

    waiting.textContent = data.reply;
  } catch (error) {
    waiting.textContent = `오류: ${error.message}`;
  } finally {
    input.disabled = false;
    button.disabled = false;
    input.focus();
  }
});
