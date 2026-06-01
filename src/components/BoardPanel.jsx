import { useState } from 'react'
import PostCreatePanel from './PostCreatePanel'
import PostDetailPanel from './PostDetailPanel'
import PostListPanel from './PostListPanel'

function BoardPanel({
  selectedCategory,
  selectedPostId,
  currentUser,
  onSelectPost,
  onPostDeleted,
  onInfo,
  onSuccess,
  onError,
}) {
  const [postListRefreshKey, setPostListRefreshKey] = useState(0)
  const [postDetailRefreshKey, setPostDetailRefreshKey] = useState(0)

  function refreshPostList() {
    setPostListRefreshKey((currentKey) => currentKey + 1)
  }

  function refreshPostDetail() {
    setPostDetailRefreshKey((currentKey) => currentKey + 1)
  }

  function handlePostCreated(post) {
    refreshPostList()

    const nextPostId = post?.id
    if (nextPostId) {
      onSelectPost(nextPostId)
      refreshPostDetail()
    }
  }

  function handlePostUpdated() {
    refreshPostList()
    refreshPostDetail()
  }

  function handlePostDeleted() {
    onPostDeleted()
    refreshPostList()
  }

  return (
    <section className="board-panel" aria-labelledby="board-panel-title">
      <div className="panel-header">
        <div>
          <h2 id="board-panel-title">Category Board</h2>
          <p>카테고리별 자유게시판과 댓글 API를 검증합니다.</p>
        </div>
        <span className="selected-category-badge">
          {selectedCategory ? selectedCategory.code : 'NO_CATEGORY'}
        </span>
      </div>

      <PostCreatePanel
        currentUser={currentUser}
        onError={onError}
        onInfo={onInfo}
        onPostCreated={handlePostCreated}
        onSuccess={onSuccess}
        selectedCategory={selectedCategory}
      />

      <div className="board-grid">
        <PostListPanel
          onError={onError}
          onInfo={onInfo}
          onSelectPost={onSelectPost}
          onSuccess={onSuccess}
          refreshKey={postListRefreshKey}
          selectedCategory={selectedCategory}
          selectedPostId={selectedPostId}
        />

        <PostDetailPanel
          currentUser={currentUser}
          onError={onError}
          onInfo={onInfo}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
          onSuccess={onSuccess}
          postId={selectedPostId}
          refreshKey={postDetailRefreshKey}
        />
      </div>
    </section>
  )
}

export default BoardPanel
