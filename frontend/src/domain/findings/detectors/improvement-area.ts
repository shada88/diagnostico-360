import type { Detector } from '../types';
import { T } from '../templates';
import { buildAlertSignal, getRelatedAreas } from '../utils';

const GAP_THRESHOLD = 2;

export const detectImprovementArea: Detector = ({ subs, data, answers, usedKeys }) => {
  const stable = subs.find(s => s.maturityLevel === 'ESTABLE' && !usedKeys.has(s.key));
  if (!stable) return null;

  usedKeys.add(stable.key);

  const topScore = subs[subs.length - 1].score;
  const gap = topScore - stable.score;

  return {
    id:           `improvement-${stable.key}`,
    category:     'improvement-area',
    title:        T.improvementTitle(stable.label),
    meaning:      gap > GAP_THRESHOLD
                    ? T.improvementMeaningWithGap(stable.label, gap.toFixed(1))
                    : T.improvementMeaningNoGap(stable.label),
    insight:      T.improvementInsight,
    impact:       T.improvementImpact,
    alertSignal:  buildAlertSignal(answers, stable.key),
    relatedAreas: [stable.dimLabel, ...getRelatedAreas(data, stable.key)],
  };
};
