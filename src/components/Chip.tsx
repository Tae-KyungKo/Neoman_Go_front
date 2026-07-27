import type { ButtonHTMLAttributes } from 'react';
import './Chip.css';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active = false, className = '', ...rest }: ChipProps) {
  return <button type="button" className={'nm-chip' + (active ? ' nm-chip--active' : '') + (className ? ' ' + className : '')} {...rest} />;
}

export default Chip;
