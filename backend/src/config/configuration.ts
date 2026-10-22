import { configSchema } from './config.schema';
import type { AppConfig } from './config.types';

export const configuration = (): AppConfig => {
  const parsed = configSchema.safeParse({
    app: {
      nodeEnv: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    },
    mail: {
      resendApiKey: process.env.RESEND_API_KEY ?? '',
      fromDomain: process.env.MAIL_DOMAIN,
    },
    reminders: {
      cronExpression: process.env.REMINDER_CRON,
      followUpThreshold: process.env.REMINDER_THRESHOLD_DAYS,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    ai: {
      geminiApiKey: process.env.GEMINI_API_KEY,
      groqApiKey:   process.env.GROQ_API_KEY,
    },
  });

  if (!parsed.success) {
    throw new Error(`Config validation failed: ${parsed.error.message}`);
  }

  return parsed.data;
};
