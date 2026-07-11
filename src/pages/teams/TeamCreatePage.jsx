import { useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import TeamCreatePanel from '../../components/TeamCreatePanel'
import { useActionLog } from '../../hooks/useActionLog'

function TeamCreatePage() {
  const { categoryCode, categoryLabel } = useOutletContext()
  const auth = useAuth()
  const navigate = useNavigate()
  const { addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const selectedCategory = useMemo(() => ({
    code: categoryCode,
    label: categoryLabel,
  }), [categoryCode, categoryLabel])
  const currentUser = auth.currentUser ?? {
    isLoggedIn: Boolean(auth.accessToken),
    accessToken: auth.accessToken,
    email: '',
  }

  function handleTeamCreated(team) {
    if (team?.id) {
      navigate(`/c/${categoryCode}/teams/${team.id}`)
      return
    }

    navigate(`/c/${categoryCode}/teams`)
  }

  return (
    <section className="team-route-page">
      <TeamCreatePanel
        currentUser={currentUser}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        onTeamCreated={handleTeamCreated}
        selectedCategory={selectedCategory}
      />

    </section>
  )
}

export default TeamCreatePage
