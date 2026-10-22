import httpClient from '@/lib/http';
import type { Survey, Attempt, EvaluationResult } from '@/types';

export const surveyApi = {
  getSurveys: async (): Promise<Survey[]> => {
    const { data } = await httpClient.get('/surveys');
    return data;
  },

  getSurveyById: async (id: string): Promise<Survey> => {
    const { data } = await httpClient.get(`/surveys/${id}`);
    return data;
  },

  startAttempt: async (surveyId: string): Promise<Attempt> => {
    const { data } = await httpClient.post('/responses', { surveyId });
    return data;
  },

  submitAnswer: async (attemptId: string, questionId: string, value: number) => {
    const { data } = await httpClient.post(`/responses/${attemptId}/answers`, { questionId, value });
    return data;
  },

  submitSectionAnswers: async (
    attemptId: string,
    answers: { questionId: string; value: number }[],
  ) => {
    const promises = answers.map(a => httpClient.post(`/responses/${attemptId}/answers`, a));
    return Promise.all(promises);
  },

  finalizeAttempt: async (attemptId: string): Promise<EvaluationResult> => {
    const { data } = await httpClient.post(`/responses/${attemptId}/finalize`);
    return data;
  },

  getAttempt: async (attemptId: string): Promise<Attempt> => {
    const { data } = await httpClient.get(`/responses/${attemptId}`);
    return data;
  },
};
