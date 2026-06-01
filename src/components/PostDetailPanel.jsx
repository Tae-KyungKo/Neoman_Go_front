import { useEffect, useState } from 'react'
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from '../api/commentApi'
import { deletePost, getPost, updatePost } from '../api/postApi'

function extractData(response) {
  return response?.data?.data ?? null
}

function extractCommentPage(response) {
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

function getAuthorLabel(item) {
  return item?.authorNickname ?? '-'
}

function PostDetailPanel({
  postId,
  currentUser,
  refreshKey,
  onPostUpdated,
  onPostDeleted,
  onInfo,
  onSuccess,
  onError,
}) {
  const [post, setPost] = useState(null)
  const [loadedPostId, setLoadedPostId] = useState(null)
  const [comments, setComments] = useState([])
  const [loadedCommentsPostId, setLoadedCommentsPostId] = useState(null)
  const [commentPageInfo, setCommentPageInfo] = useState(null)
  const [commentRefreshKey, setCommentRefreshKey] = useState(0)
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [postErrorMessage, setPostErrorMessage] = useState('')
  const [postErrorPostId, setPostErrorPostId] = useState(null)
  const [commentErrorMessage, setCommentErrorMessage] = useState('')
  const [commentErrorPostId, setCommentErrorPostId] = useState(null)
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [newCommentContent, setNewCommentContent] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [processingKey, setProcessingKey] = useState('')

  const isLoggedIn = currentUser.isLoggedIn && Boolean(currentUser.accessToken)
  const isPostReady = Boolean(postId) && loadedPostId === postId
  const areCommentsReady = Boolean(postId) && loadedCommentsPostId === postId
  const isCurrentPostError = Boolean(postId) && postErrorPostId === postId
  const isCurrentCommentError = Boolean(postId) && commentErrorPostId === postId

  useEffect(() => {
    if (!postId) {
      return
    }

    let ignore = false

    async function loadPost() {
      setIsLoadingPost(true)
      setPostErrorMessage('')
      setPostErrorPostId(null)
      onInfo(`게시글 상세 조회 시작: postId=${postId}`, { postId })

      try {
        const response = await getPost(postId)
        const detail = extractData(response)

        if (ignore) {
          return
        }

        setPost(detail)
        setLoadedPostId(postId)
        setEditTitle(detail?.title ?? '')
        setEditContent(detail?.content ?? '')
        setIsEditingPost(false)
        onSuccess(`게시글 상세 조회 완료: postId=${postId}`, { postId })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(
          error,
          `게시글 상세 조회 실패: postId=${postId}`,
        )
        setPost(null)
        setLoadedPostId(null)
        setPostErrorPostId(postId)
        setPostErrorMessage(
          normalizedError?.message ?? '게시글 상세 조회 중 오류가 발생했습니다.',
        )
      } finally {
        if (!ignore) {
          setIsLoadingPost(false)
        }
      }
    }

    loadPost()

    return () => {
      ignore = true
    }
  }, [postId, refreshKey, onError, onInfo, onSuccess])

  useEffect(() => {
    if (!postId) {
      return
    }

    let ignore = false

    async function loadComments() {
      setIsLoadingComments(true)
      setCommentErrorMessage('')
      setCommentErrorPostId(null)
      onInfo(`댓글 목록 조회 시작: postId=${postId}`, { postId })

      try {
        const response = await getComments(postId, {
          page: 0,
          size: 20,
        })
        const page = extractCommentPage(response)
        const content = Array.isArray(page.content) ? page.content : []

        if (ignore) {
          return
        }

        setComments(content)
        setLoadedCommentsPostId(postId)
        setCommentPageInfo({
          number: page.number,
          size: page.size,
          totalElements: page.totalElements,
          totalPages: page.totalPages,
        })
        onSuccess(`댓글 목록 조회 완료: postId=${postId}`, {
          postId,
          count: content.length,
          totalElements: page.totalElements,
        })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(
          error,
          `댓글 목록 조회 실패: postId=${postId}`,
        )
        setComments([])
        setLoadedCommentsPostId(null)
        setCommentPageInfo(null)
        setCommentErrorPostId(postId)
        setCommentErrorMessage(
          normalizedError?.message ?? '댓글 목록 조회 중 오류가 발생했습니다.',
        )
      } finally {
        if (!ignore) {
          setIsLoadingComments(false)
        }
      }
    }

    loadComments()

    return () => {
      ignore = true
    }
  }, [postId, commentRefreshKey, onError, onInfo, onSuccess])

  async function handleUpdatePost(event) {
    event.preventDefault()

    if (!postId || !isLoggedIn) {
      return
    }

    setProcessingKey('post-update')
    setPostErrorMessage('')
    setPostErrorPostId(null)
    onInfo(`게시글 수정 요청: postId=${postId}`, { postId })

    try {
      const response = await updatePost(postId, {
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      const updatedPost = extractData(response)

      setPost(updatedPost)
      setLoadedPostId(postId)
      setIsEditingPost(false)
      onSuccess(`게시글 수정 완료: postId=${postId}`, { postId })
      onPostUpdated()
    } catch (error) {
      const normalizedError = onError(error, `게시글 수정 실패: postId=${postId}`)
      setPostErrorPostId(postId)
      setPostErrorMessage(
        normalizedError?.message ?? '게시글 수정 중 오류가 발생했습니다.',
      )
    } finally {
      setProcessingKey('')
    }
  }

  async function handleDeletePost() {
    if (!postId || !isLoggedIn) {
      return
    }

    const confirmed = window.confirm('정말 이 게시글을 삭제하시겠습니까?')
    if (!confirmed) {
      return
    }

    setProcessingKey('post-delete')
    setPostErrorMessage('')
    setPostErrorPostId(null)
    onInfo(`게시글 삭제 요청: postId=${postId}`, { postId })

    try {
      await deletePost(postId)
      onSuccess(`게시글 삭제 완료: postId=${postId}`, { postId })
      onPostDeleted()
    } catch (error) {
      const normalizedError = onError(error, `게시글 삭제 실패: postId=${postId}`)
      setPostErrorPostId(postId)
      setPostErrorMessage(
        normalizedError?.message ?? '게시글 삭제 중 오류가 발생했습니다.',
      )
    } finally {
      setProcessingKey('')
    }
  }

  async function handleCreateComment(event) {
    event.preventDefault()

    if (!postId || !isLoggedIn || !newCommentContent.trim()) {
      return
    }

    setProcessingKey('comment-create')
    setCommentErrorMessage('')
    setCommentErrorPostId(null)
    onInfo(`댓글 작성 요청: postId=${postId}`, { postId })

    try {
      await createComment(postId, {
        content: newCommentContent.trim(),
      })
      setNewCommentContent('')
      setCommentRefreshKey((currentKey) => currentKey + 1)
      onSuccess(`댓글 작성 완료: postId=${postId}`, { postId })
    } catch (error) {
      const normalizedError = onError(error, `댓글 작성 실패: postId=${postId}`)
      setCommentErrorPostId(postId)
      setCommentErrorMessage(
        normalizedError?.message ?? '댓글 작성 중 오류가 발생했습니다.',
      )
    } finally {
      setProcessingKey('')
    }
  }

  async function handleUpdateComment(commentId) {
    if (!commentId || !isLoggedIn || !editingCommentContent.trim()) {
      return
    }

    const nextProcessingKey = `comment-update-${commentId}`
    setProcessingKey(nextProcessingKey)
    setCommentErrorMessage('')
    setCommentErrorPostId(null)
    onInfo(`댓글 수정 요청: commentId=${commentId}`, { commentId })

    try {
      await updateComment(commentId, {
        content: editingCommentContent.trim(),
      })
      setEditingCommentId(null)
      setEditingCommentContent('')
      setCommentRefreshKey((currentKey) => currentKey + 1)
      onSuccess(`댓글 수정 완료: commentId=${commentId}`, { commentId })
    } catch (error) {
      const normalizedError = onError(
        error,
        `댓글 수정 실패: commentId=${commentId}`,
      )
      setCommentErrorPostId(postId)
      setCommentErrorMessage(
        normalizedError?.message ?? '댓글 수정 중 오류가 발생했습니다.',
      )
    } finally {
      setProcessingKey('')
    }
  }

  async function handleDeleteComment(commentId) {
    if (!commentId || !isLoggedIn) {
      return
    }

    const confirmed = window.confirm('정말 이 댓글을 삭제하시겠습니까?')
    if (!confirmed) {
      return
    }

    const nextProcessingKey = `comment-delete-${commentId}`
    setProcessingKey(nextProcessingKey)
    setCommentErrorMessage('')
    setCommentErrorPostId(null)
    onInfo(`댓글 삭제 요청: commentId=${commentId}`, { commentId })

    try {
      await deleteComment(commentId)
      setCommentRefreshKey((currentKey) => currentKey + 1)
      onSuccess(`댓글 삭제 완료: commentId=${commentId}`, { commentId })
    } catch (error) {
      const normalizedError = onError(
        error,
        `댓글 삭제 실패: commentId=${commentId}`,
      )
      setCommentErrorPostId(postId)
      setCommentErrorMessage(
        normalizedError?.message ?? '댓글 삭제 중 오류가 발생했습니다.',
      )
    } finally {
      setProcessingKey('')
    }
  }

  return (
    <section className="post-detail-panel" aria-labelledby="post-detail-title">
      <div className="panel-header">
        <div>
          <h2 id="post-detail-title">Post Detail</h2>
          <p>게시글 상세와 댓글 CRUD를 검증합니다.</p>
        </div>
        <span className="selected-category-badge">
          {postId ? `postId=${postId}` : 'NO_POST'}
        </span>
      </div>

      {!postId ? (
        <p className="empty-log">게시글을 선택하면 상세와 댓글 목록을 조회합니다.</p>
      ) : null}

      {postId && isLoadingPost ? (
        <p className="empty-log">게시글 상세를 조회하는 중입니다.</p>
      ) : null}

      {postId && isCurrentPostError && postErrorMessage ? (
        <p className="form-error">{postErrorMessage}</p>
      ) : null}

      {postId && post && isPostReady && !isLoadingPost ? (
        <div className="post-detail">
          {!isEditingPost ? (
            <>
              <div className="team-detail-header">
                <div>
                  <h3>{post.title ?? '(제목 없음)'}</h3>
                  <p className="post-content">{post.content ?? ''}</p>
                </div>
                <span className="status-badge">ID {post.id}</span>
              </div>

              <dl className="team-detail-grid">
                <div>
                  <dt>작성자</dt>
                  <dd>{getAuthorLabel(post)}</dd>
                </div>
                <div>
                  <dt>카테고리</dt>
                  <dd>{post.category ?? '-'}</dd>
                </div>
                <div>
                  <dt>작성일</dt>
                  <dd>{formatDate(post.createdAt)}</dd>
                </div>
                <div>
                  <dt>수정일</dt>
                  <dd>{formatDate(post.updatedAt)}</dd>
                </div>
              </dl>

              {!isLoggedIn ? (
                <p className="empty-log">게시글 수정/삭제는 로그인 후 요청할 수 있습니다.</p>
              ) : null}

              <div className="login-actions">
                <button
                  disabled={!isLoggedIn || Boolean(processingKey)}
                  onClick={() => setIsEditingPost(true)}
                  type="button"
                >
                  게시글 수정
                </button>
                <button
                  disabled={!isLoggedIn || Boolean(processingKey)}
                  onClick={handleDeletePost}
                  type="button"
                >
                  {processingKey === 'post-delete' ? '삭제 중...' : '게시글 삭제'}
                </button>
              </div>
            </>
          ) : (
            <form className="post-form" onSubmit={handleUpdatePost}>
              <label>
                제목
                <input
                  disabled={processingKey === 'post-update'}
                  maxLength={100}
                  onChange={(event) => setEditTitle(event.target.value)}
                  type="text"
                  value={editTitle}
                />
              </label>

              <label>
                내용
                <textarea
                  disabled={processingKey === 'post-update'}
                  maxLength={5000}
                  onChange={(event) => setEditContent(event.target.value)}
                  rows={6}
                  value={editContent}
                />
              </label>

              <div className="login-actions">
                <button
                  disabled={
                    processingKey === 'post-update' ||
                    !editTitle.trim() ||
                    !editContent.trim()
                  }
                  type="submit"
                >
                  {processingKey === 'post-update' ? '수정 중...' : '수정 저장'}
                </button>
                <button
                  disabled={processingKey === 'post-update'}
                  onClick={() => setIsEditingPost(false)}
                  type="button"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          <div className="comment-section">
            <div className="panel-header compact">
              <div>
                <h3>Comments</h3>
                <p>댓글 목록은 비로그인 상태에서도 조회됩니다.</p>
              </div>
              {areCommentsReady &&
              typeof commentPageInfo?.totalElements === 'number' ? (
                <span className="selected-category-badge">
                  total={commentPageInfo.totalElements}
                </span>
              ) : null}
            </div>

            {isLoadingComments ? (
              <p className="empty-log">댓글 목록을 조회하는 중입니다.</p>
            ) : null}

            {isCurrentCommentError && commentErrorMessage ? (
              <p className="form-error">{commentErrorMessage}</p>
            ) : null}

            {areCommentsReady &&
            !isLoadingComments &&
            !isCurrentCommentError &&
            comments.length === 0 ? (
              <p className="empty-log">등록된 댓글이 없습니다.</p>
            ) : null}

            {areCommentsReady && comments.length > 0 ? (
              <ul className="comment-list">
                {comments.map((comment) => {
                  const commentId = comment.id
                  const isEditingComment = editingCommentId === commentId

                  return (
                    <li key={commentId}>
                      <div>
                        <strong>{getAuthorLabel(comment)}</strong>
                        <span>commentId={commentId}</span>
                        <span>작성일 {formatDate(comment.createdAt)}</span>
                      </div>

                      {isEditingComment ? (
                        <div className="comment-edit">
                          <textarea
                            disabled={processingKey === `comment-update-${commentId}`}
                            maxLength={1000}
                            onChange={(event) =>
                              setEditingCommentContent(event.target.value)
                            }
                            rows={3}
                            value={editingCommentContent}
                          />
                          <div className="application-actions">
                            <button
                              disabled={
                                processingKey === `comment-update-${commentId}` ||
                                !editingCommentContent.trim()
                              }
                              onClick={() => handleUpdateComment(commentId)}
                              type="button"
                            >
                              {processingKey === `comment-update-${commentId}`
                                ? '수정 중...'
                                : '저장'}
                            </button>
                            <button
                              disabled={processingKey === `comment-update-${commentId}`}
                              onClick={() => {
                                setEditingCommentId(null)
                                setEditingCommentContent('')
                              }}
                              type="button"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{comment.content}</p>
                      )}

                      {!isEditingComment ? (
                        <div className="application-actions">
                          <button
                            disabled={!isLoggedIn || Boolean(processingKey)}
                            onClick={() => {
                              setEditingCommentId(commentId)
                              setEditingCommentContent(comment.content ?? '')
                            }}
                            type="button"
                          >
                            댓글 수정
                          </button>
                          <button
                            disabled={!isLoggedIn || Boolean(processingKey)}
                            onClick={() => handleDeleteComment(commentId)}
                            type="button"
                          >
                            {processingKey === `comment-delete-${commentId}`
                              ? '삭제 중...'
                              : '댓글 삭제'}
                          </button>
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            ) : null}

            {!isLoggedIn ? (
              <p className="empty-log">댓글 작성/수정/삭제는 로그인 후 요청할 수 있습니다.</p>
            ) : null}

            <form className="comment-form" onSubmit={handleCreateComment}>
              <label>
                새 댓글
                <textarea
                  disabled={!isLoggedIn || processingKey === 'comment-create'}
                  maxLength={1000}
                  onChange={(event) => setNewCommentContent(event.target.value)}
                  placeholder="댓글 내용"
                  rows={3}
                  value={newCommentContent}
                />
              </label>
              <div className="login-actions">
                <button
                  disabled={
                    !isLoggedIn ||
                    processingKey === 'comment-create' ||
                    !newCommentContent.trim()
                  }
                  type="submit"
                >
                  {processingKey === 'comment-create' ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default PostDetailPanel
