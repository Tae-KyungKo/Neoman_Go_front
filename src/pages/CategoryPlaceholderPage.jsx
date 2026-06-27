import { useOutletContext, useParams } from 'react-router-dom'

const PLACEHOLDER_COPY = {
  teams: {
    title: '팀 목록',
    description: '팀 목록은 Phase 7.5-4에서 연결됩니다.',
  },
  teamNew: {
    title: '팀 생성',
    description: '팀 생성 UI는 Phase 7.5-4에서 이관됩니다.',
  },
  teamDetail: {
    title: '팀 상세',
    description: '팀 상세/신청/승인/팀원 관리는 Phase 7.5-4에서 이관됩니다.',
  },
  board: {
    title: '게시판',
    description: '게시판은 Phase 7.5-5에서 연결됩니다.',
  },
  postDetail: {
    title: '게시글 상세',
    description: '게시글 상세와 댓글 UI는 Phase 7.5-5에서 이관됩니다.',
  },
  matches: {
    title: '매치',
    description: '매치 기능은 추후 Phase에서 구현 예정입니다.',
  },
}

function CategoryPlaceholderPage({ type }) {
  const { categoryCode, categoryLabel } = useOutletContext()
  const { teamId, postId } = useParams()
  const copy = PLACEHOLDER_COPY[type]

  return (
    <div className="placeholder-panel">
      <h2>
        {categoryLabel} {copy.title}
      </h2>
      <p>{categoryLabel} {copy.description}</p>
      <div className="auth-state">
        <span>categoryCode: {categoryCode}</span>
        {teamId ? <span>teamId: {teamId}</span> : null}
        {postId ? <span>postId: {postId}</span> : null}
      </div>
    </div>
  )
}

export default CategoryPlaceholderPage
