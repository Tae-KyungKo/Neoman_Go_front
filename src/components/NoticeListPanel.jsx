import { useEffect, useState } from 'react'
import { getNotices } from '../api/noticeApi'

function extractNoticePage(response) {
  return response?.data?.data ?? {}
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function NoticeListPanel({
  selectedNoticeId,
  refreshKey,
  onSelectNotice,
  onInfo,
  onSuccess,
  onError,
}) {
  const [notices, setNotices] = useState([])
  const [pageInfo, setPageInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadNotices() {
      setIsLoading(true)
      setErrorMessage('')
      onInfo('Notice list request started', { page: 0, size: 10 })

      try {
        const response = await getNotices({
          page: 0,
          size: 10,
        })
        const page = extractNoticePage(response)
        const content = Array.isArray(page.content) ? page.content : []

        if (ignore) {
          return
        }

        setNotices(content)
        setPageInfo({
          number: page.number,
          size: page.size,
          totalElements: page.totalElements,
          totalPages: page.totalPages,
        })
        onSuccess('Notice list loaded', {
          count: content.length,
          totalElements: page.totalElements,
        })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(error, 'Notice list request failed')
        setNotices([])
        setPageInfo(null)
        setErrorMessage(
          normalizedError?.message ?? 'Failed to load the notice list.',
        )
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadNotices()

    return () => {
      ignore = true
    }
  }, [refreshKey, onError, onInfo, onSuccess])

  return (
    <section className="notice-list-panel" aria-labelledby="notice-list-title">
      <div className="panel-header">
        <div>
          <h2 id="notice-list-title">Notice List</h2>
          <p>Public notices can be viewed by guests and signed-in users.</p>
        </div>
        <span className="selected-category-badge">GLOBAL</span>
      </div>

      {isLoading ? (
        <p className="empty-log">Loading notices...</p>
      ) : null}

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {!isLoading && !errorMessage && notices.length === 0 ? (
        <p className="empty-log">No notices have been registered.</p>
      ) : null}

      {notices.length > 0 ? (
        <>
          <div className="team-list-meta">
            <span>loaded {notices.length}</span>
            {typeof pageInfo?.totalElements === 'number' ? (
              <span>total {pageInfo.totalElements}</span>
            ) : null}
          </div>

          <ul className="post-list">
            {notices.map((notice) => {
              const noticeId = notice.id
              const isSelected = selectedNoticeId === noticeId

              return (
                <li key={noticeId}>
                  <button
                    aria-pressed={isSelected}
                    className={isSelected ? 'post-card selected' : 'post-card'}
                    onClick={() => onSelectNotice(noticeId)}
                    type="button"
                  >
                    <span className="team-card-title">
                      {notice.title ?? '(No title)'}
                    </span>
                    <span className="team-card-meta">ID {noticeId}</span>
                    <span className="team-card-meta">
                      Author {notice.authorName ?? '-'}
                    </span>
                    <span className="team-card-meta">
                      Created {formatDate(notice.createdAt)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </section>
  )
}

export default NoticeListPanel
