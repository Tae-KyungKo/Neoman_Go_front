import { useParams } from 'react-router-dom'
import NoticeDetailPage from './NoticeDetailPage'

function NoticeDetailRoute() {
  const { noticeId } = useParams()

  return <NoticeDetailPage key={noticeId} />
}

export default NoticeDetailRoute
