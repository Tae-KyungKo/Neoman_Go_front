# Phase 10-1 Frontend Component Inventory

## 컴포넌트 구조 요약

- Page: `src/pages/**`
- Layout: `src/layouts/**`, `src/components/layout/**`
- Domain Component: 팀, 게시판, 공지, 알림 패널류
- Auth: `AuthContext`, `ProtectedRoute`, `AdminRoute`, `LoginPanel`
- Notification: notification components + SSE hook
- Dev/Debug: `DevPage`, `LegacyDevApp`, `ActionLogPanel`
- UI Primitive 전용 Button/Input/Modal/Card 컴포넌트는 확인되지 않았다. 현재는 페이지/도메인 컴포넌트 내부에서 HTML 요소와 CSS class를 직접 사용한다.

| Component | Source | Type | Used By | API Call | Navigation | Reusability | Issue | Phase 10 Plan | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| `App` | `src/App.jsx` | Utility | `main.jsx` | 없음 | 없음 | 단일 entry | 문제 없음 | 현재 유지 | `src/App.jsx:2` |
| `AppRouter` | `src/routes/AppRouter.jsx` | Utility/Router | `App` | 없음 | Route 선언 | 단일 | 라우트와 AuthProvider 결합 | 현재 유지, route policy 문서화 | `src/routes/AppRouter.jsx:25` |
| `ProtectedRoute` | `src/routes/ProtectedRoute.jsx` | Auth | protected route children | 없음 | `/login` redirect | 공통 | search/hash 보존 확인 필요 | Phase 10 개선 | `src/routes/ProtectedRoute.jsx:18` |
| `AdminRoute` | `src/routes/AdminRoute.jsx` | Auth | `/admin/**` | 없음 | `/login` redirect | 공통 | 관리자 권한 기준은 currentUser role 의존 | 현재 유지, role mapping 검증 | `src/routes/AdminRoute.jsx:18` |
| `AuthProvider` | `src/auth/AuthContext.jsx` | Auth | `AppRouter` | login/reissue/me | 없음 | 전역 | localStorage refresh token, reissue 큐 없음 | P0/P1 검토 | `src/auth/AuthContext.jsx:74` |
| `MainLayout` | `src/layouts/MainLayout.jsx` | Layout | all public tree | SSE hook | Outlet | 공통 | SSE가 layout 전역에서 연결됨 | 현재 유지, 중복 연결 검증 | `src/routes/AppRouter.jsx:30` |
| `CategoryLayout` | `src/layouts/CategoryLayout.jsx` | Layout | `/c/:categoryCode/**` | 없음 | category nav links | category routes | categoryCode 유효성 UI만 확인 | Phase 10 개선 | `src/layouts/CategoryLayout.jsx:1` |
| `AdminLayout` | `src/layouts/AdminLayout.jsx` | Layout | `/admin/**` | 없음 | admin nav links | admin routes | 관리자 메뉴 최소 | 현재 유지 | `src/layouts/AdminLayout.jsx:1` |
| `Header` | `src/components/layout/Header.jsx` | Layout | `MainLayout` | 없음 | logout 후 `/` | 공통 | logout API 미호출 | Phase 10 개선 | `src/components/layout/Header.jsx:11` |
| `MainNavigation` | `src/components/layout/MainNavigation.jsx` | Layout | `Header` | 없음 | fixed nav links | 공통 | 카테고리 하드코딩 링크 존재 | Phase 10 개선 | `src/components/layout/MainNavigation.jsx:10` |
| `HomePage` | `src/pages/HomePage.jsx` | Page | `/` | 없음 | category/notices/notifications links | 단일 | 운영 홈으로는 최소 | Phase 10 재설계 대상 | `src/pages/HomePage.jsx:4` |
| `LoginPage` | `src/pages/LoginPage.jsx` | Page/Auth | `/login` | through `LoginPanel`/AuthContext | redirect after login | 단일 | ActionLogPanel 노출 | Phase 10 UI 개선 | `src/pages/LoginPage.jsx:20` |
| `SignupPage` | `src/pages/SignupPage.jsx` | Page/Form | `/signup` | signup/check APIs 직접 호출 | `/login` after signup | 단일 | 비대한 page form | Phase 10 Form 분리 후보 | `src/pages/SignupPage.jsx:105` |
| `PlaceholderPage` | `src/pages/PlaceholderPage.jsx` | Page | `/me` | 없음 | 없음 | 단일 | 고립 placeholder | Phase 10 범위 결정 | `src/pages/PlaceholderPage.jsx:1` |
| `CategoryHomePage` | `src/pages/CategoryHomePage.jsx` | Page | `/c/:categoryCode` | 없음 | category child links | 단일 | matches 보류 링크 노출 | 현재 유지/문구 개선 | `src/pages/CategoryHomePage.jsx:4` |
| `CategoryPlaceholderPage` | `src/pages/CategoryPlaceholderPage.jsx` | Page | `/c/:categoryCode/matches` | 없음 | 없음 | 보류 페이지 | 매치 기능 Phase 10 제외 | Phase 10 제외 표시 유지 | `src/pages/CategoryPlaceholderPage.jsx:30` |
| `TeamListPage` | `src/pages/teams/TeamListPage.jsx` | Page | team list route | through `TeamListPanel` | team detail/create/login | 단일 | ActionLogPanel 노출 | Phase 10 UI 개선 | `src/pages/teams/TeamListPage.jsx:8` |
| `TeamCreatePage` | `src/pages/teams/TeamCreatePage.jsx` | Page | team create route | through `TeamCreatePanel` | created detail/back | 단일 | ActionLogPanel 노출 | Phase 10 UI 개선 | `src/pages/teams/TeamCreatePage.jsx:8` |
| `TeamDetailRoute` | `src/pages/teams/TeamDetailRoute.jsx` | Utility | route wrapper | 없음 | 없음 | route remount key | 문제 없음 | 현재 유지 | `src/pages/teams/TeamDetailRoute.jsx:4` |
| `TeamDetailPage` | `src/pages/teams/TeamDetailPage.jsx` | Page | team detail route | through child panels | list after delete/leave | 복합 page | 여러 domain panels orchestration | 유지하되 상태 분리 검토 | `src/pages/teams/TeamDetailPage.jsx:12` |
| `TeamListPanel` | `src/components/TeamListPanel.jsx` | Domain Component | `TeamListPage`, legacy | `getTeams` | select callback | 재사용 | pageInfo 보유, UI/데이터 결합 | 현재 유지, query state 개선 | `src/components/TeamListPanel.jsx:23` |
| `TeamCreatePanel` | `src/components/TeamCreatePanel.jsx` | Form/Domain | `TeamCreatePage`, legacy | `createTeam` | callback only | 재사용 | form primitive 없음 | Phase 10 Form 공통화 후보 | `src/components/TeamCreatePanel.jsx:8` |
| `TeamDetailPanel` | `src/components/TeamDetailPanel.jsx` | Domain Component | `TeamDetailPage`, legacy | `getTeam` | 없음 | 재사용 | 상세 표시와 fetch 결합 | 현재 유지 | `src/components/TeamDetailPanel.jsx:19` |
| `TeamApplicationPanel` | `src/components/TeamApplicationPanel.jsx` | Domain/Form | `TeamDetailPage`, legacy | `applyToTeam` | 없음 | 재사용 | 중복 신청 최종 방어는 backend 의존 | 현재 유지 | `src/components/TeamApplicationPanel.jsx:8` |
| `MyTeamApplicationsPanel` | `src/components/MyTeamApplicationsPanel.jsx` | Domain Component | `TeamDetailPage`, legacy | `getMyApplications`, `cancelApplication` | 없음 | 재사용 | 팀 상세에서 내 전체 신청을 조회 | Phase 10 UX 범위 결정 | `src/components/MyTeamApplicationsPanel.jsx:20` |
| `OwnerTeamApplicationsPanel` | `src/components/OwnerTeamApplicationsPanel.jsx` | Domain Component | `TeamDetailPage`, legacy | owner application APIs | 없음 | 재사용 | 승인 동시성은 backend 책임 | 현재 유지 | `src/components/OwnerTeamApplicationsPanel.jsx:24` |
| `TeamMemberManagementPanel` | `src/components/TeamMemberManagementPanel.jsx` | Domain Component | `TeamDetailPage`, legacy | member APIs | 없음 | 재사용 | 가장 비대한 domain component 후보 | Phase 10 중 분리 검토 | `src/components/TeamMemberManagementPanel.jsx:25` |
| `BoardListPage` | `src/pages/board/BoardListPage.jsx` | Page | board route | through child panels | post detail | 단일 | create/list same page | 현재 유지 | `src/pages/board/BoardListPage.jsx:9` |
| `PostDetailRoute` | `src/pages/board/PostDetailRoute.jsx` | Utility | route wrapper | 없음 | 없음 | route remount key | 문제 없음 | 현재 유지 | `src/pages/board/PostDetailRoute.jsx:4` |
| `PostDetailPage` | `src/pages/board/PostDetailPage.jsx` | Page | post detail route | through `PostDetailPanel` | board back/delete | 단일 | ActionLogPanel 노출 | Phase 10 UI 개선 | `src/pages/board/PostDetailPage.jsx:8` |
| `PostListPanel` | `src/components/PostListPanel.jsx` | Domain Component | `BoardListPage`, legacy | `getPosts` | select callback | 재사용 | list fetch 내부화 | 현재 유지 | `src/components/PostListPanel.jsx:23` |
| `PostCreatePanel` | `src/components/PostCreatePanel.jsx` | Form/Domain | `BoardListPage`, legacy | `createPost` | callback only | 재사용 | form primitive 없음 | Phase 10 Form 공통화 후보 | `src/components/PostCreatePanel.jsx:20` |
| `PostDetailPanel` | `src/components/PostDetailPanel.jsx` | Domain Component | `PostDetailPage`, legacy | post/comment APIs | callback only | 재사용 | 600+ lines, post/comment/edit/delete 결합 | P1 분리 후보 | `src/components/PostDetailPanel.jsx:70` |
| `NoticeListPage` | `src/pages/notices/NoticeListPage.jsx` | Page | `/notices` | through `NoticeListPanel` | notice detail/admin | 단일 | admin link 조건부 | 현재 유지 | `src/pages/notices/NoticeListPage.jsx:7` |
| `NoticeDetailRoute` | `src/pages/notices/NoticeDetailRoute.jsx` | Utility | route wrapper | 없음 | 없음 | route remount key | 문제 없음 | 현재 유지 | `src/pages/notices/NoticeDetailRoute.jsx:4` |
| `NoticeDetailPage` | `src/pages/notices/NoticeDetailPage.jsx` | Page | notice detail route | through `NoticeDetailPanel` | notices back | 단일 | ActionLogPanel 노출 | Phase 10 UI 개선 | `src/pages/notices/NoticeDetailPage.jsx:7` |
| `AdminNoticePage` | `src/pages/admin/AdminNoticePage.jsx` | Page/Admin | `/admin/notices` | through notice panels | 없음 | 단일 | public/admin notice panels 공유 | 현재 유지 | `src/pages/admin/AdminNoticePage.jsx:9` |
| `AdminDashboardPage` | `src/pages/AdminDashboardPage.jsx` | Page/Admin | `/admin` | 없음 | 없음 | 단일 | 최소 placeholder | Phase 10 범위 결정 | `src/pages/AdminDashboardPage.jsx:1` |
| `NoticeListPanel` | `src/components/NoticeListPanel.jsx` | Domain Component | notice pages/admin/legacy | `getNotices` | select callback | 재사용 | public/admin 재사용 | 현재 유지 | `src/components/NoticeListPanel.jsx:19` |
| `NoticeCreatePanel` | `src/components/NoticeCreatePanel.jsx` | Form/Admin | admin notice/legacy | `createNotice` | 없음 | 재사용 | explicit accessToken header | 현재 유지, auth 방식 통일 검토 | `src/components/NoticeCreatePanel.jsx:8` |
| `NoticeDetailPanel` | `src/components/NoticeDetailPanel.jsx` | Domain/Admin | notice detail/admin/legacy | notice get/update/delete | 없음 | 재사용 | public detail + admin edit 혼재 | Phase 10 권한별 UI 정리 | `src/components/NoticeDetailPanel.jsx:19` |
| `NotificationPage` | `src/pages/notifications/NotificationPage.jsx` | Page/Notification | `/notifications` | notification APIs | target navigation hook | 단일 | DTO fallback 다수 | 현재 유지, DTO 정리 | `src/pages/notifications/NotificationPage.jsx:41` |
| `NotificationList` | `src/pages/notifications/NotificationList.jsx` | Notification | `NotificationPage` | 없음 | callback | 단일 | pages 하위 component | 현재 유지 또는 components 이동 검토 | `src/pages/notifications/NotificationList.jsx:3` |
| `NotificationItem` | `src/pages/notifications/NotificationItem.jsx` | Notification | `NotificationList` | 없음 | callback | 단일 | target label 문구 mojibake 가능 | Phase 10 문구 정리 | `src/pages/notifications/NotificationItem.jsx:19` |
| `NotificationBell` | `src/components/notifications/NotificationBell.jsx` | Notification | `Header` | `getUnreadNotificationCount` | `/notifications` link | 공통 | header에서 unread polling/event refresh | 현재 유지 | `src/components/notifications/NotificationBell.jsx:18` |
| `RealtimeNotificationToast` | `src/components/notifications/RealtimeNotificationToast.jsx` | Notification | `MainLayout` | 없음 | 없음 | 공통 | toast action 없음 | Phase 10 UX 결정 | `src/components/notifications/RealtimeNotificationToast.jsx:3` |
| `SseStatusBadge` | `src/components/notifications/SseStatusBadge.jsx` | Notification/Debug | `MainLayout` | 없음 | 없음 | 공통 | 운영 노출 여부 검토 필요 | P1/P2 결정 | `src/components/notifications/SseStatusBadge.jsx:9` |
| `LoginPanel` | `src/components/LoginPanel.jsx` | Auth/Form | `LoginPage`, legacy | direct `login` fallback | 없음 | 재사용 | AuthContext와 토큰 저장 로직 중복 | P1 정리 | `src/components/LoginPanel.jsx:34` |
| `ActionLogPanel` | `src/components/ActionLogPanel.jsx` | Dev/Debug | many pages | 없음 | 없음 | 재사용 | 운영 화면에 action logs 노출 | P0/P1 정책 결정 | `src/components/ActionLogPanel.jsx:13` |
| `CategorySelector` | `src/components/CategorySelector.jsx` | UI/Domain | legacy 확인 | 없음 | 없음 | 제한적 | AppRouter 현행 pages 사용 확인 필요 | 미사용 후보 | `src/components/CategorySelector.jsx:3` |
| `BoardPanel` | `src/components/BoardPanel.jsx` | Domain/Legacy | `LegacyDevApp` 후보 | child APIs | 없음 | legacy | 현행 route page 미사용 후보 | Phase 10 제외/보관 결정 | `src/components/BoardPanel.jsx:6` |
| `NoticePanel` | `src/components/NoticePanel.jsx` | Domain/Legacy | `LegacyDevApp` 후보 | child APIs | 없음 | legacy | 현행 route page 미사용 후보 | Phase 10 제외/보관 결정 | `src/components/NoticePanel.jsx:6` |
| `DevPage` | `src/pages/DevPage.jsx` | Dev/Debug | registered route 없음 | through legacy | 없음 | dev only | 미등록 | 현재 유지, 삭제 금지 | `src/pages/DevPage.jsx:9` |
| `LegacyDevApp` | `src/legacy/LegacyDevApp.jsx` | Dev/Debug | `DevPage` | many child panels | internal state | legacy only | 미등록이지만 보관 | Phase 10 제외 | `src/legacy/LegacyDevApp.jsx:1` |

## 공통 Button/Input/Modal/Card 존재 여부

- 전용 `Button`, `Input`, `Modal`, `Card` 컴포넌트 파일은 확인되지 않았다.
- `.button-link`, `login-form`, `post-form` 등 CSS class 기반으로 각 컴포넌트 내부에서 HTML을 직접 작성한다.
- TeamCard/PostCard/NoticeCard 같은 domain card 컴포넌트는 별도 확인되지 않았고, list panel 내부 markup으로 존재한다.

## 비슷한 컴포넌트 중복

- `TeamListPanel`, `PostListPanel`, `NoticeListPanel`은 pagination/loading/error/list pattern이 유사하지만 도메인 필드와 entry action이 다르다. 무조건 범용 Card 통합보다는 list state/loading/error 처리 공통화가 우선이다.
- `PostCreatePanel`, `TeamCreatePanel`, `NoticeCreatePanel`, `SignupPage`, `LoginPanel`은 form state/validation/submitting 패턴이 반복된다.
- `NoticeDetailPanel`과 `PostDetailPanel`은 detail/edit/delete 패턴이 유사하나 권한/도메인 필드가 달라 domain component로 유지하는 편이 안전하다.

## Domain Component와 UI Primitive 혼재

- 도메인 패널 내부에 form field, button, loading, empty, error UI가 직접 들어 있다.
- Phase 10에서 먼저 공통 `FormField`, `StatusMessage`, `Confirm` 수준의 primitive 후보를 분리할 수 있다. 단, 이번 단계에서는 구현하지 않는다.

## 컴포넌트 내부 API 직접 호출

- 대부분의 도메인 패널이 API를 직접 호출한다. 예: `TeamListPanel`, `PostDetailPanel`, `NoticeDetailPanel`, `NotificationBell`.
- Page는 route orchestration과 callback wiring을 담당한다. 이 구조는 현재 작은 규모에서는 동작하지만 Phase 10 UI 확장 시 data fetching hook 분리를 검토할 수 있다.

## 비대해진 페이지/컴포넌트

- `PostDetailPanel`은 post detail, post edit/delete, comment list/create/edit/delete를 모두 포함한다.
- `TeamMemberManagementPanel`은 member list, leave, kick, owner delegation을 모두 포함한다.
- `SignupPage`는 validation, duplicate check, submit UI를 모두 포함한다.

## 사용되지 않는 컴포넌트 후보

- `DevPage`, `LegacyDevApp`, `BoardPanel`, `NoticePanel`, `CategorySelector`, `getTeamsByCategory`는 현행 `AppRouter` 기준 운영 route에서 직접 사용 확인이 필요하거나 미사용 후보이다.
- 삭제 금지. Phase 10에서 유지/보관/제거 정책을 별도 결정해야 한다.

## Dev/Debug 컴포넌트

- `ActionLogPanel`은 운영 route page에서도 렌더링된다.
- `SseStatusBadge`도 `MainLayout`에 있다면 운영 화면 노출 가능성이 있다. 실제 UX 정책 결정 필요.
- `DevPage`/`LegacyDevApp`은 route 미등록이라 직접 노출은 확인되지 않는다.

## 페이지별 CSS 중복 및 전역 CSS 충돌 가능성

- `src/App.css`와 `src/index.css` 전역 CSS 구조로 보인다.
- page/domain별 CSS module이나 scoped style은 확인되지 않았다.
- Phase 10에서 PC 웹 UI를 재구성할 때 전역 class 충돌, 레거시 class 재사용, form/list spacing 중복을 점검해야 한다.
