import { useParams } from 'react-router-dom'
import TeamDetailPage from './TeamDetailPage'

function TeamDetailRoute() {
  const { categoryCode, teamId } = useParams()

  return <TeamDetailPage key={`${categoryCode}-${teamId}`} />
}

export default TeamDetailRoute
