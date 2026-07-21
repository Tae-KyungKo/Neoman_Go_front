import type { ReactNode } from 'react';
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
}: ConfirmModalProps) {
  return (
    <div className="nm-modal-backdrop" onClick={onCancel}>
      <div className="nm-modal-card" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <h3 className="nm-modal-card__title" style={titleColor ? { color: titleColor } : undefined}>
          {title}
        </h3>
        {description && <p className="nm-modal-card__desc">{description}</p>}
        {children}
        <div className="nm-modal-card__actions">
          <Button label={cancelLabel} variant="outlined" color="assistive" size="md" onClick={onCancel} />
          <Button label={confirmLabel} variant="solid" color="primary" size="md" onClick={onConfirm} disabled={confirmDisabled} />
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
