import { useEffect, useState } from 'react'
import { getPosts } from '../api/postApi'

function extractPostPage(response) {
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

function getAuthorLabel(post) {
  return post?.authorNickname ?? '-'
}

function PostListPanel({
  selectedCategory,
  selectedPostId,
  refreshKey,
  onSelectPost,
  onInfo,
  onSuccess,
  onError,
}) {
  const [posts, setPosts] = useState([])
  const [pageInfo, setPageInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!selectedCategory) {
      return
    }

    let ignore = false

    async function loadPosts() {
      setIsLoading(true)
      setErrorMessage('')
      onInfo(`게시글 목록 조회 시작: category=${selectedCategory.code}`, {
        category: selectedCategory.code,
      })

      try {
        const response = await getPosts(selectedCategory.code, {
          page: 0,
          size: 10,
        })
        const page = extractPostPage(response)
        const content = Array.isArray(page.content) ? page.content : []

        if (ignore) {
          return
        }

        setPosts(content)
        setPageInfo({
          number: page.number,
          size: page.size,
          totalElements: page.totalElements,
          totalPages: page.totalPages,
        })
        onSuccess(`게시글 목록 조회 완료: category=${selectedCategory.code}`, {
          category: selectedCategory.code,
          count: content.length,
          totalElements: page.totalElements,
        })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(
          error,
          `게시글 목록 조회 실패: category=${selectedCategory.code}`,
        )
        setPosts([])
        setPageInfo(null)
        setErrorMessage(
          normalizedError?.message ?? '게시글 목록 조회 중 오류가 발생했습니다.',
        )
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      ignore = true
    }
  }, [selectedCategory, refreshKey, onError, onInfo, onSuccess])

  return (
    <section className="post-list-panel" aria-labelledby="post-list-title">
      <div className="panel-header">
        <div>
          <h2 id="post-list-title">Board Posts</h2>
          <p>선택한 카테고리의 자유게시판 목록을 조회합니다.</p>
        </div>
        <span className="selected-category-badge">
          {selectedCategory ? selectedCategory.code : 'NO_CATEGORY'}
        </span>
      </div>

      {!selectedCategory ? (
        <p className="empty-log">카테고리를 선택하면 게시글 목록을 조회합니다.</p>
      ) : null}

      {selectedCategory && isLoading ? (
        <p className="empty-log">게시글 목록을 조회하는 중입니다.</p>
      ) : null}

      {selectedCategory && errorMessage ? (
        <p className="form-error">{errorMessage}</p>
      ) : null}

      {selectedCategory && !isLoading && !errorMessage && posts.length === 0 ? (
        <p className="empty-log">해당 카테고리에 등록된 게시글이 없습니다.</p>
      ) : null}

      {selectedCategory && posts.length > 0 ? (
        <>
          <div className="team-list-meta">
            <span>조회 결과 {posts.length}개</span>
            {typeof pageInfo?.totalElements === 'number' ? (
              <span>전체 {pageInfo.totalElements}개</span>
            ) : null}
          </div>

          <ul className="post-list">
            {posts.map((post) => {
              const postId = post.id
              const isSelected = selectedPostId === postId

              return (
                <li key={postId}>
                  <button
                    aria-pressed={isSelected}
                    className={isSelected ? 'post-card selected' : 'post-card'}
                    onClick={() => onSelectPost(postId)}
                    type="button"
                  >
                    <span className="team-card-title">
                      {post.title ?? '(제목 없음)'}
                    </span>
                    <span className="team-card-meta">ID {postId}</span>
                    <span className="team-card-meta">
                      작성자 {getAuthorLabel(post)}
                    </span>
                    <span className="team-card-meta">
                      작성일 {formatDate(post.createdAt)}
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

export default PostListPanel
