import { z } from 'zod';
import { configSchema } from './config.schema';

export type AppConfig = z.infer<typeof configSchema>;
