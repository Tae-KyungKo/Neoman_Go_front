import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import AdminLayout from '../layouts/AdminLayout'
import CategoryLayout from '../layouts/CategoryLayout'
import MainLayout from '../layouts/MainLayout'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import AdminNoticePage from '../pages/admin/AdminNoticePage'
import BoardListPage from '../pages/board/BoardListPage'
import PostDetailRoute from '../pages/board/PostDetailRoute'
import CategoryHomePage from '../pages/CategoryHomePage'
import CategoryPlaceholderPage from '../pages/CategoryPlaceholderPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NoticeDetailRoute from '../pages/notices/NoticeDetailRoute'
import NoticeListPage from '../pages/notices/NoticeListPage'
import NotificationPage from '../pages/notifications/NotificationPage'
import PlaceholderPage from '../pages/PlaceholderPage'
import SignupPage from '../pages/SignupPage'
import TeamCreatePage from '../pages/teams/TeamCreatePage'
import TeamDetailRoute from '../pages/teams/TeamDetailRoute'
import TeamListPage from '../pages/teams/TeamListPage'
import AdminRoute from './AdminRoute'
import ProtectedRoute from './ProtectedRoute'

function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="notices" element={<NoticeListPage />} />
            <Route
              path="notices/:noticeId"
              element={<NoticeDetailRoute />}
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <NotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="me"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="My Page" />
                </ProtectedRoute>
              }
            />
            <Route path="c/:categoryCode" element={<CategoryLayout />}>
              <Route index element={<CategoryHomePage />} />
              <Route
                path="teams"
                element={<TeamListPage />}
              />
              <Route
                path="teams/new"
                element={
                  <ProtectedRoute>
                    <TeamCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teams/:teamId"
                element={<TeamDetailRoute />}
              />
              <Route
                path="board"
                element={<BoardListPage />}
              />
              <Route
                path="posts/:postId"
                element={<PostDetailRoute />}
              />
              <Route
                path="matches"
                element={<CategoryPlaceholderPage type="matches" />}
              />
            </Route>
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route
                path="notices"
                element={<AdminNoticePage />}
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRouter
