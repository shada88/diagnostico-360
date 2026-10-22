import type { DashboardDTO } from '@/types/dashboard';
import type { DimensionGroup } from '@/types/answers';
import type { ScoredSub } from './types';
import { T } from './templates';

export function flattenAndSortSubs(data: DashboardDTO): ScoredSub[] {
  return data.dimensions
    .flatMap(dim =>
      dim.subdimensions.map(sub => ({
        key:        sub.key,
        label:      sub.label,
        score:      sub.score,
        maturityLevel: sub.maturity.level,
        dimKey:     dim.key,
        dimLabel:   dim.label,
      })),
    )
    .sort((a, b) => a.score - b.score);
}

export function findLowestAffirmation(
  answers: DimensionGroup[],
  subKey: string,
): { text: string; value: number } | null {
  for (const dim of answers) {
    for (const sub of dim.subdimensions) {
      if (sub.key === subKey && sub.questions.length > 0) {
        return [...sub.questions].sort((a, b) => a.value - b.value)[0];
      }
    }
  }
  return null;
}

export function getRelatedAreas(data: DashboardDTO, subKey: string): string[] {
  for (const dim of data.dimensions) {
    if (dim.subdimensions.some(s => s.key === subKey)) {
      return dim.subdimensions
        .filter(s => s.key !== subKey)
        .map(s => s.label);
    }
  }
  return [];
}

export function buildAlertSignal(answers: DimensionGroup[], subKey: string): string {
  const affirmation = findLowestAffirmation(answers, subKey);
  return affirmation ? T.alertFromAffirmation(affirmation.text) : T.alertFallback;
}
