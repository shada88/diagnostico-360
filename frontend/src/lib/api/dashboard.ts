import httpClient from '@/lib/http';
import type { DashboardDTO } from '@/types/dashboard';
import type { DimensionGroup } from '@/types/answers';
import type { EvolutionAnalysisDTO } from '@/types/evolution';

export const dashboardApi = {
  getDashboard: async (attemptId: string): Promise<DashboardDTO> => {
    const { data } = await httpClient.get(`/results/${attemptId}`);
    return data;
  },

  getGlobalHealth: async (attemptId: string): Promise<DashboardDTO['global']> => {
    const { data } = await httpClient.get(`/results/${attemptId}/global`);
    return data;
  },

  getAnswersByDimension: async (attemptId: string): Promise<DimensionGroup[]> => {
    const { data } = await httpClient.get(`/results/${attemptId}/answers`);
    return data;
  },

  getEvolutionAnalysis: async (currentId: string, previousId: string): Promise<EvolutionAnalysisDTO> => {
    const { data } = await httpClient.get(`/results/${currentId}/evolution/${previousId}`);
    return data;
  },
};
