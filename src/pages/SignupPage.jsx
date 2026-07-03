import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkLoginId, checkNickname, signup } from '../api/authApi'
import { normalizeApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

const LOGIN_ID_PATTERN = /^[A-Za-z0-9]{4,12}$/
const PASSWORD_PATTERN = /^[\x21-\x7E]{8,16}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESERVED_NICKNAMES = ['관리자', '운영자']
const IDLE_CHECK = {
  status: 'idle',
  message: '',
}

function getAvailability(response) {
  return {
    available: Boolean(response?.data?.data?.available),
    message: response?.data?.message ?? '',
  }
}

function isReservedNickname(nickname) {
  const normalizedNickname = nickname.trim().toLowerCase()

  return (
    RESERVED_NICKNAMES.includes(normalizedNickname) ||
    normalizedNickname.includes('admin')
  )
}

function validateLoginId(loginId) {
  if (!LOGIN_ID_PATTERN.test(loginId.trim())) {
    return '아이디는 4~12자의 영문 대소문자와 숫자만 사용할 수 있습니다.'
  }

  return ''
}

function validatePassword(password) {
  if (!PASSWORD_PATTERN.test(password)) {
    return '비밀번호는 공백과 한글 없이 8~16자의 영문, 숫자, 특수문자로 입력해주세요.'
  }

  return ''
}

function validateNickname(nickname) {
  const trimmedNickname = nickname.trim()

  if (trimmedNickname.length < 2 || trimmedNickname.length > 12) {
    return '닉네임은 2~12자로 입력해주세요.'
  }

  if (isReservedNickname(trimmedNickname)) {
    return '사용할 수 없는 닉네임입니다.'
  }

  return ''
}

function validateForm({
  loginId,
  email,
  password,
  passwordConfirm,
  nickname,
  loginIdCheckStatus,
  nicknameCheckStatus,
}) {
  const loginIdMessage = validateLoginId(loginId)
  if (loginIdMessage) {
    return loginIdMessage
  }

  if (!email.trim() || !EMAIL_PATTERN.test(email.trim())) {
    return '유효한 이메일을 입력해주세요.'
  }

  const passwordMessage = validatePassword(password)
  if (passwordMessage) {
    return passwordMessage
  }

  if (password !== passwordConfirm) {
    return '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
  }

  const nicknameMessage = validateNickname(nickname)
  if (nicknameMessage) {
    return nicknameMessage
  }

  if (loginIdCheckStatus !== 'available') {
    return '아이디 중복 확인을 완료해주세요.'
  }

  if (nicknameCheckStatus !== 'available') {
    return '닉네임 중복 확인을 완료해주세요.'
  }

  return ''
}

function SignupPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [loginIdCheck, setLoginIdCheck] = useState(IDLE_CHECK)
  const [nicknameCheck, setNicknameCheck] = useState(IDLE_CHECK)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isLoggedIn = Boolean(currentUser?.isLoggedIn)
  const isChecking =
    loginIdCheck.status === 'checking' || nicknameCheck.status === 'checking'

  function handleLoginIdChange(event) {
    setLoginId(event.target.value)
    setLoginIdCheck(IDLE_CHECK)
  }

  function handleNicknameChange(event) {
    setNickname(event.target.value)
    setNicknameCheck(IDLE_CHECK)
  }

  async function handleLoginIdCheck() {
    const trimmedLoginId = loginId.trim()
    const validationMessage = validateLoginId(trimmedLoginId)

    if (validationMessage) {
      setLoginIdCheck({
        status: 'unavailable',
        message: validationMessage,
      })
      return
    }

    setLoginIdCheck({
      status: 'checking',
      message: '아이디 중복 확인 중입니다.',
    })

    try {
      const response = await checkLoginId(trimmedLoginId)
      const { available, message } = getAvailability(response)

      setLoginIdCheck({
        status: available ? 'available' : 'unavailable',
        message: message || (available
          ? '사용 가능한 아이디입니다.'
          : '사용할 수 없는 아이디입니다.'),
      })
    } catch (error) {
      setLoginIdCheck({
        status: 'unavailable',
        message: normalizeApiError(error).message,
      })
    }
  }

  async function handleNicknameCheck() {
    const trimmedNickname = nickname.trim()
    const validationMessage = validateNickname(trimmedNickname)

    if (validationMessage) {
      setNicknameCheck({
        status: 'unavailable',
        message: validationMessage,
      })
      return
    }

    setNicknameCheck({
      status: 'checking',
      message: '닉네임 중복 확인 중입니다.',
    })

    try {
      const response = await checkNickname(trimmedNickname)
      const { available, message } = getAvailability(response)

      setNicknameCheck({
        status: available ? 'available' : 'unavailable',
        message: message || (available
          ? '사용 가능한 닉네임입니다.'
          : '사용할 수 없는 닉네임입니다.'),
      })
    } catch (error) {
      setNicknameCheck({
        status: 'unavailable',
        message: normalizeApiError(error).message,
      })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const validationMessage = validateForm({
      loginId,
      email,
      password,
      passwordConfirm,
      nickname,
      loginIdCheckStatus: loginIdCheck.status,
      nicknameCheckStatus: nicknameCheck.status,
    })

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setIsSubmitting(true)

    try {
      await signup({
        loginId: loginId.trim(),
        password,
        passwordConfirm,
        email: email.trim(),
        nickname: nickname.trim(),
      })
      navigate('/login', {
        replace: true,
        state: {
          signupMessage: '회원가입이 완료되었습니다. 아이디로 로그인해주세요.',
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
            <p>아이디 기반 너만고 시연용 계정을 생성합니다.</p>
          </div>
          <span className="auth-off">Guest</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            아이디
            <div className="input-with-button">
              <input
                autoComplete="username"
                disabled={isSubmitting}
                onChange={handleLoginIdChange}
                placeholder="tester01"
                type="text"
                value={loginId}
              />
              <button
                disabled={isSubmitting || loginIdCheck.status === 'checking'}
                onClick={handleLoginIdCheck}
                type="button"
              >
                중복 확인
              </button>
            </div>
            {loginIdCheck.message ? (
              <span className={`form-help ${loginIdCheck.status}`}>
                {loginIdCheck.message}
              </span>
            ) : null}
          </label>

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
              placeholder="8~16자, 공백과 한글 제외"
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
            <div className="input-with-button">
              <input
                autoComplete="nickname"
                disabled={isSubmitting}
                onChange={handleNicknameChange}
                placeholder="tester"
                type="text"
                value={nickname}
              />
              <button
                disabled={isSubmitting || nicknameCheck.status === 'checking'}
                onClick={handleNicknameCheck}
                type="button"
              >
                중복 확인
              </button>
            </div>
            {nicknameCheck.message ? (
              <span className={`form-help ${nicknameCheck.status}`}>
                {nicknameCheck.message}
              </span>
            ) : null}
          </label>

          <div className="login-actions">
            <button disabled={isSubmitting || isChecking} type="submit">
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
