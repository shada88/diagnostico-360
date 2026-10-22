import type { Detector } from '../types';
import { detectCriticalRisk } from './critical-risk';
import { detectAttentionPoint } from './attention-point';
import { detectImprovementArea } from './improvement-area';
import { detectStrategicStrength } from './strategic-strength';

export { detectCriticalRisk, detectAttentionPoint, detectImprovementArea, detectStrategicStrength };

export const DETECTOR_PIPELINE: Detector[] = [
  detectCriticalRisk,
  detectAttentionPoint,
  detectImprovementArea,
  detectStrategicStrength,
];
