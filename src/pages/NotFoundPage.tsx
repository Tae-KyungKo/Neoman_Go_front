import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import './NotFoundPage.css';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="nm-notfound">
        <span className="nm-notfound__code">404</span>
        <h1 className="nm-notfound__title">페이지를 찾을 수 없어요</h1>
        <p className="nm-notfound__desc">주소가 잘못되었거나 삭제된 페이지예요.</p>
        <div className="nm-notfound__actions">
          <Button label="이전 페이지" variant="outlined" color="assistive" size="md" onClick={() => navigate(-1)} />
          <Button label="홈으로" variant="solid" color="primary" size="md" onClick={() => navigate('/')} />
        </div>
      </div>
    </MainLayout>
  );
}

export default NotFoundPage;
