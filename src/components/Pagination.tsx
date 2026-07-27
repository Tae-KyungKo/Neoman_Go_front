import Icon from './icons/Icon';
import './Pagination.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="nm-pagination">
      <button className="nm-page-btn" onClick={() => onChange(Math.max(1, page - 1))} aria-label="이전 페이지">
        <Icon name="ChevronLeft" size={14} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} className={'nm-page-btn' + (p === page ? ' nm-page-btn--active' : '')} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button className="nm-page-btn" onClick={() => onChange(Math.min(totalPages, page + 1))} aria-label="다음 페이지">
        <Icon name="ChevronRight" size={14} />
      </button>
    </div>
  );
}

export default Pagination;
