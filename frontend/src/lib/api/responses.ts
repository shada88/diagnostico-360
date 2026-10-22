import httpClient from '@/lib/http';
import type { AttemptSummary } from '@/types/answers';

export const responsesApi = {
  getUserAttempts: async (): Promise<AttemptSummary[]> => {
    const { data } = await httpClient.get('/responses');
    return data;
  },

  deleteAttempt: async (id: string): Promise<void> => {
    await httpClient.delete(`/responses/${id}`);
  },
};
