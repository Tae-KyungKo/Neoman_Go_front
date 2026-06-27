import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import ActionLogPanel from '../../components/ActionLogPanel'
import PostCreatePanel from '../../components/PostCreatePanel'
import PostListPanel from '../../components/PostListPanel'
import { useActionLog } from '../../hooks/useActionLog'

function BoardListPage() {
  const { categoryCode, categoryLabel } = useOutletContext()
  const auth = useAuth()
  const navigate = useNavigate()
  const { logs, addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const [postListRefreshKey, setPostListRefreshKey] = useState(0)
  const selectedCategory = useMemo(() => ({
    code: categoryCode,
    label: categoryLabel,
  }), [categoryCode, categoryLabel])
  const currentUser = auth.currentUser ?? {
    isLoggedIn: Boolean(auth.accessToken),
    accessToken: auth.accessToken,
    email: '',
  }

  function handlePostCreated(post) {
    setPostListRefreshKey((currentKey) => currentKey + 1)

    if (post?.id) {
      navigate(`/c/${categoryCode}/posts/${post.id}`)
    }
  }

  function handleSelectPost(postId) {
    navigate(`/c/${categoryCode}/posts/${postId}`)
  }

  return (
    <section className="board-route-page">
      <div className="route-panel">
        <div className="route-panel-header">
          <div>
            <h2>{categoryLabel} 게시판</h2>
            <p>URL categoryCode를 기준으로 게시글 목록과 작성 UI를 렌더링한다.</p>
          </div>
          <span className="selected-category-badge">{categoryCode}</span>
        </div>
      </div>

      <PostCreatePanel
        currentUser={currentUser}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onPostCreated={handlePostCreated}
        onSuccess={addSuccessLog}
        selectedCategory={selectedCategory}
      />

      <PostListPanel
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSelectPost={handleSelectPost}
        onSuccess={addSuccessLog}
        refreshKey={`${categoryCode}-${postListRefreshKey}`}
        selectedCategory={selectedCategory}
        selectedPostId={null}
      />

      <ActionLogPanel logs={logs} />
    </section>
  )
}

export default BoardListPage
