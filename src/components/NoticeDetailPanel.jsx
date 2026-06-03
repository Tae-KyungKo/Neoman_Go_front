import { useEffect, useState } from 'react'
import { getNotice } from '../api/noticeApi'

function extractNotice(response) {
  return response?.data?.data ?? null
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

function NoticeDetailPanel({ noticeId, onInfo, onSuccess, onError }) {
  const [notice, setNotice] = useState(null)
  const [loadedNoticeId, setLoadedNoticeId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorNoticeId, setErrorNoticeId] = useState(null)

  const isNoticeReady = Boolean(noticeId) && loadedNoticeId === noticeId
  const isCurrentError = Boolean(noticeId) && errorNoticeId === noticeId

  useEffect(() => {
    if (!noticeId) {
      return
    }

    let ignore = false

    async function loadNotice() {
      setIsLoading(true)
      setNotice(null)
      setLoadedNoticeId(null)
      setErrorMessage('')
      setErrorNoticeId(null)
      onInfo(`Notice detail request started: noticeId=${noticeId}`, { noticeId })

      try {
        const response = await getNotice(noticeId)
        const detail = extractNotice(response)

        if (ignore) {
          return
        }

        setNotice(detail)
        setLoadedNoticeId(noticeId)
        onSuccess(`Notice detail loaded: noticeId=${noticeId}`, { noticeId })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(
          error,
          `Notice detail request failed: noticeId=${noticeId}`,
        )
        setNotice(null)
        setLoadedNoticeId(null)
        setErrorNoticeId(noticeId)
        setErrorMessage(
          normalizedError?.message ?? 'Failed to load the notice detail.',
        )
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadNotice()

    return () => {
      ignore = true
    }
  }, [noticeId, onError, onInfo, onSuccess])

  return (
    <section className="notice-detail-panel" aria-labelledby="notice-detail-title">
      <div className="panel-header">
        <div>
          <h2 id="notice-detail-title">Notice Detail</h2>
          <p>Select a notice to load its latest server state.</p>
        </div>
        <span className="selected-category-badge">
          {noticeId ? `noticeId=${noticeId}` : 'NO_NOTICE'}
        </span>
      </div>

      {!noticeId ? (
        <p className="empty-log">Select a notice.</p>
      ) : null}

      {noticeId && isLoading ? (
        <p className="empty-log">Loading notice detail...</p>
      ) : null}

      {noticeId && isCurrentError && errorMessage ? (
        <p className="form-error">{errorMessage}</p>
      ) : null}

      {noticeId && notice && isNoticeReady && !isLoading ? (
        <div className="post-detail">
          <div className="team-detail-header">
            <div>
              <h3>{notice.title ?? '(No title)'}</h3>
              <p className="post-content">{notice.content ?? ''}</p>
            </div>
            <span className="status-badge">ID {notice.id}</span>
          </div>

          <dl className="team-detail-grid">
            <div>
              <dt>Author</dt>
              <dd>{notice.authorName ?? '-'}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(notice.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(notice.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  )
}

export default NoticeDetailPanel
