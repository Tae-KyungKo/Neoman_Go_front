# Phase 10-1 Frontend Gap Analysis

## P0 - Phase 10 UI 구현 전에 해결 필요

| Priority | Area | Finding | Evidence | Risk | Recommended Phase | Notes |
|---|---|---|---|---|---|---|
| P0 | Auth/Logout | Backend `POST /api/auth/logout`가 존재하지만 frontend logout은 서버 호출 없이 localStorage만 삭제한다. | frontend `src/auth/AuthContext.jsx:175`, `src/api/authApi.js:19`; backend `AuthController.java:61` | refresh token 서버 측 폐기 누락 가능성 | Phase 10-2 전 정책 결정 | API 활성화 여부와 refresh token 저장 정책을 함께 결정 |
| P0 | Dev/Debug UI | `ActionLogPanel`이 운영 route page들에 노출된다. | `src/pages/LoginPage.jsx:5`, `src/pages/teams/TeamListPage.jsx:4`, `src/pages/board/PostDetailPage.jsx:4` | 실제 운영 UI 품질 저하, 내부 로그 노출 | Phase 10 UI 구현 전 | 삭제가 아니라 운영/개발 표시 정책 결정 |
| P0 | Auth token storage | access/refresh token을 모두 localStorage에 저장한다. | `src/auth/AuthContext.jsx:50`, `src/auth/AuthContext.jsx:54`, `src/auth/AuthContext.jsx:70` | XSS 시 refresh token 탈취 위험 | Phase 10-2 전 보안 결정 | Backend Redis refresh token 구조와 함께 재검토 |
| P0 | NotFound/Deep Link | wildcard가 모든 미등록 경로를 홈으로 replace redirect한다. | `src/routes/AppRouter.jsx:100` | 잘못된 링크/운영 장애 탐지가 어려움 | Phase 10 UI 구현 전 | 404 page 또는 안내 정책 필요 |
| P0 | API contract TODO | `logout`, `closeTeam`, `deleteTeam` frontend 함수가 TODO reject 상태다. | `src/api/authApi.js:19`, `src/api/teamApi.js:21`, `src/api/teamApi.js:28`; backend endpoints exist | UI에서 기능을 연결하면 즉시 실패 | Phase 10-2 전 | 이번 단계에서는 수정 금지, 기능 범위 결정 필요 |

## P1 - Phase 10 UI 구현 과정에서 해결

| Priority | Area | Finding | Evidence | Risk | Recommended Phase | Notes |
|---|---|---|---|---|---|---|
| P1 | API 401 handling | axios response interceptor가 없어 일반 API 401 자동 reissue/원요청 재시도가 없다. | `src/api/client.js:18`, `src/api/client.js:32` | 토큰 만료 시 화면별 오류/로그아웃 불일치 | Phase 10 UI 구현 중 | reissue queue를 도입할지 UX만 정리할지 결정 |
| P1 | SSE reconnect policy | `fetchEventSource` retry 세부 설정과 heartbeat 처리가 없다. | `src/api/notificationStreamClient.js:23`, `src/api/notificationStreamClient.js:34` | 장애/idle timeout 상황에서 상태 표시 부정확 | Phase 10 UI 구현 중 | Backend heartbeat event 형식 확인 필요 |
| P1 | URL normalization | API/SSE base URL trailing slash 정규화가 없다. | `src/api/client.js:9`, `src/api/notificationStreamClient.js:23` | env 값 형식에 따라 `//api` 가능 | Phase 10 UI 구현 중 | small utility 후보 |
| P1 | Component size | `PostDetailPanel`, `TeamMemberManagementPanel`, `SignupPage`가 비대하다. | `src/components/PostDetailPanel.jsx:70`, `src/components/TeamMemberManagementPanel.jsx:25`, `src/pages/SignupPage.jsx:105` | Phase 10 UI 변경 시 회귀 위험 증가 | Phase 10 UI 구현 중 | 도메인 기능별 분리 검토 |
| P1 | Form primitives | 공통 Button/Input/FormField/Confirm/Modal 컴포넌트가 없다. | component inventory | UI 일관성 저하, validation UX 중복 | Phase 10 UI 구현 중 | 무리한 범용화보다 반복 form state부터 정리 |
| P1 | Admin auth UI | Admin guard와 UI 노출이 currentUser role에 의존한다. | `src/routes/AdminRoute.jsx`, `src/components/layout/MainNavigation.jsx:12` | 일반 사용자에게 관리자 링크 노출 가능성 | Phase 10 UI 구현 중 | link 표시와 route guard를 분리 관리 |
| P1 | DTO fallback | token/notification 응답을 여러 형태로 fallback 해석한다. | `src/auth/AuthContext.jsx:10`, `src/pages/notifications/NotificationPage.jsx:17` | 계약 변경 감지가 늦어짐 | Phase 10 UI 구현 중 | backend `ApiResponse<T>` 기준으로 정리 |
| P1 | Loading/Empty/Error | 각 panel별 로딩/오류 문구와 구조가 흩어져 있다. | `TeamListPanel`, `PostListPanel`, `NoticeListPanel` | 운영 UI 일관성 부족 | Phase 10 UI 구현 중 | 공통 상태 표시 primitive 후보 |
| P1 | Route access UX | `/me` placeholder는 route만 있고 사용자 진입 링크가 없다. | `src/routes/AppRouter.jsx:47` | 미완성 기능 노출/고립 | Phase 10 UI 구현 중 | My Page 범위 결정 |

## P2 - Phase 10 후반 품질 개선

| Priority | Area | Finding | Evidence | Risk | Recommended Phase | Notes |
|---|---|---|---|---|---|---|
| P2 | Accessibility | form/button/list 접근성은 전수 검증되지 않았다. | 확인 필요 | 키보드/스크린리더 UX 저하 | Phase 10 후반 | UI 구현 후 axe/manual 점검 |
| P2 | Skeleton | skeleton loading은 확인되지 않고 text loading 중심이다. | component inventory | perceived performance 낮음 | Phase 10 후반 | 핵심 목록부터 적용 |
| P2 | Lazy loading | route-level lazy loading이 없다. | `src/routes/AppRouter.jsx` static imports | 초기 bundle 증가 가능성 | Phase 10 후반 | build 분석 후 결정 |
| P2 | Test coverage | 프론트 테스트 구조는 확인되지 않았다. | package.json scripts에 test 없음 | UI 회귀 검증 부족 | Phase 10 후반 | 핵심 auth/API mapping 테스트 후보 |
| P2 | CSS scope | `App.css`, `index.css` 전역 스타일 중심이다. | `src/App.css`, `src/index.css` | Phase 10 대규모 UI 변경 시 class 충돌 | Phase 10 후반 | CSS module/design system 여부 결정 |

## Phase 10 제외

| Priority | Area | Finding | Evidence | Risk | Recommended Phase | Notes |
|---|---|---|---|---|---|---|
| Excluded | Match | `/c/:categoryCode/matches`는 placeholder다. | `src/routes/AppRouter.jsx:81`, `src/pages/CategoryPlaceholderPage.jsx:30` | 매치 기능 구현으로 범위 확대 위험 | Phase 10 제외 | 운영 UI에서는 준비 중 정책만 결정 |
| Excluded | OAuth | OAuth route/API는 확인되지 않았다. | `rg` 결과 없음 | 범위 확대 | Phase 10 제외 | 신규 기능 |
| Excluded | Team chat | 채팅 route/API는 확인되지 않았다. | `rg` 결과 없음 | 범위 확대 | Phase 10 제외 | 신규 기능 |
| Excluded | Mobile-only UI | 이번 목표는 PC 웹 UI 전환이다. | 요구사항 | 범위 확대 | Phase 10 제외 | 반응형 최소 보장은 별도 판단 |
| Excluded | New admin features | admin route는 dashboard/notices만 존재한다. | `src/routes/AppRouter.jsx:86` | 신규 관리자 기능으로 범위 확대 | Phase 10 제외 | 기존 기능 UI만 대상으로 제한 |

## 확인 필요

| Priority | Area | Finding | Evidence | Risk | Recommended Phase | Notes |
|---|---|---|---|---|---|---|
| 확인 필요 | Backend SSE heartbeat | backend가 heartbeat event를 보내는지 문서/코드 추가 확인 필요 | frontend heartbeat handler 없음 | SSE 상태 오판 | Phase 10-2 전 | `NotificationSseService` 세부 이벤트 확인 필요 |
| 확인 필요 | Admin role mapping | frontend `AdminRoute`의 role 판정 조건 상세 확인 필요 | `AdminRoute.jsx` | 관리자 접근 오탐/누락 | Phase 10-2 전 | backend `hasRole("ADMIN")`와 `MeResponse.role` 값 비교 |
| 확인 필요 | Deployment fallback | BrowserRouter deep link를 운영 서버가 index.html로 fallback하는지 확인 필요 | frontend only 확인 | refresh 404 가능성 | Phase 10-2 전 | nginx/frontend hosting 설정 확인 |
| 확인 필요 | `src/api/clients.js` | 파일 존재는 확인됐으나 사용처/역할 정리 필요 | `rg --files` | 중복 API client 가능성 | Phase 10 중 | 삭제 금지, 미사용 후보로만 관리 |
