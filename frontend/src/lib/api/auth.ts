import httpClient from '@/lib/http';
import type { User } from '@/types';

export interface RegisterDTO {
  email:       string;
  password:    string;
  name?:       string;
  country?:    string;
  phoneNumber?: string;
}

export interface ProfileUpdateDTO extends Partial<Omit<User, 'id'>> {}

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await httpClient.post('/auth/login', { email, password });
    return data;
  },

  register: async (userData: RegisterDTO) => {
    const { data } = await httpClient.post('/auth/register', userData);
    return data;
  },

  verifyEmail: async (email: string, code: string) => {
    const { data } = await httpClient.post('/auth/verify-email', { email, code });
    return data;
  },

  resendCode: async (email: string) => {
    const { data } = await httpClient.post('/auth/resend-code', { email });
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await httpClient.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const { data } = await httpClient.post('/auth/reset-password', { email, code, newPassword });
    return data;
  },

  updateProfile: async (profileData: ProfileUpdateDTO) => {
    const { data } = await httpClient.patch('/users/profile', profileData);
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await httpClient.get('/users/me');
    return data;
  },
};
