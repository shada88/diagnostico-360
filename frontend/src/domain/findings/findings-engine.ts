import type { DashboardDTO } from '@/types/dashboard';
import type { DimensionGroup } from '@/types/answers';
import type { DetectorContext, Finding } from './types';
import { flattenAndSortSubs } from './utils';
import { DETECTOR_PIPELINE } from './detectors';
import { deduplicateFindings, enrichFindingWithAI } from './enrichment';

export function generateFindings(
  data: DashboardDTO,
  answers: DimensionGroup[],
): Finding[] {
  const ctx: DetectorContext = {
    subs:        flattenAndSortSubs(data),
    data,
    answers,
    usedKeys:    new Set<string>(),
    usedDimKeys: new Set<string>(),
  };

  const rawFindings = DETECTOR_PIPELINE
    .map(detect => detect(ctx))
    .filter((f): f is Finding => f !== null);

  const dedupedFindings = deduplicateFindings(rawFindings);

  if (data.aiAnalysis) {
    return dedupedFindings.map(f => enrichFindingWithAI(f, data.aiAnalysis!));
  }

  return dedupedFindings;
}
