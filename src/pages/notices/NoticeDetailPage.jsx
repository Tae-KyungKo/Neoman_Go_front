import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import NoticeDetailPanel from '../../components/NoticeDetailPanel'
import { useActionLog } from '../../hooks/useActionLog'

function NoticeDetailPage() {
  const { noticeId } = useParams()
  const auth = useAuth()
  const { addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const currentUser = auth.currentUser ?? {
    isLoggedIn: Boolean(auth.accessToken),
    accessToken: auth.accessToken,
    email: '',
  }

  return (
    <section className="notice-route-page">
      <div className="route-panel">
        <div className="route-panel-header">
          <div>
            <h1>공지 상세</h1>
            <p>
              URL noticeId <code>{noticeId}</code>를 기준으로 공지 상세를 조회한다.
            </p>
          </div>
          <Link className="button-link" to="/notices">
            목록으로
          </Link>
        </div>
      </div>

      <NoticeDetailPanel
        currentUser={currentUser}
        mode="public"
        noticeId={noticeId}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onNoticeDeleted={() => {}}
        onNoticeUpdated={() => {}}
        onSuccess={addSuccessLog}
        refreshKey={noticeId}
      />

    </section>
  )
}

export default NoticeDetailPage
