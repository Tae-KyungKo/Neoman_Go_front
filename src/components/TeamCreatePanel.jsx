import { useState } from 'react'
import { createTeam } from '../api/teamApi'

function extractCreatedTeam(response) {
  return response?.data?.data ?? null
}

function TeamCreatePanel({
  selectedCategory,
  currentUser,
  onTeamCreated,
  onInfo,
  onSuccess,
  onError,
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLoggedIn = currentUser.isLoggedIn && Boolean(currentUser.accessToken)
  const canSubmit = isLoggedIn && selectedCategory && name.trim() && !isSubmitting

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedCategory) {
      setErrorMessage('카테고리를 먼저 선택해야 팀을 생성할 수 있습니다.')
      return
    }

    if (!isLoggedIn) {
      setErrorMessage('로그인 후 팀을 생성할 수 있습니다.')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)
    onInfo(`팀 생성 요청: ${selectedCategory.code}`, {
      category: selectedCategory.code,
    })

    try {
      const response = await createTeam({
        name: name.trim(),
        description: description.trim() || null,
        category: selectedCategory.code,
      })
      const createdTeam = extractCreatedTeam(response)

      setName('')
      setDescription('')
      onSuccess(
        `팀 생성 완료: teamId=${createdTeam?.id ?? '-'}, category=${selectedCategory.code}`,
        {
          teamId: createdTeam?.id,
          category: createdTeam?.category ?? selectedCategory.code,
          name: createdTeam?.name,
        },
      )
      onTeamCreated(createdTeam)
    } catch (error) {
      const normalizedError = onError(
        error,
        `팀 생성 실패: ${selectedCategory.code}`,
      )
      setErrorMessage(
        normalizedError?.message ?? '팀 생성 중 오류가 발생했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="team-create-panel" aria-labelledby="team-create-title">
      <div className="panel-header">
        <div>
          <h2 id="team-create-title">Create Team</h2>
          <p>선택한 카테고리에 로그인 사용자 기준으로 팀을 생성합니다.</p>
        </div>
        <span className="selected-category-badge">
          {selectedCategory ? selectedCategory.code : 'NO_CATEGORY'}
        </span>
      </div>

      {!selectedCategory ? (
        <p className="empty-log">카테고리를 먼저 선택해야 팀을 생성할 수 있습니다.</p>
      ) : null}

      {selectedCategory && !isLoggedIn ? (
        <p className="empty-log">로그인 후 팀을 생성할 수 있습니다.</p>
      ) : null}

      <form className="team-create-form" onSubmit={handleSubmit}>
        <label>
          팀명
          <input
            disabled={isSubmitting || !selectedCategory || !isLoggedIn}
            maxLength={50}
            onChange={(event) => setName(event.target.value)}
            placeholder="팀 이름"
            type="text"
            value={name}
          />
        </label>

        <label>
          소개
          <textarea
            disabled={isSubmitting || !selectedCategory || !isLoggedIn}
            maxLength={500}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="팀 소개"
            rows={4}
            value={description}
          />
        </label>

        <div className="auth-state">
          <span>
            category:{' '}
            {selectedCategory
              ? `${selectedCategory.label}(${selectedCategory.code})`
              : '선택되지 않음'}
          </span>
        </div>

        <div className="login-actions">
          <button disabled={!canSubmit} type="submit">
            {isSubmitting ? '생성 중...' : '팀 생성'}
          </button>
        </div>
      </form>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </section>
  )
}

export default TeamCreatePanel
