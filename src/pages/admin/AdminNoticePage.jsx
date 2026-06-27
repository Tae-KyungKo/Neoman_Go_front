import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import ActionLogPanel from '../../components/ActionLogPanel'
import NoticeCreatePanel from '../../components/NoticeCreatePanel'
import NoticeDetailPanel from '../../components/NoticeDetailPanel'
import NoticeListPanel from '../../components/NoticeListPanel'
import { useActionLog } from '../../hooks/useActionLog'

function AdminNoticePage() {
  const auth = useAuth()
  const { logs, addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const [selectedNoticeId, setSelectedNoticeId] = useState(null)
  const [noticeListRefreshKey, setNoticeListRefreshKey] = useState(0)
  const [noticeDetailRefreshKey, setNoticeDetailRefreshKey] = useState(0)
  const currentUser = auth.currentUser ?? {
    isLoggedIn: Boolean(auth.accessToken),
    accessToken: auth.accessToken,
    email: '',
  }

  function refreshNoticeList() {
    setNoticeListRefreshKey((currentKey) => currentKey + 1)
  }

  function refreshNoticeDetail() {
    setNoticeDetailRefreshKey((currentKey) => currentKey + 1)
  }

  function handleNoticeCreated(notice) {
    refreshNoticeList()

    if (notice?.id) {
      setSelectedNoticeId(notice.id)
      refreshNoticeDetail()
    }
  }

  function handleNoticeUpdated() {
    refreshNoticeList()
    refreshNoticeDetail()
  }

  function handleNoticeDeleted() {
    setSelectedNoticeId(null)
    refreshNoticeList()
  }

  return (
    <section className="notice-route-page">
      <NoticeCreatePanel
        currentUser={currentUser}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onNoticeCreated={handleNoticeCreated}
        onSuccess={addSuccessLog}
      />

      <div className="notice-grid">
        <NoticeListPanel
          onError={addErrorLog}
          onInfo={addInfoLog}
          onSelectNotice={setSelectedNoticeId}
          onSuccess={addSuccessLog}
          refreshKey={noticeListRefreshKey}
          selectedNoticeId={selectedNoticeId}
        />

        <NoticeDetailPanel
          currentUser={currentUser}
          mode="admin"
          noticeId={selectedNoticeId}
          onError={addErrorLog}
          onInfo={addInfoLog}
          onNoticeDeleted={handleNoticeDeleted}
          onNoticeUpdated={handleNoticeUpdated}
          onSuccess={addSuccessLog}
          refreshKey={noticeDetailRefreshKey}
        />
      </div>

      <ActionLogPanel logs={logs} />
    </section>
  )
}

export default AdminNoticePage
