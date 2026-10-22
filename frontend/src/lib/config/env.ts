export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3006',
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000',
} as const;
