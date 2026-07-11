import { useState } from 'react'
import { createNotice } from '../api/noticeApi'
import { isAdminUser } from '../auth/roles'

function extractNotice(response) {
  return response?.data?.data ?? null
}

function NoticeCreatePanel({
  currentUser,
  onNoticeCreated,
  onInfo,
  onSuccess,
  onError,
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isAdmin = isAdminUser(currentUser)
  const accessToken = currentUser?.accessToken ?? ''
  const canSubmit =
    isAdmin && Boolean(accessToken) && title.trim() && content.trim() && !isSubmitting

  if (!isAdmin) {
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!accessToken) {
      setErrorMessage('Access token is required to create a notice.')
      return
    }

    if (!title.trim() || !content.trim()) {
      setErrorMessage('Title and content are required.')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)
    onInfo('Notice create request started')

    try {
      const response = await createNotice({
        accessToken,
        title: title.trim(),
        content: content.trim(),
      })
      const createdNotice = extractNotice(response)

      setTitle('')
      setContent('')
      onSuccess(`Notice created: noticeId=${createdNotice?.id ?? '-'}`, {
        noticeId: createdNotice?.id,
      })
      onNoticeCreated(createdNotice)
    } catch (error) {
      const normalizedError = onError(error, 'Notice create request failed')
      setErrorMessage(
        normalizedError?.message ?? 'Failed to create the notice.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="notice-create-panel" aria-labelledby="notice-create-title">
      <div className="panel-header">
        <div>
          <h2 id="notice-create-title">Create Notice</h2>
          <p>ADMIN users can create a public notice.</p>
        </div>
        <span className="selected-category-badge">ADMIN</span>
      </div>

      <form className="post-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            disabled={isSubmitting}
            maxLength={100}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Notice title"
            type="text"
            value={title}
          />
        </label>

        <label>
          Content
          <textarea
            disabled={isSubmitting}
            maxLength={5000}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Notice content"
            rows={5}
            value={content}
          />
        </label>

        <div className="login-actions">
          <button disabled={!canSubmit} type="submit">
            {isSubmitting ? 'Creating...' : 'Create Notice'}
          </button>
        </div>
      </form>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </section>
  )
}

export default NoticeCreatePanel
