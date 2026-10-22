import type { Detector } from '../types';
import { T } from '../templates';
import { getRelatedAreas } from '../utils';

const BALANCE_IG_MIN = 7;
const BALANCE_SPREAD_MAX = 2;
const BALANCE_STRONG_MIN = 5;

export const detectStrategicStrength: Detector = ({ subs, data, usedKeys }) => {
  const strong = subs.filter(
    s => (s.maturityLevel === 'COMPETENTE' || s.maturityLevel === 'EXCELENTE') && !usedKeys.has(s.key),
  );

  const scores = subs.map(s => s.score);
  const spread = Math.max(...scores) - Math.min(...scores);

  if (
    data.global.score >= BALANCE_IG_MIN &&
    spread < BALANCE_SPREAD_MAX &&
    strong.length >= BALANCE_STRONG_MIN
  ) {
    return {
      id:           'balanced-diagnostic',
      category:     'strategic-strength',
      title:        T.balancedTitle,
      meaning:      T.balancedMeaning,
      insight:      T.balancedInsight,
      impact:       T.balancedImpact,
      alertSignal:  T.balancedAlertSignal,
      relatedAreas: strong.slice(0, 3).map(s => s.label),
    };
  }

  if (strong.length > 0) {
    const best = strong[strong.length - 1];
    return {
      id:           `strength-${best.key}`,
      category:     'strategic-strength',
      title:        T.strengthTitle(best.label),
      meaning:      T.strengthMeaning(best.label),
      insight:      T.strengthInsight,
      impact:       T.strengthImpact,
      alertSignal:  T.strengthAlertSignal(best.label),
      relatedAreas: [best.dimLabel, ...getRelatedAreas(data, best.key)],
    };
  }

  return null;
};
