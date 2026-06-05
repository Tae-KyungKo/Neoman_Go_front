import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import ActionLogPanel from '../../components/ActionLogPanel'
import NoticeListPanel from '../../components/NoticeListPanel'
import { useActionLog } from '../../hooks/useActionLog'

function NoticeListPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { logs, addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const isAdmin = currentUser?.role === 'ADMIN'

  function handleSelectNotice(noticeId) {
    navigate(`/notices/${noticeId}`)
  }

  return (
    <section className="notice-route-page">
      <div className="route-panel">
        <div className="route-panel-header">
          <div>
            <h1>공지사항</h1>
            <p>공지사항은 카테고리와 무관한 전역 기능이다.</p>
          </div>
          {isAdmin ? (
            <Link className="button-link" to="/admin/notices">
              관리자 공지 관리
            </Link>
          ) : null}
        </div>
      </div>

      <NoticeListPanel
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSelectNotice={handleSelectNotice}
        onSuccess={addSuccessLog}
        refreshKey="public-notices"
        selectedNoticeId={null}
      />

      <ActionLogPanel logs={logs} />
    </section>
  )
}

export default NoticeListPage
