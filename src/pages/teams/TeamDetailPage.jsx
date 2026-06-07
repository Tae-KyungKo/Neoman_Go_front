import { useCallback, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import ActionLogPanel from '../../components/ActionLogPanel'
import MyTeamApplicationsPanel from '../../components/MyTeamApplicationsPanel'
import OwnerTeamApplicationsPanel from '../../components/OwnerTeamApplicationsPanel'
import TeamApplicationPanel from '../../components/TeamApplicationPanel'
import TeamDetailPanel from '../../components/TeamDetailPanel'
import TeamMemberManagementPanel from '../../components/TeamMemberManagementPanel'
import { useActionLog } from '../../hooks/useActionLog'

function TeamDetailPage() {
  const { categoryCode, categoryLabel } = useOutletContext()
  const { teamId } = useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const { logs, addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const [selectedTeamDetail, setSelectedTeamDetail] = useState(null)
  const [myApplications, setMyApplications] = useState([])
  const [applicationRefreshKey, setApplicationRefreshKey] = useState(0)
  const [ownerApplicationRefreshKey, setOwnerApplicationRefreshKey] = useState(0)
  const [teamDetailRefreshKey, setTeamDetailRefreshKey] = useState(0)
  const currentUser = auth.currentUser ?? {
    isLoggedIn: Boolean(auth.accessToken),
    accessToken: auth.accessToken,
    email: '',
  }

  const handleTeamLoaded = useCallback(function handleTeamLoaded(team) {
    if (team && String(team.id) !== String(teamId)) {
      return
    }

    setSelectedTeamDetail(team)
  }, [teamId])

  const handleApplicationsLoaded = useCallback(
    function handleApplicationsLoaded(applications) {
      setMyApplications(applications)
    },
    [],
  )

  function handleApplicationChanged() {
    setApplicationRefreshKey((currentKey) => currentKey + 1)
    setTeamDetailRefreshKey((currentKey) => currentKey + 1)
    setOwnerApplicationRefreshKey((currentKey) => currentKey + 1)
  }

  function handleApplicationReviewed({ refreshTeamDetail = false } = {}) {
    setOwnerApplicationRefreshKey((currentKey) => currentKey + 1)
    setApplicationRefreshKey((currentKey) => currentKey + 1)

    if (refreshTeamDetail) {
      setTeamDetailRefreshKey((currentKey) => currentKey + 1)
    }
  }

  function handleTeamMemberChanged({
    clearSelectedTeam = false,
    refreshOwnerApplications = false,
    teamMayBeDeleted = false,
  } = {}) {
    if (clearSelectedTeam || teamMayBeDeleted) {
      navigate(`/c/${categoryCode}/teams`)
      return
    }

    setTeamDetailRefreshKey((currentKey) => currentKey + 1)

    if (refreshOwnerApplications) {
      setOwnerApplicationRefreshKey((currentKey) => currentKey + 1)
    }
  }

  const isLoadedCurrentTeam =
    selectedTeamDetail && String(selectedTeamDetail.id) === String(teamId)
  const routeTeamDetail = isLoadedCurrentTeam ? selectedTeamDetail : null
  const hasCategoryMismatch =
    routeTeamDetail?.category &&
    routeTeamDetail.category !== categoryCode

  return (
    <section className="team-route-page">
      {hasCategoryMismatch ? (
        <div className="placeholder-panel">
          <h2>URL 카테고리와 팀 카테고리가 일치하지 않습니다</h2>
          <p>
            URL은 {categoryLabel}({categoryCode})이지만 조회된 팀 카테고리는{' '}
            {routeTeamDetail.category}입니다.
          </p>
        </div>
      ) : null}

      <TeamDetailPanel
        key={`${categoryCode}-${teamId}`}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        onTeamLoaded={handleTeamLoaded}
        refreshKey={teamDetailRefreshKey}
        teamId={teamId}
      />

      {routeTeamDetail ? (
        <TeamMemberManagementPanel
          key={`${auth.accessToken || 'guest'}-${teamId}`}
          currentUser={currentUser}
          onError={addErrorLog}
          onInfo={addInfoLog}
          onMemberChanged={handleTeamMemberChanged}
          onSuccess={addSuccessLog}
          team={routeTeamDetail}
        />
      ) : null}

      <TeamApplicationPanel
        currentUser={currentUser}
        myApplications={myApplications}
        onApplicationChanged={handleApplicationChanged}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        team={routeTeamDetail}
      />

      <OwnerTeamApplicationsPanel
        key={`${auth.accessToken || 'guest'}-${teamId}`}
        currentUser={currentUser}
        onApplicationReviewed={handleApplicationReviewed}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        refreshKey={ownerApplicationRefreshKey}
        team={routeTeamDetail}
      />

      <MyTeamApplicationsPanel
        key={auth.accessToken || 'guest'}
        currentUser={currentUser}
        onApplicationChanged={handleApplicationChanged}
        onApplicationsLoaded={handleApplicationsLoaded}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        refreshKey={applicationRefreshKey}
      />

      <ActionLogPanel logs={logs} />
    </section>
  )
}

export default TeamDetailPage
