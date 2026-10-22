import { contact } from './contact';
import { env } from './env';
import { tokens } from './tokens';

export type { ContactChannel } from './contact';
export { contact } from './contact';
export { env } from './env';
export { tokens } from './tokens';

export const config = {
  contact,
  env,
  tokens,
} as const;
