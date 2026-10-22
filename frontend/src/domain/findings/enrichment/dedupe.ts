import type { Finding } from '../types';

const SIMILARITY_THRESHOLD = 0.55;

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^\w\sáéíóúñü]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3),
  );
}

export function textSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }
  return intersection / (tokensA.size + tokensB.size - intersection);
}

export function deduplicateFindings(findings: Finding[]): Finding[] {
  const result: Finding[] = [];

  for (const finding of findings) {
    const isDuplicate = result.some(existing =>
      textSimilarity(existing.meaning, finding.meaning) > SIMILARITY_THRESHOLD ||
      textSimilarity(existing.insight, finding.insight) > SIMILARITY_THRESHOLD,
    );

    if (!isDuplicate) {
      result.push(finding);
    }
  }

  return result;
}
