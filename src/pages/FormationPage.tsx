import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';

export function FormationPage() {
  const { teamId = '' } = useParams();
  const navigate = useNavigate();

  return (
    <MainLayout active="팀 찾기">
      <div className="nm-access-guard">
        <h1 style={{ font: 'var(--text-title-2)', color: 'var(--label-normal)', margin: 0 }}>포메이션 기능을 준비하고 있어요</h1>
        <p style={{ font: 'var(--text-body-1-regular)', color: 'var(--label-alternative-2)', marginTop: 10 }}>
          저장 API가 제공되기 전까지 임의의 선수 배치 데이터를 표시하지 않습니다.
        </p>
        <Button
          label="팀 상세로 돌아가기"
          variant="outlined"
          color="assistive"
          size="md"
          style={{ marginTop: 28 }}
          onClick={() => navigate(`/teams/${teamId}`)}
        />
      </div>
    </MainLayout>
  );
}

export default FormationPage;
