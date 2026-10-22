import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import type { AppConfig } from '../config';

@Injectable()
export class AiService {
  private geminiClient: GoogleGenAI | null = null;
  private groqClient: unknown = null;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const geminiKey = this.configService.get('ai.geminiApiKey', { infer: true });
    const groqKey   = this.configService.get('ai.groqApiKey',   { infer: true });

    if (geminiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: geminiKey });
      console.log('GoogleGenAI SDK initialized successfully.');
    } else {
      console.warn('GEMINI_API_KEY is not set. Gemini features will be disabled.');
    }

    if (groqKey) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const GroqModule = require('groq-sdk');
        const GroqClass  = GroqModule.default ?? GroqModule;
        this.groqClient  = new GroqClass({ apiKey: groqKey });
        console.log('Groq SDK initialized successfully.');
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn('[AiService] Could not initialize Groq SDK:', msg);
      }
    } else {
      console.warn('GROQ_API_KEY is not set. Groq fallback will be disabled.');
    }
  }

  async generate(prompt: string, expectJson: boolean = false): Promise<string> {
    if (this.geminiClient) {
      try {
        return await this.generateWithGemini(prompt, expectJson);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn('[AiService] Gemini failed, falling back to Groq:', msg);
      }
    }

    if (this.groqClient) {
      try {
        return await this.generateWithGroq(prompt, expectJson);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[AiService] Groq also failed:', msg);
        throw error;
      }
    }

    return 'AI Service not configured.';
  }

  private async generateWithGemini(prompt: string, expectJson: boolean): Promise<string> {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const response = await this.geminiClient!.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: expectJson ? { responseMimeType: 'application/json' } : undefined,
        });
        return response.text || 'No response generated.';
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[AiService] Gemini API Error (Attempt ${attempt + 1}):`, msg);
        if (attempt === maxRetries) throw error;
        await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 1000));
        attempt++;
      }
    }

    return 'No response generated.';
  }

  private async generateWithGroq(prompt: string, expectJson: boolean): Promise<string> {
    const groq = this.groqClient as {
      chat: {
        completions: {
          create: (opts: unknown) => Promise<{ choices: Array<{ message: { content: string } }> }>;
        };
      };
    };
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      ...(expectJson && { response_format: { type: 'json_object' } }),
      temperature: 0.3,
      max_completion_tokens: 4096,
    });
    return completion.choices[0]?.message?.content || 'No response generated.';
  }
}
