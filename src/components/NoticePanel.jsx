import { useState } from 'react'
import NoticeCreatePanel from './NoticeCreatePanel'
import NoticeDetailPanel from './NoticeDetailPanel'
import NoticeListPanel from './NoticeListPanel'

function NoticePanel({ currentUser, onInfo, onSuccess, onError }) {
  const [selectedNoticeId, setSelectedNoticeId] = useState(null)
  const [noticeListRefreshKey, setNoticeListRefreshKey] = useState(0)
  const [noticeDetailRefreshKey, setNoticeDetailRefreshKey] = useState(0)

  function handleSelectNotice(noticeId) {
    setSelectedNoticeId((currentNoticeId) => {
      if (currentNoticeId === noticeId) {
        return currentNoticeId
      }

      return noticeId
    })
  }

  function handleNoticeCreated(notice) {
    setNoticeListRefreshKey((currentKey) => currentKey + 1)

    if (notice?.id) {
      setSelectedNoticeId(notice.id)
      setNoticeDetailRefreshKey((currentKey) => currentKey + 1)
    }
  }

  function handleNoticeUpdated() {
    setNoticeListRefreshKey((currentKey) => currentKey + 1)
    setNoticeDetailRefreshKey((currentKey) => currentKey + 1)
  }

  function handleNoticeDeleted() {
    setSelectedNoticeId(null)
    setNoticeListRefreshKey((currentKey) => currentKey + 1)
  }

  return (
    <section className="notice-panel" aria-labelledby="notice-panel-title">
      <div className="panel-header">
        <div>
          <h2 id="notice-panel-title">Notices</h2>
          <p>Global public notices are available without selecting a category.</p>
        </div>
        <span className="selected-category-badge">PUBLIC</span>
      </div>

      <NoticeCreatePanel
        currentUser={currentUser}
        onError={onError}
        onInfo={onInfo}
        onNoticeCreated={handleNoticeCreated}
        onSuccess={onSuccess}
      />

      <div className="notice-grid">
        <NoticeListPanel
          onError={onError}
          onInfo={onInfo}
          onSelectNotice={handleSelectNotice}
          onSuccess={onSuccess}
          refreshKey={noticeListRefreshKey}
          selectedNoticeId={selectedNoticeId}
        />

        <NoticeDetailPanel
          currentUser={currentUser}
          noticeId={selectedNoticeId}
          onError={onError}
          onInfo={onInfo}
          onNoticeDeleted={handleNoticeDeleted}
          onNoticeUpdated={handleNoticeUpdated}
          onSuccess={onSuccess}
          refreshKey={noticeDetailRefreshKey}
        />
      </div>
    </section>
  )
}

export default NoticePanel
