# Phase 10-1 Frontend Route Inventory

## 조사 기준

- Frontend repo: `C:\Users\ktg02\myProject\neomango_front`
- Backend repo(read-only): `C:\Users\ktg02\myProject\neomango`
- Router entry는 `src/App.jsx`가 `AppRouter`를 렌더링하고, 실제 라우트는 `src/routes/AppRouter.jsx`의 `BrowserRouter` + `Routes` 구조에 등록되어 있다.
- `createBrowserRouter`, `useRoutes`, `window.location` 사용은 확인되지 않았다.

## 등록된 Route 전체 목록

| Route | Page Component | Source | Access | Guard | Entry Point | Parameters | APIs | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| `/` | `HomePage` | `src/pages/HomePage.jsx` | Public | 없음 | Header brand, MainNavigation, NotFound redirect | 없음 | 없음 | 운영 | `src/routes/AppRouter.jsx:31`, `src/components/layout/Header.jsx:19`, `src/components/layout/MainNavigation.jsx:6` |
| `/login` | `LoginPage` | `src/pages/LoginPage.jsx` | Guest/Public | 없음 | Header, ProtectedRoute/AdminRoute redirect, category/team create links | `state.from` | `POST /api/auth/login`, `GET /api/users/me` | 운영 | `src/routes/AppRouter.jsx:32`, `src/routes/ProtectedRoute.jsx:18`, `src/routes/AdminRoute.jsx:18`, `src/pages/LoginPage.jsx:63` |
| `/signup` | `SignupPage` | `src/pages/SignupPage.jsx` | Guest/Public | 없음 | Header, LoginPage | 없음 | `POST /api/auth/signup`, `GET /api/auth/check-login-id`, `GET /api/auth/check-nickname` | 운영 | `src/routes/AppRouter.jsx:33`, `src/components/layout/Header.jsx:42`, `src/pages/LoginPage.jsx:92` |
| `/notices` | `NoticeListPage` | `src/pages/notices/NoticeListPage.jsx` | Public | 없음 | MainNavigation, HomePage, NoticeDetailPage back link | 없음 | `GET /api/notices` | 운영 | `src/routes/AppRouter.jsx:34`, `src/components/layout/MainNavigation.jsx:9`, `src/pages/HomePage.jsx:28` |
| `/notices/:noticeId` | `NoticeDetailRoute` -> `NoticeDetailPage` | `src/pages/notices/NoticeDetailRoute.jsx`, `src/pages/notices/NoticeDetailPage.jsx` | Public | 없음 | NoticeListPage item click | `noticeId` | `GET /api/notices/{noticeId}` | 운영 | `src/routes/AppRouter.jsx:35`, `src/pages/notices/NoticeListPage.jsx:13`, `src/pages/notices/NoticeDetailRoute.jsx:4` |
| `/notifications` | `NotificationPage` | `src/pages/notifications/NotificationPage.jsx` | Authenticated | `ProtectedRoute` | HomePage, NotificationBell | 없음 | `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all` | 운영 | `src/routes/AppRouter.jsx:39`, `src/pages/HomePage.jsx:29`, `src/components/notifications/NotificationBell.jsx:76` |
| `/me` | `PlaceholderPage title="My Page"` | `src/pages/PlaceholderPage.jsx` | Authenticated | `ProtectedRoute` | 확인 필요 | 없음 | 없음 | 고립 | `src/routes/AppRouter.jsx:47` |
| `/c/:categoryCode` | `CategoryHomePage` | `src/pages/CategoryHomePage.jsx` | Public | 없음 | MainNavigation category links, HomePage category links | `categoryCode` | 없음 | 운영 | `src/routes/AppRouter.jsx:55`, `src/components/layout/MainNavigation.jsx:10`, `src/pages/HomePage.jsx:16` |
| `/c/:categoryCode/teams` | `TeamListPage` | `src/pages/teams/TeamListPage.jsx` | Public | 없음 | CategoryLayout, CategoryHomePage | `categoryCode` | `GET /api/teams?category=...` | 운영 | `src/routes/AppRouter.jsx:57`, `src/layouts/CategoryLayout.jsx:47`, `src/pages/CategoryHomePage.jsx:15` |
| `/c/:categoryCode/teams/new` | `TeamCreatePage` | `src/pages/teams/TeamCreatePage.jsx` | Authenticated | `ProtectedRoute` | TeamListPage, CategoryHomePage | `categoryCode` | `POST /api/teams` | 운영 | `src/routes/AppRouter.jsx:61`, `src/pages/teams/TeamListPage.jsx:31`, `src/pages/CategoryHomePage.jsx:17` |
| `/c/:categoryCode/teams/:teamId` | `TeamDetailRoute` -> `TeamDetailPage` | `src/pages/teams/TeamDetailRoute.jsx`, `src/pages/teams/TeamDetailPage.jsx` | Public with authenticated sub-actions | 없음 | TeamListPage, TeamCreatePage, notification navigation | `categoryCode`, `teamId` | Team detail/application/member APIs | 운영 | `src/routes/AppRouter.jsx:69`, `src/pages/teams/TeamListPage.jsx:18`, `src/hooks/useNotificationNavigation.js:57` |
| `/c/:categoryCode/board` | `BoardListPage` | `src/pages/board/BoardListPage.jsx` | Public with authenticated create | 없음 | CategoryLayout, CategoryHomePage, PostDetailPage back link | `categoryCode` | `GET /api/categories/{category}/posts`, `POST /api/categories/{category}/posts` | 운영 | `src/routes/AppRouter.jsx:73`, `src/layouts/CategoryLayout.jsx:48`, `src/pages/CategoryHomePage.jsx:23` |
| `/c/:categoryCode/posts/:postId` | `PostDetailRoute` -> `PostDetailPage` | `src/pages/board/PostDetailRoute.jsx`, `src/pages/board/PostDetailPage.jsx` | Public with authenticated sub-actions | 없음 | BoardListPage, notification navigation | `categoryCode`, `postId` | Post detail/update/delete, comment APIs | 운영 | `src/routes/AppRouter.jsx:77`, `src/pages/board/BoardListPage.jsx:29`, `src/hooks/useNotificationNavigation.js:71` |
| `/c/:categoryCode/matches` | `CategoryPlaceholderPage type="matches"` | `src/pages/CategoryPlaceholderPage.jsx` | Public | 없음 | CategoryLayout, CategoryHomePage | `categoryCode` | 없음 | 보류 | `src/routes/AppRouter.jsx:81`, `src/layouts/CategoryLayout.jsx:49`, `src/pages/CategoryHomePage.jsx:24` |
| `/admin` | `AdminRoute` -> `AdminLayout` -> `AdminDashboardPage` | `src/pages/AdminDashboardPage.jsx`, `src/layouts/AdminLayout.jsx` | Admin | `AdminRoute` | MainNavigation, AdminLayout index link | 없음 | 없음 | 운영 | `src/routes/AppRouter.jsx:86`, `src/components/layout/MainNavigation.jsx:12`, `src/layouts/AdminLayout.jsx:14` |
| `/admin/notices` | `AdminNoticePage` | `src/pages/admin/AdminNoticePage.jsx` | Admin | parent `AdminRoute` | AdminLayout, NoticeListPage admin link | 없음 | public notice list/detail + admin notice CUD APIs | 운영 | `src/routes/AppRouter.jsx:95`, `src/layouts/AdminLayout.jsx:17`, `src/pages/notices/NoticeListPage.jsx:26` |
| `*` | `Navigate to="/" replace` | `src/routes/AppRouter.jsx` | Public | 없음 | browser deep link miss | 없음 | 없음 | 운영 | `src/routes/AppRouter.jsx:100` |

## Route는 있으나 사용자 진입 링크가 없는 페이지

- `/me`: `ProtectedRoute`로 등록되어 있으나 `rg` 기준 `to="/me"` 또는 `navigate('/me')` 진입 링크가 확인되지 않는다. 상태는 `고립`.
- `src/pages/DevPage.jsx`는 존재하지만 `AppRouter`에 등록되어 있지 않다. 운영 Route 노출은 확인되지 않으며, 레거시 개발 UI 보관 파일로 분류한다.

## 링크는 있으나 Route가 없는 경로

- `rg`로 확인한 `Link`, `NavLink`, `navigate()` 대상 중 등록 Route가 없는 명확한 사용자 링크는 확인되지 않았다.
- 알림 대상 이동은 런타임 데이터 기반이다. `TEAM`은 `/c/{team.category}/teams/{targetId}`, `POST`는 `/c/{post.category}/posts/{targetId}`로 이동한다. 이때 `targetId`로 API 상세 조회를 먼저 수행해 category를 얻는다. 근거: `src/hooks/useNotificationNavigation.js:57`, `src/hooks/useNotificationNavigation.js:71`.

## Dev/Debug Route

- 등록된 Dev/Debug Route는 없다.
- Dev/Debug 성격 파일은 존재한다: `src/pages/DevPage.jsx`, `src/legacy/LegacyDevApp.jsx`, `src/components/ActionLogPanel.jsx`.
- `ActionLogPanel`은 현재 로그인/팀/게시판/공지 화면에서도 사용되므로 단순 삭제 대상이 아니라 운영 UI에 노출된 디버그성 컴포넌트 후보로 분류한다.

## Not Found 처리

- 모든 미등록 경로는 `Navigate to="/" replace`로 홈으로 이동한다. 근거: `src/routes/AppRouter.jsx:100`.
- 404 전용 페이지나 잘못된 deep link 안내는 없다. Phase 10에서 사용자 경험 개선 대상으로 분류한다.

## 로그인 후 redirect 처리

- `ProtectedRoute`와 `AdminRoute`는 인증/권한 실패 시 `state={{ from: location }}`을 포함해 `/login`으로 보낸다. 근거: `src/routes/ProtectedRoute.jsx:18`, `src/routes/AdminRoute.jsx:18`.
- `LoginPage`는 `location.state?.from?.pathname ?? '/'`로 로그인 후 이동한다. 근거: `src/pages/LoginPage.jsx:24`, `src/pages/LoginPage.jsx:65`.
- query/hash 보존 여부는 코드상 확인되지 않는다. `pathname`만 사용하므로 search/hash 손실 가능성이 있다.

## 브라우저 새로고침/Deep Link 관련 구조

- Vite SPA 라우팅은 `BrowserRouter` 기반이다. 정적 서버/Nginx fallback 설정은 프론트 저장소만으로는 확인 필요.
- 프론트 코드에는 `createHashRouter`나 hash fallback이 없다.
- 인증 deep link는 `AuthProvider` 초기화 시 localStorage access token을 `GET /api/users/me`로 복원한다. 근거: `src/auth/AuthContext.jsx:211`.
