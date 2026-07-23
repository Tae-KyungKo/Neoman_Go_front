import type { InputHTMLAttributes, ReactNode } from 'react';
import './FormField.css';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  hintStatus?: 'default' | 'positive' | 'error';
  action?: ReactNode;
}

export function FormField({
  label,
  hint,
  hintStatus = 'default',
  action,
  id,
  ...rest
}: FormFieldProps) {
  const fieldId = id ?? `field-${label}`;
  const isError = hintStatus === 'error';

  return (
    <div className={'nm-field' + (isError ? ' nm-field--error' : '')}>
      <label htmlFor={fieldId}>{label}</label>
      {action ? (
        <div className="nm-field__control">
          <input id={fieldId} {...rest} />
          {action}
        </div>
      ) : (
        <input id={fieldId} {...rest} />
      )}
      {hint && <div className={`nm-field__hint nm-field__hint--${hintStatus}`}>{hint}</div>}
    </div>
  );
}

export default FormField;
