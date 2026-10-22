export type {
  MaturityLevel,
  MaturityMeta,
  SubdimensionResult,
  DimensionResult,
  RadarPoint,
} from '@/types/dashboard';

export type DimensionKey = 'INTERNAL' | 'BUSINESS' | 'GROWTH';
export type Score = number;

export interface Area {
  key: string;
  label: string;
  score: Score;
}

export interface Dimension {
  key: DimensionKey;
  label: string;
  score: Score;
  areas: Area[];
}
