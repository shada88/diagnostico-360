export interface ContactChannel {
  number: string;
  display: string;
  intent: 'sales' | 'support';
}

export const contact = {
  sales: {
    number: process.env.NEXT_PUBLIC_CONTACT_SALES ?? '+15555550100',
    display: '+1 555 555 0100',
    intent: 'sales',
  } satisfies ContactChannel,
  support: {
    number: process.env.NEXT_PUBLIC_CONTACT_SUPPORT ?? '+15555550199',
    display: '+1 555 555 0199',
    intent: 'support',
  } satisfies ContactChannel,
} as const;
