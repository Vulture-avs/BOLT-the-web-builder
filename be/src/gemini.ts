const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

type AppMessageRole = 'user' | 'assistant';

interface AppMessage {
  role: AppMessageRole;
  content: string;
}

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role?: 'user' | 'model';
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
}

interface GeminiPromptFeedback {
  blockReason?: string;
  blockReasonMessage?: string;
}

interface GeminiErrorResponse {
  error?: {
    message?: string;
  };
}

interface GeminiGenerateContentResponse extends GeminiErrorResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: GeminiPromptFeedback;
}

interface GenerateTextParams {
  systemInstruction: string;
  messages: AppMessage[];
  maxOutputTokens: number;
  model?: string;
  thinkingBudget?: number;
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  return apiKey;
}

function getModelName(model?: string) {
  return model ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
}

function toGeminiContents(messages: AppMessage[]): GeminiContent[] {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
}

function extractText(response: GeminiGenerateContentResponse) {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => part.text ?? '')
    .join('')
    .trim();

  if (text) {
    return text;
  }

  const blockReasonMessage = response.promptFeedback?.blockReasonMessage;
  const blockReason = response.promptFeedback?.blockReason;
  const finishReason = response.candidates?.[0]?.finishReason;

  if (blockReasonMessage) {
    throw new Error(`Gemini blocked the request: ${blockReasonMessage}`);
  }

  if (blockReason) {
    throw new Error(`Gemini blocked the request: ${blockReason}`);
  }

  if (finishReason) {
    throw new Error(`Gemini returned no text. Finish reason: ${finishReason}`);
  }

  throw new Error('Gemini returned no text.');
}

export async function generateText({
  systemInstruction,
  messages,
  maxOutputTokens,
  model,
  thinkingBudget,
}: GenerateTextParams) {
  const modelName = getModelName(model);
  const response = await fetch(
    `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent?key=${encodeURIComponent(getGeminiApiKey())}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: toGeminiContents(messages),
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          maxOutputTokens,
          ...(thinkingBudget !== undefined ? {
            thinkingConfig: {
              thinkingBudget,
            },
          } : {}),
        },
      }),
    }
  );

  const data = (await response.json()) as GeminiGenerateContentResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Gemini request failed with status ${response.status}`);
  }

  return extractText(data);
}
