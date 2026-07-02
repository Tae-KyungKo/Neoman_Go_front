import { useState } from 'react'
import { createPost } from '../api/postApi'
import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
} from '../constants/inputLimits'

function extractPost(response) {
  return response?.data?.data ?? null
}

function PostCreatePanel({
  selectedCategory,
  currentUser,
  onPostCreated,
  onInfo,
  onSuccess,
  onError,
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isLoggedIn = currentUser.isLoggedIn && Boolean(currentUser.accessToken)
  const canSubmit =
    selectedCategory &&
    isLoggedIn &&
    !isSubmitting

  function validatePostInput() {
    if (!title.trim()) {
      return '게시글 제목을 입력하세요.'
    }

    if (title.length > POST_TITLE_MAX_LENGTH) {
      return `게시글 제목은 ${POST_TITLE_MAX_LENGTH}자 이하여야 합니다.`
    }

    if (!content.trim()) {
      return '게시글 본문을 입력하세요.'
    }

    if (content.length > POST_CONTENT_MAX_LENGTH) {
      return `게시글 본문은 ${POST_CONTENT_MAX_LENGTH}자 이하여야 합니다.`
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedCategory) {
      setErrorMessage('카테고리를 먼저 선택해야 게시글을 작성할 수 있습니다.')
      return
    }

    if (!isLoggedIn) {
      setErrorMessage('로그인해야 게시글을 작성할 수 있습니다.')
      return
    }

    const validationMessage = validatePostInput()
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)
    onInfo(`게시글 작성 요청: category=${selectedCategory.code}`, {
      category: selectedCategory.code,
    })

    try {
      const response = await createPost(selectedCategory.code, {
        title: title.trim(),
        content: content.trim(),
      })
      const createdPost = extractPost(response)

      setTitle('')
      setContent('')
      onSuccess(
        `게시글 작성 완료: postId=${createdPost?.id ?? '-'}`,
        {
          postId: createdPost?.id,
          category: selectedCategory.code,
        },
      )
      onPostCreated(createdPost)
    } catch (error) {
      const normalizedError = onError(
        error,
        `게시글 작성 실패: category=${selectedCategory.code}`,
      )
      setErrorMessage(
        normalizedError?.message ?? '게시글 작성 중 오류가 발생했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="post-create-panel" aria-labelledby="post-create-title">
      <div className="panel-header">
        <div>
          <h2 id="post-create-title">Create Post</h2>
          <p>선택한 카테고리에 자유게시판 게시글을 작성합니다.</p>
        </div>
        <span className="selected-category-badge">
          {selectedCategory ? selectedCategory.code : 'NO_CATEGORY'}
        </span>
      </div>

      {!selectedCategory ? (
        <p className="empty-log">카테고리를 선택하면 게시글 작성 폼을 사용할 수 있습니다.</p>
      ) : null}

      {selectedCategory && !isLoggedIn ? (
        <p className="empty-log">게시글 작성은 로그인 후 사용할 수 있습니다.</p>
      ) : null}

      <form className="post-form" onSubmit={handleSubmit}>
        <label>
          제목
          <input
            disabled={!selectedCategory || !isLoggedIn || isSubmitting}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="게시글 제목"
            type="text"
            value={title}
          />
          <span className="form-help">
            {title.length}/{POST_TITLE_MAX_LENGTH}
          </span>
        </label>

        <label>
          내용
          <textarea
            disabled={!selectedCategory || !isLoggedIn || isSubmitting}
            onChange={(event) => setContent(event.target.value)}
            placeholder="게시글 내용"
            rows={5}
            value={content}
          />
          <span className="form-help">
            {content.length}/{POST_CONTENT_MAX_LENGTH}
          </span>
        </label>

        <div className="login-actions">
          <button disabled={!canSubmit} type="submit">
            {isSubmitting ? '작성 중...' : '게시글 작성'}
          </button>
        </div>
      </form>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </section>
  )
}

export default PostCreatePanel
