'use client';

/**
 * Recharts custom tooltip for the interactive radar.
 *
 * Note: this tooltip intentionally does NOT surface dimension grouping
 * (INTERNAL / BUSINESS / GROWTH) — that grouping is reserved for the
 * vendor view. For the client, only the 10 strategic areas exist.
 */

interface RadarTooltipPayload {
  score?:      number;
  maturityLabel?: string;
  maturityColor?: string;
}

interface RadarTooltipProps {
  active?:  boolean;
  payload?: Array<{ payload?: RadarTooltipPayload }>;
  label?:   string;
}

export default function RadarTooltip({ active, payload, label }: RadarTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div
      style={{
        background:   'var(--tooltip-bg)',
        border:       '1px solid var(--gold-30)',
        borderRadius: '12px',
        padding:      '10px 14px',
        boxShadow:    'var(--shadow-tooltip)',
      }}
    >
      <p style={{ color: 'var(--tooltip-text)', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ color: 'var(--gold-bright)', fontSize: 15, fontWeight: 900 }}>
        {d.score?.toFixed(1)}{' '}
        <span style={{ fontSize: 11, color: 'var(--tooltip-text)', opacity: 0.5, fontWeight: 400 }}>
          / 10
        </span>
      </p>
      {d.maturityLabel && (
        <p
          style={{
            color: d.maturityColor,
            fontSize: 10,
            marginTop: 3,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {d.maturityLabel}
        </p>
      )}
      <p style={{ fontSize: 10, color: 'var(--tooltip-text)', opacity: 0.55, marginTop: 6 }}>
        Toca para ver detalle
      </p>
    </div>
  );
}
