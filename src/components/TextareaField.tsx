import type { TextareaHTMLAttributes } from 'react';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextareaField({ label, id, ...rest }: TextareaFieldProps) {
  const fieldId = id ?? `field-${label}`;
  return (
    <div className="nm-field">
      <label htmlFor={fieldId}>{label}</label>
      <textarea id={fieldId} {...rest} />
    </div>
  );
}

export default TextareaField;
