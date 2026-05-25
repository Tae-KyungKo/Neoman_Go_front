import { useState } from 'react'
import { applyToTeam } from '../api/applicationApi'

function extractApplication(response) {
  return response?.data?.data ?? null
}

function TeamApplicationPanel({
  team,
  currentUser,
  myApplications,
  onApplicationChanged,
  onInfo,
  onSuccess,
  onError,
}) {
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLoggedIn = currentUser.isLoggedIn && Boolean(currentUser.accessToken)
  const pendingApplication = myApplications.find(
    (application) => application.teamId === team?.id && application.status === 'PENDING',
  )
  const isRecruiting = team?.status === 'RECRUITING'
  const canApply = Boolean(team) && isLoggedIn && isRecruiting && !pendingApplication && !isSubmitting

  async function handleSubmit(event) {
    event.preventDefault()

    if (!team) {
      setErrorMessage('팀을 먼저 선택해야 가입 신청을 할 수 있습니다.')
      return
    }

    if (!isLoggedIn) {
      setErrorMessage('로그인 후 가입 신청을 할 수 있습니다.')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)
    onInfo(`가입 신청 요청: teamId=${team.id}`, { teamId: team.id })

    try {
      const response = await applyToTeam(team.id, {
        message: message.trim() || null,
      })
      const application = extractApplication(response)

      setMessage('')
      onSuccess(`가입 신청 완료: teamId=${team.id}`, {
        teamId: team.id,
        applicationId: application?.applicationId,
        status: application?.status,
      })
      onApplicationChanged()
    } catch (error) {
      const normalizedError = onError(error, `가입 신청 실패: teamId=${team.id}`)
      setErrorMessage(
        normalizedError?.message ?? '가입 신청 중 오류가 발생했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="team-application-panel" aria-labelledby="team-application-title">
      <div className="panel-header">
        <div>
          <h2 id="team-application-title">Apply to Team</h2>
          <p>선택한 팀에 가입 신청을 보냅니다.</p>
        </div>
        <span className="selected-category-badge">
          {team ? `teamId=${team.id}` : '선택 없음'}
        </span>
      </div>

      {!team ? <p className="empty-log">팀을 선택하면 가입 신청을 할 수 있습니다.</p> : null}
      {team && !isLoggedIn ? <p className="empty-log">로그인 후 가입 신청을 할 수 있습니다.</p> : null}
      {team && isLoggedIn && !isRecruiting ? (
        <p className="empty-log">모집중인 팀에만 가입 신청할 수 있습니다.</p>
      ) : null}
      {team && pendingApplication ? (
        <p className="empty-log">이미 이 팀에 PENDING 신청이 있습니다.</p>
      ) : null}

      <form className="application-form" onSubmit={handleSubmit}>
        <label>
          신청 메시지
          <textarea
            disabled={
              !team || !isLoggedIn || !isRecruiting || Boolean(pendingApplication) || isSubmitting
            }
            maxLength={500}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="가입 신청 메시지"
            rows={4}
            value={message}
          />
        </label>

        <div className="login-actions">
          <button disabled={!canApply} type="submit">
            {isSubmitting ? '신청 중...' : '가입 신청'}
          </button>
        </div>
      </form>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </section>
  )
}

export default TeamApplicationPanel
