import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

type Variant = 'solid' | 'outlined';
type Color = 'primary' | 'assistive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: Variant;
  color?: Color;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...rest
}: ButtonProps) {
  const classes = ['nm-button', `nm-button--${variant}`, `nm-button--${color}`, `nm-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} style={fullWidth ? { width: '100%', justifyContent: 'center' } : undefined} {...rest}>
      {label}
    </button>
  );
}

export default Button;
