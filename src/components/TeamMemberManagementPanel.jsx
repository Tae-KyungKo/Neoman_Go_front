import { useEffect, useMemo, useState } from 'react'
import {
  delegateOwner,
  getTeamMembers,
  kickMember,
  leaveTeam,
} from '../api/teamApi'

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function extractMembers(response) {
  const data = response?.data?.data
  return Array.isArray(data) ? data : []
}

function TeamMemberManagementPanel({
  team,
  currentUser,
  onMemberChanged,
  onInfo,
  onSuccess,
  onError,
}) {
  const [actionMembers, setActionMembers] = useState([])
  const [isLoadingActionMembers, setIsLoadingActionMembers] = useState(false)
  const [processingKey, setProcessingKey] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const teamId = team?.id
  const isLoggedIn = currentUser.isLoggedIn && Boolean(currentUser.accessToken)
  const currentUserId = currentUser.id
  const members = Array.isArray(team?.members) ? team.members : []
  const activeMembers = members.filter((member) => member.status === 'ACTIVE')
  const currentMember = currentUserId
    ? activeMembers.find((member) => member.userId === currentUserId)
    : null
  const isCurrentOwner = currentMember?.role === 'OWNER'
  const isOwnerWithOtherMembers = isCurrentOwner && activeMembers.length > 1
  const isSoloOwner = isCurrentOwner && activeMembers.length === 1
  const canLeaveOrDisband =
    Boolean(team) &&
    isLoggedIn &&
    Boolean(currentMember) &&
    !isOwnerWithOtherMembers &&
    !processingKey
  const leaveActionLabel = isSoloOwner ? '팀 해산' : '팀 탈퇴'

  const teamMemberIdByUserId = useMemo(() => {
    return new Map(
      actionMembers.map((member) => [member.userId, member.teamMemberId]),
    )
  }, [actionMembers])

  useEffect(() => {
    if (!teamId || !isLoggedIn) {
      return
    }

    let ignore = false

    async function loadActionMembers() {
      setIsLoadingActionMembers(true)
      setErrorMessage('')

      try {
        const response = await getTeamMembers(teamId)
        const nextMembers = extractMembers(response)

        if (ignore) {
          return
        }

        setActionMembers(nextMembers)
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(
          error,
          `팀원 관리 식별자 조회 실패: teamId=${teamId}`,
        )
        setActionMembers([])
        setErrorMessage(
          normalizedError?.message ??
            '팀원 관리 식별자 조회 중 오류가 발생했습니다.',
        )
      } finally {
        if (!ignore) {
          setIsLoadingActionMembers(false)
        }
      }
    }

    loadActionMembers()

    return () => {
      ignore = true
    }
  }, [teamId, isLoggedIn, onError])

  async function handleLeave() {
    if (!teamId) {
      return
    }

    const confirmMessage = isSoloOwner
      ? '현재 팀의 유일한 OWNER입니다. 팀을 해산하면 팀 상태가 삭제 처리됩니다. 계속하시겠습니까?'
      : '정말 팀에서 탈퇴하시겠습니까?'
    const confirmed = window.confirm(confirmMessage)
    if (!confirmed) {
      return
    }

    setProcessingKey('leave')
    setErrorMessage('')
    onInfo(`${leaveActionLabel} 요청: teamId=${teamId}`, { teamId })

    try {
      await leaveTeam(teamId)
      onSuccess(`${leaveActionLabel} 완료: teamId=${teamId}`, { teamId })
      onMemberChanged({
        clearSelectedTeam: isSoloOwner,
        teamMayBeDeleted: isSoloOwner,
      })
    } catch (error) {
      const normalizedError = onError(
        error,
        `${leaveActionLabel} 실패: teamId=${teamId}`,
      )
      setErrorMessage(
        normalizedError?.message ??
          `${leaveActionLabel} 중 오류가 발생했습니다.`,
      )
    } finally {
      setProcessingKey('')
    }
  }

  async function handleKick(member) {
    if (!teamId) {
      return
    }

    const teamMemberId = teamMemberIdByUserId.get(member.userId)
    if (!teamMemberId) {
      setErrorMessage('teamMemberId를 확인할 수 없어 강퇴할 수 없습니다.')
      return
    }

    const confirmed = window.confirm('정말 이 팀원을 강퇴하시겠습니까?')
    if (!confirmed) {
      return
    }

    const nextProcessingKey = `kick-${teamMemberId}`
    setProcessingKey(nextProcessingKey)
    setErrorMessage('')
    onInfo(`팀원 강퇴 요청: teamId=${teamId}, targetMemberId=${teamMemberId}`, {
      teamId,
      targetTeamMemberId: teamMemberId,
    })

    try {
      await kickMember(teamId, teamMemberId)
      onSuccess(
        `팀원 강퇴 완료: teamId=${teamId}, targetMemberId=${teamMemberId}`,
        {
          teamId,
          targetTeamMemberId: teamMemberId,
        },
      )
      onMemberChanged()
    } catch (error) {
      const normalizedError = onError(
        error,
        `팀원 강퇴 실패: teamId=${teamId}, targetMemberId=${teamMemberId}`,
      )
      setErrorMessage(
        normalizedError?.message ?? '팀원 강퇴 중 오류가 발생했습니다.',
      )
    } finally {
      setProcessingKey('')
    }
  }

  async function handleDelegate(member) {
    if (!teamId) {
      return
    }

    const targetTeamMemberId = teamMemberIdByUserId.get(member.userId)
    if (!targetTeamMemberId) {
      setErrorMessage('targetTeamMemberId를 확인할 수 없어 OWNER를 위임할 수 없습니다.')
      return
    }

    const confirmed = window.confirm(
      '정말 OWNER 권한을 이 팀원에게 위임하시겠습니까? 위임 후 현재 사용자는 OWNER 권한을 잃을 수 있습니다.',
    )
    if (!confirmed) {
      return
    }

    const nextProcessingKey = `delegate-${targetTeamMemberId}`
    setProcessingKey(nextProcessingKey)
    setErrorMessage('')
    onInfo(
      `OWNER 위임 요청: teamId=${teamId}, targetMemberId=${targetTeamMemberId}`,
      {
        teamId,
        targetTeamMemberId,
      },
    )

    try {
      await delegateOwner(teamId, targetTeamMemberId)
      onSuccess(
        `OWNER 위임 완료: teamId=${teamId}, targetMemberId=${targetTeamMemberId}`,
        {
          teamId,
          targetTeamMemberId,
        },
      )
      onMemberChanged({ refreshOwnerApplications: true })
    } catch (error) {
      const normalizedError = onError(
        error,
        `OWNER 위임 실패: teamId=${teamId}, targetMemberId=${targetTeamMemberId}`,
      )
      setErrorMessage(
        normalizedError?.message ?? 'OWNER 위임 중 오류가 발생했습니다.',
      )
    } finally {
      setProcessingKey('')
    }
  }

  return (
    <section
      className="team-member-management-panel"
      aria-labelledby="team-member-management-title"
    >
      <div className="panel-header">
        <div>
          <h2 id="team-member-management-title">Team Member Management</h2>
          <p>팀 상세 응답의 ACTIVE 팀원을 기준으로 탈퇴, 강퇴, OWNER 위임을 검증합니다.</p>
        </div>
        <span className="selected-category-badge">
          {teamId ? `teamId=${teamId}` : 'NO_TEAM'}
        </span>
      </div>

      {!team ? (
        <p className="empty-log">팀을 선택하면 팀원 관리 상태를 확인합니다.</p>
      ) : null}
      {team && !isLoggedIn ? (
        <p className="empty-log">로그인해야 팀원 관리 API를 호출할 수 있습니다.</p>
      ) : null}
      {team && isLoggedIn && !currentUserId ? (
        <p className="empty-log">현재 사용자 정보를 확인 중이거나 조회하지 못했습니다.</p>
      ) : null}
      {team && isLoggedIn && !isCurrentOwner ? (
        <p className="empty-log">OWNER 전용 액션은 현재 사용자가 OWNER일 때만 활성화됩니다.</p>
      ) : null}
      {team && isOwnerWithOtherMembers ? (
        <p className="empty-log">OWNER는 다른 팀원에게 권한을 위임한 뒤 탈퇴할 수 있습니다.</p>
      ) : null}
      {team && isSoloOwner ? (
        <p className="empty-log">OWNER가 유일한 멤버인 경우 이 작업은 팀 탈퇴가 아니라 팀 해산으로 처리됩니다.</p>
      ) : null}
      {team && isLoadingActionMembers ? (
        <p className="empty-log">팀원 관리 식별자를 조회하는 중입니다.</p>
      ) : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {team && members.length === 0 ? (
        <p className="empty-log">표시할 팀원이 없습니다.</p>
      ) : null}

      {team && members.length > 0 ? (
        <ul className="management-member-list">
          {members.map((member) => {
            const teamMemberId = teamMemberIdByUserId.get(member.userId)
            const isSelf = currentUserId === member.userId
            const isOwner = member.role === 'OWNER'
            const canUseOwnerAction =
              isLoggedIn &&
              isCurrentOwner &&
              !isSelf &&
              !isOwner &&
              Boolean(teamMemberId) &&
              !processingKey

            return (
              <li key={`${member.userId}-${member.role}`}>
                <div>
                  <strong>{member.nickname}</strong>
                  <span>userId={member.userId}</span>
                  <span>teamMemberId={teamMemberId ?? '조회 필요'}</span>
                  <span>
                    {member.role} · {member.status}
                  </span>
                  <span>가입일 {formatDate(member.joinedAt)}</span>
                </div>

                <div className="member-actions">
                  {isSelf ? <span className="processed-state">현재 사용자</span> : null}
                  {isOwner ? <span className="processed-state">OWNER</span> : null}
                  {!isSelf && !isOwner ? (
                    <>
                      <button
                        disabled={!canUseOwnerAction}
                        onClick={() => handleKick(member)}
                        type="button"
                      >
                        {processingKey === `kick-${teamMemberId}`
                          ? '강퇴 중...'
                          : '강퇴'}
                      </button>
                      <button
                        disabled={!canUseOwnerAction}
                        onClick={() => handleDelegate(member)}
                        type="button"
                      >
                        {processingKey === `delegate-${teamMemberId}`
                          ? '위임 중...'
                          : 'OWNER 위임'}
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      <div className="login-actions member-leave-actions">
        <button
          disabled={!canLeaveOrDisband}
          onClick={handleLeave}
          type="button"
        >
          {processingKey === 'leave'
            ? isSoloOwner
              ? '해산 중...'
              : '탈퇴 중...'
            : leaveActionLabel}
        </button>
      </div>
    </section>
  )
}

export default TeamMemberManagementPanel
