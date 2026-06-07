import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { normalizeApiError } from '../api/client'
import { signup } from '../api/authApi'
import { useAuth } from '../auth/useAuth'

const MIN_PASSWORD_LENGTH = 8

function validateForm({ email, password, passwordConfirm, nickname }) {
  if (!email.trim()) {
    return 'email을 입력해주세요.'
  }

  if (!password) {
    return 'password를 입력해주세요.'
  }

  if (!passwordConfirm) {
    return 'password 확인을 입력해주세요.'
  }

  if (!nickname.trim()) {
    return 'nickname을 입력해주세요.'
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `password는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`
  }

  if (password !== passwordConfirm) {
    return 'password와 password 확인이 일치하지 않습니다.'
  }

  return ''
}

function SignupPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isLoggedIn = Boolean(currentUser?.isLoggedIn)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const validationMessage = validateForm({
      email,
      password,
      passwordConfirm,
      nickname,
    })

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setIsSubmitting(true)

    try {
      await signup({
        email: email.trim(),
        password,
        nickname: nickname.trim(),
      })
      navigate('/login', {
        replace: true,
        state: {
          signupMessage: '회원가입이 완료되었습니다. 로그인해주세요.',
        },
      })
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoggedIn) {
    return (
      <section className="route-panel">
        <div className="route-panel-header">
          <div>
            <h1>회원가입</h1>
            <p>이미 로그인 중입니다. 새 계정을 만들려면 먼저 로그아웃해주세요.</p>
          </div>
        </div>
        <div className="login-actions">
          <Link className="button-link" to="/">
            홈으로 이동
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="login-page">
      <section className="login-panel" aria-labelledby="signup-title">
        <div className="panel-header">
          <div>
            <h2 id="signup-title">Signup</h2>
            <p>일반 이메일 계정으로 너만고 시연용 계정을 생성합니다.</p>
          </div>
          <span className="auth-off">Guest</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            이메일
            <input
              autoComplete="email"
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
              type="email"
              value={email}
            />
          </label>

          <label>
            비밀번호
            <input
              autoComplete="new-password"
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8자 이상"
              type="password"
              value={password}
            />
          </label>

          <label>
            비밀번호 확인
            <input
              autoComplete="new-password"
              disabled={isSubmitting}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              placeholder="비밀번호 재입력"
              type="password"
              value={passwordConfirm}
            />
          </label>

          <label>
            닉네임
            <input
              autoComplete="nickname"
              disabled={isSubmitting}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="tester"
              type="text"
              value={nickname}
            />
          </label>

          <div className="login-actions">
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? '회원가입 중...' : '회원가입'}
            </button>
            <Link className="button-link" to="/login">
              이미 계정이 있나요? 로그인
            </Link>
          </div>
        </form>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </section>
    </section>
  )
}

export default SignupPage
