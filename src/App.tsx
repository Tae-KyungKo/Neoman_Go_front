import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import TeamFindPage from './pages/TeamFindPage';
import TeamCreatePage from './pages/TeamCreatePage';
import TeamDetailPage from './pages/TeamDetailPage';
import TeamSettingsPage from './pages/TeamSettingsPage';
import AdminNoticePage from './pages/AdminNoticePage';
import ForbiddenPage from './pages/ForbiddenPage';
import BoardListPage from './pages/BoardListPage';
import BoardWritePage from './pages/BoardWritePage';
import PostDetailPage from './pages/PostDetailPage';
import MyInfoPage from './pages/MyInfoPage';
import MyTeamPage from './pages/MyTeamPage';
import NotificationsPage from './pages/NotificationsPage';
import FormationPage from './pages/FormationPage';
import AdminConsolePage from './pages/AdminConsolePage';
import TeamManagePage from './pages/TeamManagePage';
import TeamLeavePage from './pages/TeamLeavePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NoticeListPage from './pages/NoticeListPage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="/teams" element={<TeamFindPage />} />
          <Route path="/teams/new" element={<TeamCreatePage />} />
          <Route path="/teams/:teamId" element={<TeamDetailPage />} />
          <Route path="/teams/:teamId/settings" element={<TeamSettingsPage />} />
          <Route path="/teams/:teamId/formation/:sport" element={<FormationPage />} />
          <Route path="/mypage" element={<Navigate to="/mypage/info" replace />} />
          <Route path="/mypage/info" element={<MyInfoPage />} />
          <Route path="/mypage/teams" element={<MyTeamPage />} />
          <Route path="/mypage/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={<AdminConsolePage />} />
          <Route path="/admin/notices" element={<AdminNoticePage />} />
          <Route path="/teams/:teamId/manage" element={<TeamManagePage />} />
          <Route path="/teams/:teamId/leave" element={<TeamLeavePage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/board" element={<BoardListPage />} />
          <Route path="/board/new" element={<BoardWritePage />} />
          <Route path="/board/:postId/edit" element={<BoardWritePage />} />
          <Route path="/board/:postId" element={<PostDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/notices" element={<NoticeListPage />} />
          <Route path="/notices/:id" element={<NoticeDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
