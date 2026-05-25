import { useEffect, useState } from 'react'
import {
  approveApplication,
  getTeamApplications,
  rejectApplication,
} from '../api/applicationApi'

function extractApplications(response) {
  const data = response?.data?.data
  return Array.isArray(data) ? data : []
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

function OwnerTeamApplicationsPanel({
  currentUser,
  team,
  refreshKey,
  onApplicationReviewed,
  onInfo,
  onSuccess,
  onError,
}) {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const isLoggedIn = currentUser.isLoggedIn && Boolean(currentUser.accessToken)
  const teamId = team?.id

  useEffect(() => {
    if (!isLoggedIn || !teamId) {
      return
    }

    let ignore = false

    async function loadApplications() {
      setIsLoading(true)
      setErrorMessage('')
      onInfo(`OWNER 신청 목록 조회 시작: teamId=${teamId}`, { teamId })

      try {
        const response = await getTeamApplications(teamId)
        const nextApplications = extractApplications(response)

        if (ignore) {
          return
        }

        setApplications(nextApplications)
        onSuccess(`OWNER 신청 목록 조회 완료: teamId=${teamId}`, {
          teamId,
          count: nextApplications.length,
        })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(
          error,
          `OWNER 신청 목록 조회 실패: teamId=${teamId}`,
        )
        setApplications([])
        setErrorMessage(
          normalizedError?.message ??
            'OWNER 신청 목록 조회 중 오류가 발생했습니다.',
        )
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      ignore = true
    }
  }, [isLoggedIn, teamId, refreshKey, onError, onInfo, onSuccess])

  async function handleReview(applicationId, action) {
    setProcessingId(applicationId)
    setErrorMessage('')

    const isApprove = action === 'approve'
    const actionLabel = isApprove ? '승인' : '거절'
    onInfo(`가입 신청 ${actionLabel} 요청: applicationId=${applicationId}`, {
      applicationId,
    })

    try {
      const response = isApprove
        ? await approveApplication(applicationId)
        : await rejectApplication(applicationId)
      const reviewedApplication = response?.data?.data ?? null

      onSuccess(`가입 신청 ${actionLabel} 완료: applicationId=${applicationId}`, {
        applicationId,
        status: reviewedApplication?.status,
      })
      onApplicationReviewed({ refreshTeamDetail: isApprove })
    } catch (error) {
      const normalizedError = onError(
        error,
        `가입 신청 ${actionLabel} 실패: applicationId=${applicationId}`,
      )
      setErrorMessage(
        normalizedError?.message ??
          `가입 신청 ${actionLabel} 중 오류가 발생했습니다.`,
      )
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <section
      className="owner-applications-panel"
      aria-labelledby="owner-applications-title"
    >
      <div className="panel-header">
        <div>
          <h2 id="owner-applications-title">Owner Application Review</h2>
          <p>선택한 팀에 들어온 PENDING 가입 신청을 승인하거나 거절합니다.</p>
        </div>
        <span className="selected-category-badge">
          {teamId ? `teamId=${teamId}` : 'NO_TEAM'}
        </span>
      </div>

      {!isLoggedIn ? (
        <p className="empty-log">로그인해야 OWNER 신청 목록을 조회할 수 있습니다.</p>
      ) : null}
      {isLoggedIn && !teamId ? (
        <p className="empty-log">팀을 선택하면 OWNER 신청 목록을 조회합니다.</p>
      ) : null}
      {isLoggedIn && teamId && isLoading ? (
        <p className="empty-log">OWNER 신청 목록을 조회하는 중입니다.</p>
      ) : null}
      {isLoggedIn && teamId && errorMessage ? (
        <p className="form-error">{errorMessage}</p>
      ) : null}
      {isLoggedIn &&
      teamId &&
      !isLoading &&
      !errorMessage &&
      applications.length === 0 ? (
        <p className="empty-log">처리할 PENDING 가입 신청이 없습니다.</p>
      ) : null}

      {isLoggedIn && teamId && applications.length > 0 ? (
        <ul className="application-list">
          {applications.map((application) => {
            const isPending = application.status === 'PENDING'
            const isProcessing = processingId === application.applicationId

            return (
              <li key={application.applicationId} className="application-card">
                <div>
                  <strong>{application.applicantNickname}</strong>
                  <span>
                    applicationId={application.applicationId} · applicantId=
                    {application.applicantId}
                  </span>
                  <span>
                    {application.teamName} · {application.status}
                  </span>
                  <span>신청일 {formatDate(application.createdAt)}</span>
                  {application.message ? <p>{application.message}</p> : null}
                </div>

                <div className="application-actions">
                  {isPending ? (
                    <>
                      <button
                        disabled={Boolean(processingId)}
                        onClick={() =>
                          handleReview(application.applicationId, 'approve')
                        }
                        type="button"
                      >
                        {isProcessing ? '처리 중...' : '승인'}
                      </button>
                      <button
                        disabled={Boolean(processingId)}
                        onClick={() =>
                          handleReview(application.applicationId, 'reject')
                        }
                        type="button"
                      >
                        {isProcessing ? '처리 중...' : '거절'}
                      </button>
                    </>
                  ) : (
                    <span className="processed-state">이미 처리됨</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}

export default OwnerTeamApplicationsPanel


