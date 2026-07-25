import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import './PostDetailPage.css';

export function PostDetailPage() {
  const { postId = '' } = useParams();
  const navigate = useNavigate();
  const validPostId = Number.isInteger(Number(postId)) && Number(postId) > 0;

  return (
    <MainLayout active="게시판">
      <div className="nm-post-detail">
        <div className="nm-empty-state">
          {validPostId
            ? '통합 게시판 상세 API 연결 작업 전까지 게시글을 표시하지 않습니다.'
            : '올바르지 않은 게시글 번호입니다.'}
          <Button
            label="목록으로"
            variant="outlined"
            color="assistive"
            size="md"
            onClick={() => navigate('/board')}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default PostDetailPage;
