/* ================================================
   quiz-generator.js
   Topic → Auto-generate questions using Google Gemini only
   ALA QUIZPEDIA by A.SHAM SHARAN
   ================================================ */

/* ---- Google Gemini AI Generator ---- */
async function generateFromGemini(apiKey, topic, count) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `You are a professional quiz maker for a general knowledge app called ALA QUIZPEDIA.
Your task is to generate a list of ${count} high-quality trivia questions about the topic "${topic}".
Each question can be one of three types:
1. "mcq" (Multiple Choice Question, must have exactly 4 options and 1 correctAnswer matching one of the options)
2. "truefalse" (True or False, options must be ["True", "False"], correctAnswer must be "True" or "False")
3. "fillinblank" (Fill in the blank, options must be an empty array [], correctAnswer must be a short string)

Format your response as a valid JSON array of objects matching this exact structure:
[
  {
    "type": "mcq" | "truefalse" | "fillinblank",
    "questionText": "The text of the question",
    "options": ["Option A", "Option B", "Option C", "Option D"], // or [] for fillinblank, or ["True", "False"] for truefalse
    "correctAnswer": "The exact string of the correct option or correct fill-in value",
    "explanation": "A short sentence explaining why this is correct"
  }
]

Do not include any markdown format tags, backticks, or any text other than the JSON itself. It must be directly parseable by JSON.parse.`;

  const payload = {
    contents: [{ parts: [{ text: systemPrompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Error: ${response.status} - ${errText}`);
  }

  const resData = await response.json();
  const rawText = resData.candidates[0].content.parts[0].text;
  const questions = JSON.parse(rawText);
  if (!Array.isArray(questions)) {
    throw new Error("Invalid response format from Gemini.");
  }
  return questions.map(q => ({
    id: 'q-' + Math.random().toString(36).substr(2, 9),
    type: q.type || 'mcq',
    questionText: q.questionText,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || ''
  }));
}

/* ---- Main entry point ---- */
async function generateQuestionsFromTopic(topic, count = 10) {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error('Gemini API key not set. Please save your key in the Admin panel.');
  }
  // Directly call Gemini – no fallback to Open Trivia DB or Wikipedia
  return await generateFromGemini(apiKey, topic, count);
}

/* ---- Utility ---- */
function genId(prefix) {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
}
