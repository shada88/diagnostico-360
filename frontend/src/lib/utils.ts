import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
    return Math.round(score).toString();
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return 'Saludable';
    if (score >= 60) return 'En atención';
    if (score >= 40) return 'En riesgo';
    return 'Crítico';
}
