import type { DashboardDTO } from '@/types/dashboard';
import type { DimensionGroup } from '@/types/answers';

export type FindingCategory =
  | 'critical-risk'
  | 'attention-point'
  | 'improvement-area'
  | 'strategic-strength';

export interface Finding {
  id:            string;
  category:      FindingCategory;
  title:         string;
  meaning:       string;
  insight:       string;
  impact:        string[];
  alertSignal:   string;
  relatedAreas:  string[];
}

export interface CategoryMeta {
  label:     string;
  emoji:     string;
  colorVar:  string;
  bgOpacity: string;
}

export interface ScoredSub {
  key:        string;
  label:      string;
  score:      number;
  maturityLevel: string;
  dimKey:     string;
  dimLabel:   string;
}

export interface DetectorContext {
  subs:        ScoredSub[];
  data:        DashboardDTO;
  answers:     DimensionGroup[];
  usedKeys:    Set<string>;
  usedDimKeys: Set<string>;
}

export type Detector = (ctx: DetectorContext) => Finding | null;
