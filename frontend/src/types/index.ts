export interface User {
    id: string;
    email: string;
    name: string;
    country?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    businessName?: string;
    countryCode?:  string;
    city?:         string;
    timezone?:     string;
    isProfileComplete?: boolean;
    latestAttemptStatus?: 'IN_PROGRESS' | 'COMPLETED';
    latestAttemptId?: string;
}

export interface Question {
    id: string;
    text: string;
    sectionId: string;
    isCritical?: boolean;
}

export interface Section {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
}

export interface Survey {
    id: string;
    title: string;
    description: string;
    sections: Section[];
}

export interface Attempt {
    id: string;
    userId: string;
    surveyId: string;
    status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface Answer {
    questionId: string;
    value: number; // 1-10
}

export interface EvaluationResult {
    sectionResults: Array<{
        section: string;
        score: number;
        status: 'SALUDABLE' | 'EN RIESGO' | 'DEBILITADA' | 'CRÍTICA';
    }>;
    globalStatus: 'VERDE' | 'AMARILLO' | 'ROJO';
    globalColor: 'GREEN' | 'YELLOW' | 'RED';
    dofa: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
    };
}
