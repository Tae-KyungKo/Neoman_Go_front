import { useState } from 'react';
import TextareaField from './TextareaField';
import ConfirmModal from './ConfirmModal';
import { REPORT_REASONS } from '../data/posts';
import './ReportModal.css';

interface ReportModalProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export function ReportModal({ onCancel, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');

  return (
    <ConfirmModal title="게시글 신고하기" confirmLabel="신고하기" onCancel={onCancel} onConfirm={onSubmit} width={440}>
      <p style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)', margin: '0 0 16px' }}>신고 사유를 선택해주세요.</p>
      <div>
        {REPORT_REASONS.map((r) => (
          <div key={r} className="nm-radio-option" onClick={() => setReason(r)}>
            <div className={'nm-radio-dot' + (reason === r ? ' nm-radio-dot--checked' : '')} />
            <span style={{ font: 'var(--text-body-2-medium)', color: 'var(--label-normal)' }}>{r}</span>
          </div>
        ))}
      </div>
      <TextareaField
        label=""
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="구체적인 신고 내용을 입력해주세요 (선택)"
        style={{ minHeight: 80, marginTop: 12, marginBottom: 20 }}
      />
    </ConfirmModal>
  );
}

export default ReportModal;
