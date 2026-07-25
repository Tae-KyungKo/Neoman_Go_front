import type { TextareaHTMLAttributes } from 'react';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  hintStatus?: 'default' | 'positive' | 'error';
}

export function TextareaField({
  label,
  hint,
  hintStatus = 'default',
  id,
  ...rest
}: TextareaFieldProps) {
  const fieldId = id ?? `field-${label}`;
  const hintId = `${fieldId}-hint`;
  const isError = hintStatus === 'error';

  return (
    <div className={'nm-field' + (isError ? ' nm-field--error' : '')}>
      <label htmlFor={fieldId}>{label}</label>
      <textarea
        id={fieldId}
        aria-invalid={isError || undefined}
        aria-describedby={hint ? hintId : undefined}
        {...rest}
      />
      {hint && <div id={hintId} className={`nm-field__hint nm-field__hint--${hintStatus}`}>{hint}</div>}
    </div>
  );
}

export default TextareaField;
