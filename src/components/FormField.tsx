import type { InputHTMLAttributes } from 'react';
import './FormField.css';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  hintStatus?: 'default' | 'positive' | 'error';
}

export function FormField({ label, hint, hintStatus = 'default', id, ...rest }: FormFieldProps) {
  const fieldId = id ?? `field-${label}`;
  const isError = hintStatus === 'error';

  return (
    <div className={'nm-field' + (isError ? ' nm-field--error' : '')}>
      <label htmlFor={fieldId}>{label}</label>
      <input id={fieldId} {...rest} />
      {hint && <div className={`nm-field__hint nm-field__hint--${hintStatus}`}>{hint}</div>}
    </div>
  );
}

export default FormField;
