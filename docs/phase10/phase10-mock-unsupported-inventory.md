# Phase 10-1 Mock and Unsupported Inventory

## 핵심 판정

신규 디자인은 `VITE_USE_MOCK_DATA`의 기본값이 true이고 API 모듈이 없다. `withMock(value, fallback)`은 mock disabled 시 실제 API를 호출하는 것이 아니라 빈 배열/undefined를 반환한다. 운영 화면에 그대로 적용하면 데이터가 없거나 버튼이 API 성공처럼 보이는 문제가 발생한다.

## Mock/static data

| 파일/항목 | 사용 화면 | 내용 | 분류 | 조치 |
|---|---|---|---|---|
| `src/data/mockUsers.ts` | Login | 평문 mock credential, `findMockUser` | 실제 API로 교체 | 파일을 운영 bundle에서 제외 |
| `src/data/teams.ts` | Home/Category/Team pages | 8개 팀, roster, 내 팀·신청 | 실제 API로 교체/일부 미지원 | 내 소속 팀은 Backend 검토 필요 |
| `src/data/posts.ts` | Board/Post | 7개 게시글, 댓글, 조회수, 신고 사유 | 실제 API로 교체/일부 운영 제외 | 조회수·신고는 Backend 미지원 |
| `src/data/notices.ts` | Notice/Admin | 공지 5개, 고정 page size 2 | 실제 API로 교체 | Spring Page 사용 |
| `src/data/notifications.ts` | Notifications | 오늘/어제 알림 4개, targetPath | 실제 API로 교체 | Backend targetType/targetId 변환 |
| `src/data/admin.ts` | Admin/TeamManage | 사용자, 신고글, 가입 신청 | 혼합 | 가입 신청만 API 교체; 사용자/신고는 운영 제외 |
| `src/data/categories.ts` | 전역 | 6개 category와 이미지 | 순수 UI 상수로 유지 가능 | Backend 문자열과 mapping 고정 |
| `src/lib/mockData.ts` | 여러 page | mock flag와 fallback | 운영 제거 | 실제 loading/query 상태로 대체 |
| `src/lib/teamRole.ts` | 팀 page | mock roster/current user로 role 계산 | 실제 API로 교체 | `MeResponse` + team members/detail 기반 |

## 가짜 성공·권한 처리

| 위치 | 동작 | 위험 | 분류 |
|---|---|---|---|
| `LoginPage.handleSubmit` | mock user가 맞으면 in-memory login | 토큰/서버 세션 없음 | 실제 API로 교체 |
| `SignupPage.handleSubmit` | API 없이 `/login` 이동 | 가입이 성공한 것처럼 표시 | 실제 API로 교체 |
| `TeamCreatePage.handleSubmit` | API 없이 `/teams` 이동 | 팀 미생성 | 실제 API로 교체 |
| `TeamManagePage` 승인/거절 | 배열에서 신청 삭제 | 동시성·OWNER 검증 우회 | 실제 API로 교체 |
| `TeamSettingsPage` 위임/close/delete | modal 닫고 navigate | 상태 변경 미수행 | 실제 API로 교체 |
| `TeamLeavePage` | confirm 후 navigate | 탈퇴 미수행 | 실제 API로 교체 |
| `BoardWritePage` | 등록 후 navigate | 게시글 미생성 | 실제 API로 교체 |
| `PostDetailPage` 댓글 | 입력값만 clear | 댓글 미생성 | 실제 API로 교체 |
| `PostDetailPage` 삭제 | modal 후 navigate | 삭제 미수행 | 실제 API로 교체 |
| `AdminNoticePage` CUD | local mode/modal만 변경 | 공지 미변경 | 실제 API로 교체 |
| `NotificationsPage` | local unread flag 변경 | 서버 읽음 상태 미반영 | 실제 API로 교체 |
| `MyInfoPage` role toggle | USER/ADMIN을 UI에서 전환 | ADMIN 권한 우회처럼 보임 | 도입 금지 |
| `MyInfoPage` logout/withdraw | state 제거·navigate | 서버 logout/탈퇴 미수행 | logout API 교체/탈퇴 운영 제외 |

## Backend 미지원으로 운영 제외

- `FindPasswordPage`: OTP 발급·검증·password reset.
- `EmailVerifyPage`: 인증 메일 발송·재발송·검증.
- `EditInfoPage`, `ChangePasswordPage`, 회원 탈퇴.
- `FormationPage`: formation/position 저장.
- `ReportModal`, `AdminConsolePage`의 사용자·신고 관리.
- TeamSettings의 팀 이름 변경.
- 게시글 조회수·신고·카테고리 tab 데이터.
- 팀 level/location/activityTime, 정원과 고정 통계.

## 유지 가능한 UI 상수

- category 표시명과 이미지 mapping. 단, API category 값과 한 곳에서 변환한다.
- theme token, spacing, typography, 상태 badge label.
- 신고 사유는 신고 기능이 도입되기 전에는 화면 자체를 제외한다.
- pagination page size는 UI 상수가 아니라 Backend 요청 parameter와 함께 관리한다.

## 기타 전수 검색 결과

- `setTimeout`, `setInterval`, axios, fetch, EventSource, WebSocket, `console.log`, TODO/FIXME는 신규 디자인 `src`에서 확인되지 않았다.
- 가짜 지연은 없지만 대부분의 mutation이 즉시 local state 변경 또는 navigate이므로 운영 mock 성공 처리에 해당한다.
- 임시 ID는 data 파일의 숫자 id와 `teamId/postId` route 변환에 사용된다.
- mock user password가 source에 포함되므로 디자인 branch를 운영 bundle에 그대로 포함하면 안 된다.
- dark mode role toggle과 mock ADMIN 전환은 데모 편의 기능이며 운영 대상이 아니다.
