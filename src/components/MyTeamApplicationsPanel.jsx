import { useEffect, useState } from 'react'
import { cancelApplication, getMyApplications } from '../api/applicationApi'

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

function MyTeamApplicationsPanel({
  currentUser,
  refreshKey,
  onApplicationsLoaded,
  onApplicationChanged,
  onInfo,
  onSuccess,
  onError,
}) {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [cancelingId, setCancelingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const isLoggedIn = currentUser.isLoggedIn && Boolean(currentUser.accessToken)

  useEffect(() => {
    if (!isLoggedIn) {
      onApplicationsLoaded([])
      return
    }

    let ignore = false

    async function loadApplications() {
      setIsLoading(true)
      setErrorMessage('')
      onInfo('내 신청 목록 조회 시작')

      try {
        const response = await getMyApplications()
        const nextApplications = extractApplications(response)

        if (ignore) {
          return
        }

        setApplications(nextApplications)
        onApplicationsLoaded(nextApplications)
        onSuccess('내 신청 목록 조회 완료', {
          count: nextApplications.length,
        })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(error, '내 신청 목록 조회 실패')
        setApplications([])
        onApplicationsLoaded([])
        setErrorMessage(
          normalizedError?.message ?? '내 신청 목록 조회 중 오류가 발생했습니다.',
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
  }, [
    isLoggedIn,
    refreshKey,
    onApplicationsLoaded,
    onError,
    onInfo,
    onSuccess,
  ])

  async function handleCancel(applicationId) {
    setCancelingId(applicationId)
    setErrorMessage('')
    onInfo(`가입 신청 취소 요청: applicationId=${applicationId}`, {
      applicationId,
    })

    try {
      await cancelApplication(applicationId)
      onSuccess(`가입 신청 취소 완료: applicationId=${applicationId}`, {
        applicationId,
      })
      onApplicationChanged()
    } catch (error) {
      const normalizedError = onError(
        error,
        `가입 신청 취소 실패: applicationId=${applicationId}`,
      )
      setErrorMessage(
        normalizedError?.message ?? '가입 신청 취소 중 오류가 발생했습니다.',
      )
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <section className="my-applications-panel" aria-labelledby="my-applications-title">
      <div className="panel-header">
        <div>
          <h2 id="my-applications-title">My Applications</h2>
          <p>내 팀 가입 신청 목록과 취소 가능 상태를 확인합니다.</p>
        </div>
        <span className="log-count">{applications.length}</span>
      </div>

      {!isLoggedIn ? <p className="empty-log">로그인 후 내 신청 목록을 조회할 수 있습니다.</p> : null}
      {isLoggedIn && isLoading ? <p className="empty-log">내 신청 목록을 조회하는 중입니다.</p> : null}
      {isLoggedIn && errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {isLoggedIn && !isLoading && !errorMessage && applications.length === 0 ? (
        <p className="empty-log">조회된 가입 신청이 없습니다.</p>
      ) : null}

      {isLoggedIn && applications.length > 0 ? (
        <ul className="application-list">
          {applications.map((application) => (
            <li key={application.applicationId} className="application-card">
              <div>
                <strong>{application.teamName}</strong>
                <span>
                  #{application.applicationId} · teamId={application.teamId}
                </span>
                <span>
                  {application.category} · {application.status}
                </span>
                <span>신청일 {formatDate(application.createdAt)}</span>
                {application.message ? <p>{application.message}</p> : null}
              </div>
              {application.status === 'PENDING' ? (
                <button
                  disabled={cancelingId === application.applicationId}
                  onClick={() => handleCancel(application.applicationId)}
                  type="button"
                >
                  {cancelingId === application.applicationId ? '취소 중...' : '신청 취소'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default MyTeamApplicationsPanel
