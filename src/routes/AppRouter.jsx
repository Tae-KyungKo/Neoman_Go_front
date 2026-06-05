import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getCurrentUser } from '../api/userApi'
import AdminLayout from '../layouts/AdminLayout'
import CategoryLayout from '../layouts/CategoryLayout'
import MainLayout from '../layouts/MainLayout'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import CategoryHomePage from '../pages/CategoryHomePage'
import DevPage from '../pages/DevPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import PlaceholderPage from '../pages/PlaceholderPage'
import AdminRoute from './AdminRoute'
import ProtectedRoute from './ProtectedRoute'

function createInitialUser() {
  const accessToken = localStorage.getItem('accessToken') ?? ''

  return {
    isLoggedIn: Boolean(accessToken),
    accessToken,
    email: '',
  }
}

function AppRouter() {
  const [currentUser, setCurrentUser] = useState(createInitialUser)

  useEffect(() => {
    if (!currentUser.accessToken || currentUser.id) {
      return
    }

    let ignore = false

    async function loadCurrentUser() {
      try {
        const response = await getCurrentUser()
        const me = response?.data?.data

        if (ignore || !me) {
          return
        }

        setCurrentUser((user) => {
          if (user.accessToken !== currentUser.accessToken) {
            return user
          }

          return {
            ...user,
            isLoggedIn: true,
            id: me.id,
            email: user.email || me.email,
            nickname: me.nickname,
            role: me.role,
            status: me.status,
          }
        })
      } catch {
        // TODO(Phase 7.5-2): 인증 상태 표준화 시 토큰 만료/사용자 조회 실패 처리를 정리한다.
      }
    }

    loadCurrentUser()

    return () => {
      ignore = true
    }
  }, [currentUser.accessToken, currentUser.id])

  function handleLogout() {
    localStorage.removeItem('accessToken')
    setCurrentUser({
      isLoggedIn: false,
      accessToken: '',
      email: '',
    })
  }

  const routeContext = {
    currentUser,
    setCurrentUser,
    onLogout: handleLogout,
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout {...routeContext} />}>
          <Route index element={<HomePage />} />
          <Route
            path="login"
            element={
              <LoginPage
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          />
          <Route path="signup" element={<PlaceholderPage title="Signup" />} />
          <Route path="notices" element={<PlaceholderPage title="Notices" />} />
          <Route
            path="notices/:noticeId"
            element={<PlaceholderPage title="Notice Detail" />}
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <PlaceholderPage title="Notifications" />
              </ProtectedRoute>
            }
          />
          <Route
            path="me"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <PlaceholderPage title="My Page" />
              </ProtectedRoute>
            }
          />
          <Route path="c/:categoryCode" element={<CategoryLayout />}>
            <Route index element={<CategoryHomePage />} />
            <Route path="teams" element={<PlaceholderPage title="Teams" />} />
            <Route
              path="teams/new"
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <PlaceholderPage title="Create Team" />
                </ProtectedRoute>
              }
            />
            <Route
              path="teams/:teamId"
              element={<PlaceholderPage title="Team Detail" />}
            />
            <Route path="board" element={<PlaceholderPage title="Board" />} />
            <Route
              path="posts/:postId"
              element={<PlaceholderPage title="Post Detail" />}
            />
            <Route
              path="matches"
              element={<PlaceholderPage title="Matches Preparing" />}
            />
          </Route>
          <Route
            path="admin"
            element={
              <AdminRoute currentUser={currentUser}>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route
              path="notices"
              element={<PlaceholderPage title="Admin Notices" />}
            />
          </Route>
          <Route path="dev" element={<DevPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
