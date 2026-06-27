import { useCallback, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import ActionLogPanel from '../../components/ActionLogPanel'
import PostDetailPanel from '../../components/PostDetailPanel'
import { useActionLog } from '../../hooks/useActionLog'

function PostDetailPage() {
  const { categoryCode, categoryLabel } = useOutletContext()
  const { postId } = useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const { logs, addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const [postDetailRefreshKey, setPostDetailRefreshKey] = useState(0)
  const [loadedPost, setLoadedPost] = useState(null)
  const currentUser = auth.currentUser ?? {
    isLoggedIn: Boolean(auth.accessToken),
    accessToken: auth.accessToken,
    email: '',
  }

  const handlePostLoaded = useCallback(function handlePostLoaded(post) {
    setLoadedPost(post)
  }, [])

  function handlePostUpdated() {
    setPostDetailRefreshKey((currentKey) => currentKey + 1)
  }

  function handlePostDeleted() {
    navigate(`/c/${categoryCode}/board`)
  }

  const hasCategoryMismatch =
    loadedPost?.category &&
    loadedPost.category !== categoryCode

  return (
    <section className="board-route-page">
      <div className="route-panel">
        <div className="route-panel-header">
          <div>
            <h2>{categoryLabel} 게시글 상세</h2>
            <p>
              URL postId <code>{postId}</code>를 기준으로 게시글과 댓글을 조회한다.
            </p>
          </div>
          <Link className="button-link" to={`/c/${categoryCode}/board`}>
            목록으로
          </Link>
        </div>
      </div>

      {hasCategoryMismatch ? (
        <div className="placeholder-panel">
          <h2>URL 카테고리와 게시글 카테고리가 일치하지 않습니다</h2>
          <p>
            URL은 {categoryLabel}({categoryCode})이지만 조회된 게시글 카테고리는{' '}
            {loadedPost.category}입니다.
          </p>
        </div>
      ) : null}

      <PostDetailPanel
        key={`${categoryCode}-${postId}-${postDetailRefreshKey}`}
        currentUser={currentUser}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onPostDeleted={handlePostDeleted}
        onPostLoaded={handlePostLoaded}
        onPostUpdated={handlePostUpdated}
        onSuccess={addSuccessLog}
        postId={postId}
        refreshKey={postDetailRefreshKey}
      />

      <ActionLogPanel logs={logs} />
    </section>
  )
}

export default PostDetailPage
