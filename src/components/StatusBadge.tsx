import './StatusBadge.css';

export type StatusTone = 'positive' | 'negative' | 'caution' | 'neutral';

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`nm-status-badge nm-status-badge--${tone}`}>{label}</span>;
}

export default StatusBadge;
