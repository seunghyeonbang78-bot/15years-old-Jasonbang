const EXPRESSIONS = ["ㅋㅋ", "ㅎㅎ", "ㅇㅇ", "ㄹㅇ", "근데", "아니"];

export function emptyProfile() {
  return {
    messagesAnalyzed: 0,
    totalCharacters: 0,
    questionMessages: 0,
    expressionCounts: {},
    recentExamples: [],
    styleSummary: "아직 대화가 충분하지 않습니다.",
    updatedAt: null
  };
}

export function updateProfile(profile, message) {
  const next = { ...emptyProfile(), ...profile };

  next.messagesAnalyzed += 1;
  next.totalCharacters += message.length;

  if (message.includes("?")) {
    next.questionMessages += 1;
  }

  for (const expression of EXPRESSIONS) {
    if (message.includes(expression)) {
      next.expressionCounts[expression] =
        (next.expressionCounts[expression] || 0) + 1;
    }
  }

  next.recentExamples = [...next.recentExamples, message.slice(0, 200)].slice(-8);

  const averageLength = Math.round(
    next.totalCharacters / next.messagesAnalyzed
  );

  const commonExpressions = Object.entries(next.expressionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([expression]) => expression);

  next.styleSummary =
    `평균 메시지 길이: ${averageLength}자. ` +
    `질문 비율: ${Math.round(
      (next.questionMessages / next.messagesAnalyzed) * 100
    )}%. ` +
    (commonExpressions.length
      ? `자주 쓰는 표현: ${commonExpressions.join(", ")}. `
      : "") +
    "이 정보는 추정치이므로 과하게 흉내 내지 말고 자연스럽게 대화하세요.";

  next.updatedAt = new Date().toISOString();

  return next;
}
