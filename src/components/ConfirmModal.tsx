import { useEffect, useId, useRef, type ReactNode } from 'react';
import Button from './Button';
import './ConfirmModal.css';

interface ConfirmModalProps {
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  titleColor?: string;
  children?: ReactNode;
  width?: number;
  closeDisabled?: boolean;
  confirmOnEnter?: boolean;
}

export function ConfirmModal({
  title,
  description,
  cancelLabel = '취소',
  confirmLabel,
  onCancel,
  onConfirm,
  confirmDisabled,
  titleColor,
  children,
  width = 400,
  closeDisabled = false,
  confirmOnEnter = false,
}: ConfirmModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  const onConfirmRef = useRef(onConfirm);
  const closeDisabledRef = useRef(closeDisabled);
  const confirmDisabledRef = useRef(confirmDisabled);
  const titleId = useId();
  const descriptionId = useId();

  onCancelRef.current = onCancel;
  onConfirmRef.current = onConfirm;
  closeDisabledRef.current = closeDisabled;
  confirmDisabledRef.current = confirmDisabled;

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const card = cardRef.current;
    const firstInteractive = card?.querySelector<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    firstInteractive?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabledRef.current) {
        onCancelRef.current();
      }
      if (
        event.key === 'Enter'
        && confirmOnEnter
        && !confirmDisabledRef.current
        && !(event.target instanceof HTMLButtonElement)
      ) {
        event.preventDefault();
        onConfirmRef.current();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [confirmOnEnter]);

  return (
    <div className="nm-modal-backdrop" onClick={() => !closeDisabled && onCancel()}>
      <div
        ref={cardRef}
        className="nm-modal-card"
        style={{ width, maxWidth: 'calc(100vw - 32px)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="nm-modal-card__title" style={titleColor ? { color: titleColor } : undefined}>
          {title}
        </h3>
        {description && <p id={descriptionId} className="nm-modal-card__desc">{description}</p>}
        {children}
        <div className="nm-modal-card__actions">
          <Button label={cancelLabel} variant="outlined" color="assistive" size="md" onClick={onCancel} disabled={closeDisabled} />
          <Button label={confirmLabel} variant="solid" color="primary" size="md" onClick={onConfirm} disabled={confirmDisabled} />
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
