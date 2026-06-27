import { useParams } from 'react-router-dom'
import PostDetailPage from './PostDetailPage'

function PostDetailRoute() {
  const { categoryCode, postId } = useParams()

  return <PostDetailPage key={`${categoryCode}-${postId}`} />
}

export default PostDetailRoute
