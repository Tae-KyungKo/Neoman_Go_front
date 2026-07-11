import { Link, useNavigate } from 'react-router-dom'
import { isAdminUser } from '../../auth/roles'
import { useAuth } from '../../auth/useAuth'
import NoticeListPanel from '../../components/NoticeListPanel'
import { useActionLog } from '../../hooks/useActionLog'

function NoticeListPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const isAdmin = isAdminUser(currentUser)

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

    </section>
  )
}

export default NoticeListPage
