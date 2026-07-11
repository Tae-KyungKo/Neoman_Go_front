import { useEffect, useState } from 'react'
import { deleteNotice, getNotice, updateNotice } from '../api/noticeApi'
import { isAdminUser } from '../auth/roles'

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

function NoticeDetailPanel({
  noticeId,
  currentUser,
  refreshKey,
  mode = 'admin',
  onNoticeUpdated,
  onNoticeDeleted,
  onInfo,
  onSuccess,
  onError,
}) {
  const [notice, setNotice] = useState(null)
  const [loadedNoticeId, setLoadedNoticeId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorNoticeId, setErrorNoticeId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [processingKey, setProcessingKey] = useState('')

  const isAdmin = mode === 'admin' && isAdminUser(currentUser)
  const accessToken = currentUser?.accessToken ?? ''
  const isNoticeReady = Boolean(noticeId) && loadedNoticeId === noticeId
  const isCurrentError = Boolean(noticeId) && errorNoticeId === noticeId
  const canEdit = isAdmin && Boolean(accessToken) && isNoticeReady && !processingKey

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
        setEditTitle(detail?.title ?? '')
        setEditContent(detail?.content ?? '')
        setIsEditing(false)
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
  }, [noticeId, refreshKey, onError, onInfo, onSuccess])

  async function handleUpdateNotice(event) {
    event.preventDefault()

    if (!noticeId || !isAdmin || !accessToken) {
      setErrorMessage('Admin access token is required to update a notice.')
      return
    }

    if (!editTitle.trim() || !editContent.trim()) {
      setErrorMessage('Title and content are required.')
      return
    }

    setProcessingKey('notice-update')
    setErrorMessage('')
    setErrorNoticeId(null)
    onInfo(`Notice update request started: noticeId=${noticeId}`, { noticeId })

    try {
      await updateNotice({
        accessToken,
        noticeId,
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      setIsEditing(false)
      onSuccess(`Notice updated: noticeId=${noticeId}`, { noticeId })
      onNoticeUpdated()
    } catch (error) {
      const normalizedError = onError(
        error,
        `Notice update request failed: noticeId=${noticeId}`,
      )
      setErrorNoticeId(noticeId)
      setErrorMessage(
        normalizedError?.message ?? 'Failed to update the notice.',
      )
    } finally {
      setProcessingKey('')
    }
  }

  async function handleDeleteNotice() {
    if (!noticeId || !isAdmin || !accessToken) {
      setErrorMessage('Admin access token is required to delete a notice.')
      return
    }

    const confirmed = window.confirm('Delete this notice?')
    if (!confirmed) {
      return
    }

    setProcessingKey('notice-delete')
    setErrorMessage('')
    setErrorNoticeId(null)
    onInfo(`Notice delete request started: noticeId=${noticeId}`, { noticeId })

    try {
      await deleteNotice({
        accessToken,
        noticeId,
      })
      setNotice(null)
      setLoadedNoticeId(null)
      setIsEditing(false)
      onSuccess(`Notice deleted: noticeId=${noticeId}`, { noticeId })
      onNoticeDeleted()
    } catch (error) {
      const normalizedError = onError(
        error,
        `Notice delete request failed: noticeId=${noticeId}`,
      )
      setErrorNoticeId(noticeId)
      setErrorMessage(
        normalizedError?.message ?? 'Failed to delete the notice.',
      )
    } finally {
      setProcessingKey('')
    }
  }

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
          {!isEditing ? (
            <>
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

              {isAdmin ? (
                <div className="login-actions">
                  <button
                    disabled={!canEdit}
                    onClick={() => {
                      setEditTitle(notice.title ?? '')
                      setEditContent(notice.content ?? '')
                      setIsEditing(true)
                    }}
                    type="button"
                  >
                    Edit Notice
                  </button>
                  <button
                    disabled={!canEdit}
                    onClick={handleDeleteNotice}
                    type="button"
                  >
                    {processingKey === 'notice-delete'
                      ? 'Deleting...'
                      : 'Delete Notice'}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <form className="post-form" onSubmit={handleUpdateNotice}>
              <label>
                Title
                <input
                  disabled={processingKey === 'notice-update'}
                  maxLength={100}
                  onChange={(event) => setEditTitle(event.target.value)}
                  type="text"
                  value={editTitle}
                />
              </label>

              <label>
                Content
                <textarea
                  disabled={processingKey === 'notice-update'}
                  maxLength={5000}
                  onChange={(event) => setEditContent(event.target.value)}
                  rows={6}
                  value={editContent}
                />
              </label>

              <div className="login-actions">
                <button
                  disabled={
                    processingKey === 'notice-update' ||
                    !editTitle.trim() ||
                    !editContent.trim()
                  }
                  type="submit"
                >
                  {processingKey === 'notice-update'
                    ? 'Saving...'
                    : 'Save Notice'}
                </button>
                <button
                  disabled={processingKey === 'notice-update'}
                  onClick={() => {
                    setIsEditing(false)
                    setEditTitle(notice.title ?? '')
                    setEditContent(notice.content ?? '')
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </section>
  )
}

export default NoticeDetailPanel
