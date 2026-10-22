export interface AnswerQuestion {
  index: number;
  text:  string;
  value: number;
}

export interface SubdimensionGroup {
  key:       string;
  label:     string;
  score:     number;
  questions: AnswerQuestion[];
}

export interface DimensionGroup {
  key:           string;
  label:         string;
  subdimensions: SubdimensionGroup[];
}

export interface AttemptSummary {
  id:           string;
  createdAt:    string;
  status:       'IN_PROGRESS' | 'COMPLETED';
  globalScore?: number;
}
