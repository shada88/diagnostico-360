import type { Detector } from '../types';
import { T } from '../templates';
import { buildAlertSignal, getRelatedAreas } from '../utils';

export const detectCriticalRisk: Detector = ({ subs, data, answers, usedKeys }) => {
  const highAlerts = data.alerts.filter(a => a.severity === 'HIGH');

  if (highAlerts.length > 0) {
    const alert = highAlerts[0];
    const affectedSub = subs.find(s => !usedKeys.has(s.key)) ?? subs[0];
    usedKeys.add(affectedSub.key);

    return {
      id:           `critical-${alert.key}`,
      category:     'critical-risk',
      title:        alert.title,
      meaning:      alert.message,
      insight:      T.criticalInsight(affectedSub.label),
      impact:       T.criticalImpact(affectedSub.dimLabel),
      alertSignal:  buildAlertSignal(answers, affectedSub.key),
      relatedAreas: [affectedSub.dimLabel, ...getRelatedAreas(data, affectedSub.key)],
    };
  }

  const critical = subs.find(s => s.maturityLevel === 'CRITICO' && !usedKeys.has(s.key));
  if (critical) {
    usedKeys.add(critical.key);
    return {
      id:           `critical-${critical.key}`,
      category:     'critical-risk',
      title:        T.criticalTitle(critical.label),
      meaning:      T.criticalMeaning(critical.label, critical.dimLabel),
      insight:      T.criticalInsight(critical.label),
      impact:       T.criticalImpact(critical.dimLabel),
      alertSignal:  buildAlertSignal(answers, critical.key),
      relatedAreas: [critical.dimLabel, ...getRelatedAreas(data, critical.key)],
    };
  }

  return null;
};
