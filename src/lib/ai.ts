/**
 * AI nutritionist — food photo / description analysis via the Claude API.
 *
 * Runs directly from the browser with the user's own Anthropic API key
 * (stored only in this device's localStorage; `dangerouslyAllowBrowser`
 * opts into the API's CORS support). There is no app server — requests go
 * straight from the phone to api.anthropic.com.
 */
import Anthropic from '@anthropic-ai/sdk';

export interface AiFoodItem {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AiAnalysis {
  items: AiFoodItem[];
  tips: string[];
}

const MODEL = 'claude-opus-4-8';

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      description: 'Each distinct food item identified, with per-serving estimates',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          serving: { type: 'string', description: 'Estimated portion, e.g. "1 cup" or "6 oz"' },
          calories: { type: 'integer' },
          protein: { type: 'number', description: 'grams' },
          carbs: { type: 'number', description: 'grams' },
          fat: { type: 'number', description: 'grams' }
        },
        required: ['name', 'serving', 'calories', 'protein', 'carbs', 'fat']
      }
    },
    tips: {
      type: 'array',
      description: '1-3 short, practical nutritionist tips about this meal for this user',
      items: { type: 'string' }
    }
  },
  required: ['items', 'tips']
} as const;

function systemPrompt(context: { goal: string; calorieTarget: number; caloriesSoFar: number }): string {
  return `You are a registered-dietitian-style nutrition assistant inside a running app.
Estimate nutrition for the meal the user shows or describes. Be realistic about
portion sizes — when uncertain, estimate the middle of the plausible range and
say so in the serving field. Split composite meals into their main components.

User context: goal is to ${context.goal} weight, daily target ${context.calorieTarget} kcal,
${context.caloriesSoFar} kcal already logged today. Tips should be short, concrete and
kind — one or two sentences each, tailored to a runner with that goal.`;
}

/** Downscale + JPEG-encode an image file so uploads stay small and cheap. */
export async function fileToJpegBase64(file: File, maxEdge = 1024): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('bad image'));
      i.src = url;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function analyzeFood(
  apiKey: string,
  input: { photoBase64Jpeg?: string; description?: string },
  context: { goal: string; calorieTarget: number; caloriesSoFar: number }
): Promise<AiAnalysis> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const content: Anthropic.ContentBlockParam[] = [];
  if (input.photoBase64Jpeg) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: input.photoBase64Jpeg }
    });
  }
  content.push({
    type: 'text',
    text: input.description?.trim()
      ? `Estimate the nutrition for this: ${input.description.trim()}`
      : 'Estimate the nutrition for the food in this photo.'
  });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: systemPrompt(context),
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content }]
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('The AI declined to analyze that input.');
  }
  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  const parsed = JSON.parse(text) as AiAnalysis;
  if (!Array.isArray(parsed.items)) throw new Error('Unexpected response shape');
  return parsed;
}

/** Human-readable message for common API failures. */
export function aiErrorMessage(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return 'That API key was rejected — check it in the settings below.';
  if (err instanceof Anthropic.RateLimitError) return 'Rate limited — wait a moment and try again.';
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach the AI service — check your connection.";
  if (err instanceof Anthropic.APIError) return `AI request failed (${err.status ?? 'error'}).`;
  return err instanceof Error ? err.message : 'Something went wrong.';
}
