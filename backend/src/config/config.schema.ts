import { z } from 'zod';

export const configSchema = z.object({
  app: z.object({
    nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
    frontendUrl: z
      .string()
      .url()
      .refine((val) => val.startsWith('http://') || val.startsWith('https://'), {
        message: 'FRONTEND_URL must start with http:// or https://',
      }),
  }),
  mail: z.object({
    resendApiKey: z.string().min(1),
    fromDomain: z.string().default('example.com'),
  }),
  reminders: z.object({
    cronExpression: z.string().default('0 9 * * *'),
    followUpThreshold: z.coerce.number().int().positive().default(30),
  }),
  google: z.object({
    clientId: z.string().min(1),
    clientSecret: z.string().min(1),
    callbackUrl: z.string().url(),
  }),
  supabase: z.object({
    url: z.string().url().optional(),
    anonKey: z.string().optional(),
    serviceRoleKey: z.string().optional(),
  }),
  ai: z.object({
    geminiApiKey: z.string().optional(),
    groqApiKey:   z.string().optional(),
  }),
});
