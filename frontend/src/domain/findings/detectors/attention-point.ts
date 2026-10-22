import type { Detector } from '../types';
import { T } from '../templates';
import { buildAlertSignal, getRelatedAreas } from '../utils';

export const detectAttentionPoint: Detector = ({ subs, data, answers, usedKeys }) => {
  const mediumAlerts = data.alerts.filter(a => a.severity === 'MEDIUM');
  if (mediumAlerts.length > 0) {
    const alert = mediumAlerts[0];
    const riskSub = subs.find(s => s.maturityLevel === 'RIESGO' && !usedKeys.has(s.key))
                 ?? subs.find(s => !usedKeys.has(s.key));

    if (riskSub) {
      usedKeys.add(riskSub.key);
      return {
        id:           `attention-${alert.key}`,
        category:     'attention-point',
        title:        alert.title,
        meaning:      alert.message,
        insight:      T.attentionInsight(riskSub.label),
        impact:       T.attentionImpact(riskSub.dimLabel, riskSub.label),
        alertSignal:  buildAlertSignal(answers, riskSub.key),
        relatedAreas: [riskSub.dimLabel, ...getRelatedAreas(data, riskSub.key)],
      };
    }
  }

  const risk = subs.find(s => s.maturityLevel === 'RIESGO' && !usedKeys.has(s.key));
  if (risk) {
    usedKeys.add(risk.key);
    return {
      id:           `attention-${risk.key}`,
      category:     'attention-point',
      title:        T.attentionTitle(risk.label),
      meaning:      T.attentionMeaning(risk.label),
      insight:      T.attentionInsight(risk.label),
      impact:       T.attentionImpact(risk.dimLabel, risk.label),
      alertSignal:  buildAlertSignal(answers, risk.key),
      relatedAreas: [risk.dimLabel, ...getRelatedAreas(data, risk.key)],
    };
  }

  return null;
};
