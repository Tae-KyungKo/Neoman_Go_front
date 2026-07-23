# Phase 10-1 Route and Screen Mapping

## 조사 기준

- 기존 Frontend: `feature/phase10-ui-integration` `80234dafeddc8e6c746cbda972e37ddfa027450c`
- 신규 디자인: `origin/feature/new-design-baseline` `8f8c01854aae149e6e7c8aab56aad5fc96c9cc08`
- Backend: `release/v1.1.0` `c381398d768ecb8b9895068376733497b2a5ee80`
- 신규 디자인은 독립 root commit이며 현재 통합 브랜치에 병합하지 않고 detached worktree에서 조사했다.
- Backend 지원 여부는 Controller/DTO 실제 코드를 기준으로 판정했다.

## 구조 비교

| 항목 | 기존 Frontend | 신규 디자인 | 통합 판단 |
|---|---|---|---|
| App 진입점 | `src/main.jsx` → `src/App.jsx` → `src/routes/AppRouter.jsx` | `src/main.tsx` → `src/App.tsx` | 기존 Router/Auth 소유권 유지 |
| Router | `BrowserRouter`가 `AppRouter` 내부, nested route와 `Outlet` 사용 | `BrowserRouter`가 `main.tsx`, 모든 route가 flat | 전체 교체 금지; 신규 page를 기존 route tree에 배치 |
| AuthProvider | Router 내부, 모든 route의 공통 조상 | `App.tsx`에서 Routes 직전이나 in-memory user만 보유 | 기존 `src/auth/AuthContext.jsx` 유지 |
| MainLayout | route tree에서 한 번 마운트, SSE hook 소유 | 각 page가 `MainLayout`을 직접 렌더링 | 신규 방식을 그대로 쓰면 route 전환마다 SSE/layout 재마운트 위험 |
| 권한 guard | `ProtectedRoute`, `AdminRoute` | page 내부 `Navigate`, mock `useTeamRole` | 기존 guard와 Backend 도메인 권한 유지 |
| API | `src/api/*` axios 계층 | API 호출 없음 | 기존 API 계층 재사용·필요한 함수만 추가 |
| 스타일 | `src/index.css`, `src/App.css` 전역 | 37개 CSS, token 4개, 공통 `global.css` | 신규 class/token을 격리해 단계 적용 |

## Route 매핑

권한은 route guard와 Backend 서비스 정책을 함께 표시한다. 가입 신청자, TEAM_MEMBER, OWNER는 기존 Router에서 별도 route guard로 구분하지 않고 화면 내부 데이터와 Backend 권한으로 처리한다.

| 기능 영역 | 기존 route | 신규 디자인 route | 기존 페이지 | 신규 페이지 | 권한 | Backend 지원 | 통합 결정 | 근거 |
|---|---|---|---|---|---|---|---|---|
| 홈 | `/` | `/` | `HomePage` | `HomePage` | 비회원/USER | API 불필요 | 신규 UI 수정 후 적용 | 디자인 홈은 category carousel만 제공; 기존 공지·알림 진입 보존 필요 |
| 로그인 | `/login` | `/login` | `LoginPage` | `LoginPage` | 비회원 | 완전 지원 | 신규 UI 수정 후 적용 | 디자인은 `findMockUser`; 기존 `AuthContext.login`으로 교체 |
| 회원가입 | `/signup` | `/signup` | `SignupPage` | `SignupPage` | 비회원 | 완전 지원 | 신규 UI 수정 후 적용 | 디자인 중복 확인 호출 누락 |
| 비밀번호 찾기 | 없음 | `/find-password` | 없음 | `FindPasswordPage` | 비회원 | 미지원 | 운영 제외 | Backend Controller에 endpoint 없음 |
| 이메일 인증 | 없음 | `/verify-email` | 없음 | `EmailVerifyPage` | 비회원/USER | 미지원 | 운영 제외 | Backend Controller에 endpoint 없음 |
| 카테고리 홈 | `/c/:categoryCode` | `/categories/:categoryId` | `CategoryHomePage` | `CategoryPage` | 비회원/USER | 팀·게시글 조회 지원 | 신규 UI 수정 후 적용 | 기존 category code는 Backend 문자열과 route에 사용 |
| 카테고리 팀 목록 | `/c/:categoryCode/teams` | `/categories/:categoryId`, `/teams` | `TeamListPage` | `CategoryPage`, `TeamFindPage` | 비회원/USER | 완전 지원 | 신규 UI 수정 후 적용 | `/api/teams?category=` Page 응답 변환 필요 |
| 팀 생성 | `/c/:categoryCode/teams/new` | `/teams/new` | `TeamCreatePage` | `TeamCreatePage` | USER | 일부 지원 | 신규 UI 수정 후 적용 | `level/location/time`은 Backend DTO에 없음 |
| 팀 상세 | `/c/:categoryCode/teams/:teamId` | `/teams/:teamId` | `TeamDetailPage` | `TeamDetailPage` | 비회원/신청자/TEAM_MEMBER/OWNER | 완전 지원 | 신규 UI 수정 후 적용 | 디자인 필드와 `TeamDetailResponse`가 다름 |
| 팀 설정 | 상세 화면 내부 | `/teams/:teamId/settings` | `TeamMemberManagementPanel` 등 | `TeamSettingsPage` | OWNER | close/delete/delegate 지원 | 신규 UI 수정 후 적용 | 팀 이름 수정 API는 없음 |
| 가입 신청 관리 | 상세 화면 내부 | `/teams/:teamId/manage` | `OwnerTeamApplicationsPanel` | `TeamManagePage` | OWNER | 완전 지원 | 신규 UI 수정 후 적용 | 디자인 mock `JOIN_REQUESTS` 제거 필요 |
| 팀 탈퇴 | 상세 화면 내부 | `/teams/:teamId/leave` | `TeamMemberManagementPanel` | `TeamLeavePage` | TEAM_MEMBER/OWNER | 일부 지원 | 신규 UI 수정 후 적용 | OWNER는 위임 전 탈퇴 불가; 별도 route guard는 없음 |
| 포메이션 | 없음 | `/teams/:teamId/formation/:sport` | 없음 | `FormationPage` | TEAM_MEMBER/OWNER | 미지원 | 운영 제외 | formation 저장/조회 API 없음 |
| 내 정보 | `/me` placeholder | `/mypage/info` | `PlaceholderPage` | `MyInfoPage` | USER/ADMIN | 조회만 지원 | 신규 UI 수정 후 적용 | `GET /api/users/me`만 존재 |
| 내 팀·신청 | 팀 상세 내부 신청 목록 | `/mypage/teams` | `MyTeamApplicationsPanel` | `MyTeamPage` | USER | 신청 목록만 지원 | 신규 UI 수정 후 적용 | 내 소속 팀 목록 API 없음 |
| 내 알림 | `/notifications` | `/mypage/notifications` | `NotificationPage` | `NotificationsPage` | USER/ADMIN | 완전 지원 | 신규 UI 수정 후 적용 | 기존 target navigation과 SSE 보존 |
| 정보 수정 | 없음 | `/mypage/edit` | 없음 | `EditInfoPage` | USER/ADMIN | 미지원 | 운영 제외 | user update API 없음 |
| 비밀번호 변경 | 없음 | `/mypage/change-password` | 없음 | `ChangePasswordPage` | USER/ADMIN | 미지원 | 운영 제외 | password update API 없음 |
| 게시글 목록 | `/c/:categoryCode/board` | `/board` | `BoardListPage` | `BoardListPage` | 비회원/USER | 완전 지원 | 신규 UI 수정 후 적용 | Backend는 category path가 필수 |
| 게시글 작성 | 기존 목록 화면 내부 | `/board/new` | `PostCreatePanel` | `BoardWritePage` | USER | 완전 지원 | 신규 UI 수정 후 적용 | category를 Backend path로 확정해야 함 |
| 게시글 상세 | `/c/:categoryCode/posts/:postId` | `/board/:postId` | `PostDetailPage` | `PostDetailPage` | 비회원/USER | 완전 지원 | 신규 UI 수정 후 적용 | 댓글 CRUD·작성자 권한 UI 복원 필요 |
| 공지 목록 | `/notices` | `/notices` | `NoticeListPage` | `NoticeListPage` | 비회원/USER | 완전 지원 | 신규 UI 적용 | Spring Page 변환 필요 |
| 공지 상세 | `/notices/:noticeId` | `/notices/:id` | `NoticeDetailPage` | `NoticeDetailPage` | 비회원/USER | 완전 지원 | 신규 UI 수정 후 적용 | ADMIN delete 노출을 role로 제한 |
| 관리자 홈 | `/admin` | `/admin` | `AdminDashboardPage` | `AdminConsolePage` | ADMIN | 통계/사용자/신고 미지원 | 기존 UI 유지 | 신규 콘솔 데이터 API 없음 |
| 관리자 공지 | `/admin/notices` | `/admin/notices` | `AdminNoticePage` | `AdminNoticePage` | ADMIN | 완전 지원 | 신규 UI 수정 후 적용 | 기존 `AdminRoute`와 공지 API 유지 |
| 403 | guard 내부 메시지 | `/forbidden` | `AdminRoute` inline | `ForbiddenPage` | 비회원/USER | HTTP 403 지원 | 신규 UI 수정 후 적용 | guard가 명시 route로 이동하도록 설계 필요 |
| 404 | `*` | `*` | `NotFoundPage` | `NotFoundPage` | 전체 | 프론트 처리 | 신규 UI 적용 | 정적 hosting SPA fallback은 별도 검증 |
| 경기 | `/c/:categoryCode/matches` placeholder | 없음 | `CategoryPlaceholderPage` | 없음 | 비회원/USER | 미지원 | 운영 제외 | 양쪽 모두 운영 기능 아님 |

## 화면·기능 지원 분류

### A. Backend v1.1.0으로 완전히 지원

- 로그인, 회원가입, loginId/nickname 중복 확인, 로그아웃
- 팀 목록·상세·생성, 가입 신청·취소, 승인·거절
- 팀원 목록·강퇴, OWNER 위임, 팀 탈퇴, 모집 마감·삭제
- 게시글 목록·상세·작성·수정·삭제
- 댓글 목록·작성·수정·삭제
- 공지 목록·상세 및 ADMIN 공지 CRUD
- 알림 목록·미읽음 수·개별/전체 읽음, SSE, target 이동

### B. Backend v1.1.0으로 일부 지원

- 내 정보: 조회만 가능하고 수정·탈퇴 API는 없다.
- 내 팀: 내 가입 신청 목록은 있으나 내 소속 팀 목록 API는 없다.
- 팀 생성/상세 디자인: `level`, `location`, `activityTime`, 정원·승률 같은 디자인 필드는 없다.
- 팀 설정: close/delete/delegate는 있으나 팀 이름·소개 수정 API는 없다.
- 게시판 디자인: 조회수, 댓글 수, 공지/자유/질문 tab은 Backend DTO/enum에 없다.
- 관리자 콘솔: ADMIN 공지 CRUD만 지원한다.

### C. Backend API 없음

- 비밀번호 찾기·OTP·재설정
- 이메일 인증·재전송
- 회원 정보 수정·비밀번호 변경·회원 탈퇴
- 포메이션 저장·조회
- 게시글 신고, 신고 목록·처리
- 관리자 사용자 목록·통계
- 팀 이름/소개 수정

### D. 신규 디자인에서 누락된 기존 운영 기능

- 일반 API 401 single-flight 재발급과 원 요청 재시도
- 서버 logout과 인증 실패 시 token 제거
- 전역 SSE 단일 연결, toast, 상태 badge, REST fallback refresh
- 팀 가입 신청 취소 및 내 신청 상태의 실제 API 흐름
- 댓글 수정·삭제, 게시글 수정
- OWNER 강퇴·위임의 실제 `teamMemberId` 기반 처리
- 알림 target의 TEAM/POST 상세 조회 후 category route 복원
- 기존 `ProtectedRoute`, `AdminRoute`
- Backend `ErrorResponse` code별 처리와 loading/error/empty 상태

## Deep-link 주의

- 두 Frontend 모두 `BrowserRouter`를 사용한다.
- 앱 내부 wildcard는 `NotFoundPage`로 처리할 수 있지만 S3/CloudFront/Nginx에서 모든 앱 경로를 `index.html`로 fallback하는지는 이 저장소만으로 확정할 수 없다.
- 기존 로그인 redirect는 `state.from.pathname`만 사용하므로 query/hash 보존은 추가 확인이 필요하다.
