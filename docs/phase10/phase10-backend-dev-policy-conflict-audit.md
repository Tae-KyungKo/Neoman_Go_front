# Phase 10 Backend dev 정책·스펙·신규 디자인 충돌 전수 조사

## 1. 조사 결론

이 문서는 Phase 10 통합 구현 전에 사용자 결정을 받기 위한 조사 문서다. 코드 이식, API 추가, Mock 제거는 수행하지 않았다.

- Frontend 통합 기준: `feature/phase10-ui-integration` `80234dafeddc8e6c746cbda972e37ddfa027450c`
- 신규 디자인 기준: `origin/feature/new-design-baseline` `8f8c01854aae149e6e7c8aab56aad5fc96c9cc08`
- Backend 조사 기준: `dev` 및 `origin/dev` `c381398d768ecb8b9895068376733497b2a5ee80`
- Backend의 현재 `main`과 `dev`는 commit SHA는 다르지만 tree SHA가 `18542b...`로 같아, 이 조사에서 읽은 현재 파일은 `dev` 파일과 동일하다.

판정 기준은 다음과 같다.

| 판정 | 의미 |
|---|---|
| 구현 확정 | Controller, DTO, Service, Entity 또는 migration에서 실제 동작을 확인 |
| 정책 확정·API 미구현 | `docs/policy.md` 등에 정책은 있으나 호출 가능한 API가 없음 |
| 정책-구현 충돌 | 정책 문서와 실제 코드가 다르며, 프론트에서 어느 쪽도 확정값으로 가정하면 위험 |
| 신규 디자인 전용 | 신규 디자인에만 존재하고 Backend 계약에는 없음 |

가장 중요한 결론은 다음과 같다.

1. 현재 Backend에 바로 연결 가능한 범위는 Auth, 내 정보 조회, 팀·가입 신청·팀원 관리, 게시글·댓글, 공지, 알림·SSE다.
2. 회원정보 수정·비밀번호 변경·비밀번호 찾기·이메일 인증·회원 탈퇴 API는 없다.
3. 팀 수정, 내 소속 팀 목록, 포메이션, 게시글 조회수·좋아요·신고·검색, 일반 관리자 콘솔 API는 없다.
4. 신규 디자인의 팀 `level`, `location`, 정원/인원 수와 게시판 탭 `공지/자유/팀모집/질문`은 Backend 모델과 직접 호환되지 않는다.
5. Backend 자체에도 팀 삭제 정리 로직, PENDING 중복 신청의 동시성 방어, OWNER 단일성 DB 보장 등 정책-구현 차이가 있다. 프론트만으로 해결할 수 없다.

## 2. 근거와 계약 우선순위

조사한 Backend 근거:

- 정책: `docs/policy.md`
- 인증 API 상세: `docs/api/auth.md`
- 구조 설명: `docs/serviceArchitecture.md`
- 실제 API: 각 도메인의 `controller`, `dto`, `service`
- 저장 계약: `entity`, `repository`, `src/main/resources/db/migration/V1__baseline_schema.sql`, `V2__add_login_id_to_users.sql`
- 권한: `global/config/SecurityConfig.java`
- 공통 응답·예외: `global/response/ApiResponse.java`, `global/exception/ErrorResponse.java`, `ErrorCode.java`
- 실행 설정: `application.yml` 및 profile별 설정

충돌 시 적용한 원칙:

1. 현재 호출 가능 여부와 실제 요청·응답 형태는 Controller/DTO/Service를 우선한다.
2. 의도한 비즈니스 규칙은 `docs/policy.md`를 기록하되, 코드가 다르면 “확정 구현”으로 간주하지 않는다.
3. README의 이메일 인증, Match, WebSocket 채팅, 확장 관리자 기능은 현재 Controller가 없으므로 현재 API 계약으로 보지 않는다.
4. 신규 디자인의 Mock 타입은 요구 아이디어일 수 있지만 Backend 계약으로 간주하지 않는다.

## 3. Backend 공통 API 계약

### 3.1 응답·오류

- 성공: `ApiResponse<T> { success, code, message, data }`
- 실패: `ErrorResponse { status, code, message, errors? }`
- Bean Validation 실패 시 HTTP 400이며 `errors`에 필드 오류가 포함될 수 있다.
- 인증 헤더: `Authorization: Bearer <accessToken>`
- 목록은 Spring `Page<T>`가 `ApiResponse.data` 안에 들어간다.
- 프론트는 `content`, `number`, `size`, `totalElements`, `totalPages`, `first`, `last`를 화면 모델로 변환해야 한다.
- 알림 `createdAt`은 KST offset이 포함된 `OffsetDateTime`이지만 `readAt`과 다른 도메인의 날짜는 주로 `LocalDateTime`이다. 하나의 날짜 파서만 가정하면 안 된다.

### 3.2 권한

| 범위 | 실제 권한 |
|---|---|
| `/api/auth/**` | 공개 |
| 팀 목록·상세 GET | 공개 |
| 게시글 목록·상세, 댓글 목록 GET | 공개 |
| 공지 목록·상세 GET | 공개 |
| `/api/admin/**` | `ROLE_ADMIN` |
| 그 외 | 인증 필요 |

- Backend enum과 응답 role은 `USER`, `ADMIN` 대문자다.
- 신규 디자인 AuthContext의 `'user'`, `'admin'` 소문자와 직접 비교하면 관리자 판정이 실패한다.
- 팀 권한은 전역 USER/ADMIN이 아니라 해당 팀의 활성 `TeamMember.role`인 `OWNER`/`MEMBER`로 별도 판정해야 한다.

### 3.3 인증 수명과 CORS

- Access Token 기본 만료: 1,800초
- Refresh Token 기본 만료: 1,209,600초
- Refresh Token 저장 키: Redis `refresh:{userId}`
- 현재 정책은 사용자당 Refresh Token 하나이며 다중 디바이스 세션은 범위 밖이다.
- 로그아웃은 Redis Refresh Token을 제거한다.
- 허용 method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- 허용 header에 `Authorization`, `Content-Type`, `Accept`, `Last-Event-ID`, `Cache-Control`이 포함된다.
- `allow-credentials` 기본값은 `false`이므로 cookie 인증을 전제로 설계하면 안 된다.

## 4. 확정 Entity와 상태 모델

| Entity | 핵심 필드·상태 | DB/도메인 제약 | 프론트 영향 |
|---|---|---|---|
| `User` | `loginId`, `email`, `password`, `nickname`, `role`, `status`, `deletedAt` | loginId/email/nickname unique, role `USER/ADMIN`, status `ACTIVE/DELETED` | 로그인 식별자는 email이 아니라 loginId |
| `Team` | `name`, `description?`, `category`, `status`, `creator`, dates | name 50, description 500, category 50, `RECRUITING/CLOSED/DELETED` | 정원, level, location, 활동 시간 필드 없음 |
| `TeamMember` | team, user, role, status, joinedAt | `(team_id,user_id)` unique, role `OWNER/MEMBER`, status `ACTIVE/INACTIVE` | 탈퇴와 강퇴는 상태만으로 구분 불가 |
| `TeamApplication` | team, applicant, message?, status, active, canceledAt | message 500, `PENDING/APPROVED/REJECTED/CANCELED` | PENDING만 승인·거절·취소 가능 |
| `UserCategoryMembership` | user, category, team | `(user_id,category)` unique | 한 사용자는 같은 category의 한 팀에만 소속 |
| `Post` | category, title, content, author, status, dates | category 50, title 100, content 5000, `ACTIVE/DELETED` | 일반 게시판 type, 조회수, 좋아요 없음 |
| `Comment` | post, author, content, status, dates | content 1000, `ACTIVE/DELETED` | 대댓글 구조 없음 |
| `Notice` | author, title, content, status, dates | title 100, content 5000, `ACTIVE/DELETED` | 공개 작성자명은 실제 계정 대신 `관리자` |
| `Notification` | receiver, type, title, message, targetType, targetId, readAt, dates | title 100, message 500 | URL이 아니라 targetType/targetId를 받음 |
| `AuditLog` | admin, resourceType, resourceId, action, detail, createdAt | 현재 notice `CREATE/UPDATE/DELETE` 연결 확인 | 일반 관리자 행위 전체 감사 로그는 미구현 |

### 4.1 Notification enum

구현된 event type:

- `TEAM_APPLICATION_CREATED`
- `TEAM_APPLICATION_APPROVED`
- `TEAM_APPLICATION_REJECTED`
- `TEAM_MEMBER_JOINED`
- `TEAM_MEMBER_LEFT`
- `TEAM_MEMBER_KICKED`
- `TEAM_OWNER_DELEGATED`
- `POST_COMMENT_CREATED`

target type:

- `TEAM`
- `TEAM_APPLICATION`
- `POST`

신규 디자인의 `targetPath`는 서버 필드가 아니다. 프론트에서 `(targetType, targetId) -> route` 변환 표가 필요하다.

## 5. 확정 도메인 정책

### 5.1 회원·인증

- 로그인은 `loginId + password`다. email 로그인은 지원하지 않는다.
- loginId는 4~12자 영문 대소문자와 숫자만 허용한다.
- password는 8~16자이고 허용된 ASCII 영문·숫자·특수문자만 받는다.
- 정책/정규식은 “영문·숫자·특수문자를 각각 반드시 한 개 포함”을 강제하지 않는다.
- nickname은 2~12자이며 `관리자`, `운영자`, `admin` 계열을 대소문자 무시하고 금지한다.
- loginId와 nickname 중복 확인 API는 UX 보조다. 회원가입 요청의 서버 검증과 DB unique가 최종 방어선이다.
- email은 unique지만 이메일 인증은 현재 범위에 없다.
- 탈퇴 회원의 활성 게시글·댓글은 유지하고 작성자명을 `탈퇴한 사용자`로 표시한다는 정책이 있다.

### 5.2 팀·카테고리·가입 신청

- 팀 생성자는 자동으로 OWNER, 활성 TeamMember, UserCategoryMembership가 된다.
- 같은 사용자는 같은 category의 한 팀에만 소속될 수 있다.
- 팀 정원 제한은 없다.
- `RECRUITING`: 목록 노출, 가입 신청 가능
- `CLOSED`: 목록 노출, 가입 신청 불가
- `DELETED`: 일반 조회 제외, 가입 신청 불가
- 같은 팀에 PENDING 신청이 있으면 재신청할 수 없다.
- 같은 category의 여러 팀에 PENDING 신청을 동시에 넣는 것은 허용된다.
- 한 신청이 승인되면 같은 사용자의 같은 category 다른 PENDING 신청은 CANCELED된다.
- 승인·거절은 해당 팀 OWNER만 할 수 있다.
- 승인·거절은 application에 pessimistic write lock을 건다.
- 일반 MEMBER 탈퇴와 강퇴는 TeamMember를 INACTIVE로 바꾸고 UserCategoryMembership를 삭제한다.
- 강퇴 후에는 같은 팀에 다시 신청할 수 있다.
- OWNER가 혼자면 탈퇴 시 팀을 삭제하고 본인 멤버십을 비활성화하며 category 점유를 풀고 PENDING 신청을 거절한다.
- 활성 팀원이 둘 이상이면 OWNER는 먼저 다른 활성 MEMBER에게 OWNER를 위임해야 탈퇴할 수 있다.

### 5.3 게시글·댓글·공지

- 게시글과 댓글 조회는 공개다.
- 생성은 로그인 사용자만 가능하다.
- 게시글·댓글 수정/삭제는 작성자만 가능하다.
- 삭제는 Soft Delete다.
- 탈퇴 사용자의 살아 있는 글·댓글 작성자 표시는 `탈퇴한 사용자`다.
- 공지 조회는 공개, 생성·수정·삭제는 ADMIN만 가능하다.
- 공지의 공개 작성자 표시는 항상 `관리자`이며 관리자 ID/email/실제 nickname을 노출하지 않는다.

### 5.4 알림·SSE

- DB 알림이 source of truth이고 SSE는 전달 보조 수단이다.
- 알림은 원 트랜잭션 commit 후 생성·전달한다.
- 자기 행동 알림은 정책에 따라 제외한다.
- 개별 읽음, 전체 읽음, 미읽음 수를 지원한다.
- SSE endpoint는 `/api/notifications/stream`이다.
- event name은 `connected`, `notification`이고 heartbeat comment를 기본 30초마다 보낸다.
- emitter timeout 기본은 1시간이다.
- Backend는 사용자당 여러 emitter를 보관할 수 있다. “전역 SSE 한 연결”은 프론트 안정화 정책이지 서버 강제 규칙이 아니다.
- 알림 30일 보관 후 Hard Delete는 정책에 있지만 실제 정리 batch는 확인되지 않았다.

## 6. 실제 API와 프론트 예상 입력 폼

### 6.1 Auth·User

| 기능 | Method·Endpoint | 요청·검증 | 실제 응답 | 신규 디자인 판정 |
|---|---|---|---|---|
| loginId 확인 | `GET /api/auth/check-login-id?loginId=` | loginId 형식 | `AvailabilityResponse{available}` | 형식 검사는 있으나 서버 중복 확인 연결 없음 |
| nickname 확인 | `GET /api/auth/check-nickname?nickname=` | nickname 정책 | `AvailabilityResponse{available}` | 서버 중복 확인 연결 없음 |
| 회원가입 | `POST /api/auth/signup` | `loginId,password,passwordConfirm,email,nickname` | `UserResponse` | 필드 구조는 대체로 일치, 실제 호출 없음 |
| 로그인 | `POST /api/auth/login` | `loginId,password` | access/refresh token과 만료 | Mock credential 비교라 교체 필수 |
| 재발급 | `POST /api/auth/reissue` | `refreshToken` | 새 token pair | 신규 디자인에 구현 없음 |
| 로그아웃 | `POST /api/auth/logout` | body 없음, Bearer 필요 | `Void` | 로컬 user 제거만 수행 |
| 내 정보 | `GET /api/users/me` | body 없음 | `id,email,nickname,role,status` | loginId, joinedAt은 응답에 없음 |

예상 폼:

- Login: `loginId`, `password`
- Signup: `loginId`, `password`, `passwordConfirm`, `email`, `nickname`
- Signup에는 loginId/nickname 중복 확인 상태를 별도로 관리해야 한다.
- 중복 확인이 성공해도 submit 시 409를 처리해야 한다.

현재 없는 API:

- 내 정보 수정
- nickname/email 변경
- 비밀번호 변경
- 비밀번호 찾기/OTP
- 이메일 인증
- 회원 탈퇴
- 내 정보 응답의 loginId/joinedAt

### 6.2 Team·Application·Member

| 기능 | Method·Endpoint | 입력 | 권한 | 핵심 응답/주의 |
|---|---|---|---|---|
| 팀 목록 | `GET /api/teams` | `category?`, pageable, sort | 공개 | `Page<TeamSummaryResponse>` |
| 팀 상세 | `GET /api/teams/{teamId}` | path id | 공개 | owner와 active members 포함 |
| 팀 생성 | `POST /api/teams` | `name`, `description?`, `category` | 인증 | creator가 자동 OWNER |
| 모집 마감 | `PATCH /api/teams/{teamId}/close` | 없음 | OWNER | CLOSED에서 재오픈 API 없음 |
| 팀 삭제 | `DELETE /api/teams/{teamId}` | 없음 | OWNER | 정책-구현 충돌은 9장 참고 |
| 팀원 목록 | `GET /api/teams/{teamId}/members` | path id | 인증 | `teamMemberId,userId,nickname,role,status` |
| 팀 탈퇴 | `POST /api/teams/{teamId}/members/me/leave` | 없음 | active member | OWNER 조건 분기 필요 |
| 팀원 강퇴 | `POST /api/teams/{teamId}/members/{teamMemberId}/kick` | 두 path id | OWNER | userId가 아니라 teamMemberId |
| OWNER 위임 | `POST /api/teams/{teamId}/owner/delegate` | `targetTeamMemberId` | OWNER | 활성 MEMBER만 대상 |
| 가입 신청 | `POST /api/teams/{teamId}/applications` | `message?` 최대 500 | 인증 | RECRUITING만 가능 |
| 내 신청 목록 | `GET /api/me/team-applications` | 없음 | 인증 | 소속 팀 목록이 아니라 신청 목록 |
| 신청 취소 | `PATCH /api/team-applications/{id}/cancel` | 없음 | 신청자 | PENDING만 |
| 팀 신청 목록 | `GET /api/teams/{teamId}/applications` | 없음 | OWNER | PENDING 목록 |
| 승인·거절 | `POST /api/team-applications/{id}/approve|reject` | 없음 | OWNER | application id 사용 |

예상 폼:

- Team create: `name` 필수·최대 50, `description` 선택·최대 500, `category` 필수·최대 50
- Application: `message` 선택·최대 500
- Owner delegation: UI에서 활성 MEMBER를 선택하여 `targetTeamMemberId` 전송
- close/delete/leave/kick/cancel/approve/reject: 텍스트 입력 폼이 아니라 정책을 설명하는 확인 dialog가 적합

실제 Team response 제한:

- `TeamSummaryResponse`: `id,name,category,status,ownerId,ownerNickname,createdAt`
- `TeamResponse`: 위 필드에 `description`
- `TeamDetailResponse`: `owner`, `members`, `description` 포함
- 목록 응답에 description, member count, capacity, level, location, activity time이 없다.
- 목록 카드마다 상세 API를 호출해 부족한 필드를 채우면 클라이언트 N+1이 된다.

현재 없는 API/필드:

- 팀 이름·설명·category 수정
- CLOSED -> RECRUITING 재오픈
- 내 활성 소속 팀 목록
- 팀 정원과 남은 자리
- team/member level
- location, 활동 시간
- 포메이션 저장·조회

### 6.3 Post·Comment·Notice

| 기능 | Method·Endpoint | 입력·제한 | 권한 |
|---|---|---|---|
| 게시글 목록 | `GET /api/categories/{category}/posts` | category path, pageable | 공개 |
| 게시글 상세 | `GET /api/posts/{postId}` | path id | 공개 |
| 게시글 생성 | `POST /api/categories/{category}/posts` | title 1~100, content 1~5000 | 인증 |
| 게시글 수정 | `PATCH /api/posts/{postId}` | title 1~100, content 1~5000 | 작성자 |
| 게시글 삭제 | `DELETE /api/posts/{postId}` | 없음 | 작성자 |
| 댓글 목록 | `GET /api/posts/{postId}/comments` | pageable | 공개 |
| 댓글 생성 | `POST /api/posts/{postId}/comments` | content 1~1000 | 인증 |
| 댓글 수정 | `PATCH /api/comments/{commentId}` | content 1~1000 | 작성자 |
| 댓글 삭제 | `DELETE /api/comments/{commentId}` | 없음 | 작성자 |
| 공지 목록·상세 | `GET /api/notices`, `GET /api/notices/{id}` | pageable/path | 공개 |
| 공지 생성 | `POST /api/admin/notices` | title 1~100, content 1~5000 | ADMIN |
| 공지 수정 | `PATCH /api/admin/notices/{id}` | title 1~100, content 1~5000 | ADMIN |
| 공지 삭제 | `DELETE /api/admin/notices/{id}` | 없음 | ADMIN |

현재 없는 API/필드:

- 게시판 type `공지/자유/팀모집/질문`
- 제목·본문 검색
- 조회수
- 좋아요
- 신고와 신고 사유
- 첨부 파일
- 대댓글
- 관리자 게시글·댓글 강제 삭제 API

Backend `category`는 활동 category 경로 값이다. 신규 디자인의 게시판 tab을 같은 `category` 필드로 보내면 팀 category와 의미가 충돌한다.

### 6.4 Notification

| 기능 | Method·Endpoint | 응답 |
|---|---|---|
| 목록 | `GET /api/notifications` | `Page<NotificationResponse>` |
| 미읽음 수 | `GET /api/notifications/unread-count` | `UnreadNotificationCountResponse` |
| 개별 읽음 | `PATCH /api/notifications/{id}/read` | NotificationResponse |
| 전체 읽음 | `PATCH /api/notifications/read-all` | Void |
| SSE | `GET /api/notifications/stream` | event-stream |

프론트는 초기 목록 조회와 SSE 실시간 추가를 함께 사용해야 한다. SSE만 사용하면 연결 이전 알림과 재연결 중 누락을 복구할 수 없다.

## 7. Backend 오류 계약

프론트가 최소한 분기해야 할 오류군:

| Domain | 대표 code | 화면 처리 |
|---|---|---|
| Global | `G001`~`G005`, `G999` | 입력 오류, 401 재발급, 403 금지, 404, 409, 서버 오류 |
| User/Auth | `U001`~`U006` | 사용자 없음, email/loginId/nickname 중복, 자격 증명·token 오류 |
| Team | `T001`~`T013` | 팀 없음, OWNER 필요, 이미 소속, category 중복 소속, 팀 마감, 탈퇴·강퇴·위임 오류 |
| Team application | `TA001`~`TA006` | 신청 없음, 중복 PENDING, 상태 전이 불가, 신청자/OWNER 권한 |
| Post | `P001`~`P002` | 게시글 없음, 작성자 권한 |
| Comment | `C001`~`C002` | 댓글 없음, 작성자 권한 |
| Notice | `N001` | 공지 없음 |
| Notification | `NT001` | 알림 없음/소유권 오류 |

신규 디자인처럼 mutation 직후 무조건 성공 navigation을 하면 401/403/409가 사용자에게 숨겨진다. code 기반 도메인 메시지와 field error를 구분해야 한다.

## 8. 신규 디자인과의 충돌 전수 목록

### 8.1 인증·사용자

| 충돌 | 신규 디자인 근거 | Backend 사실 | 판정 |
|---|---|---|---|
| in-memory 로그인 | `context/AuthContext.tsx`, `data/mockUsers.ts` | JWT access/refresh + `/users/me` 필요 | 반드시 교체 |
| role 소문자 | `UserRole='user'|'admin'` | `USER/ADMIN` | mapper 또는 타입 변경 |
| 관리자 role 토글 | `MyInfoPage.tsx` | role 변경 API 없음, 서버 role만 신뢰해야 함 | 제거 |
| loginId/joinedAt 표시 | AuthUser와 MyInfo UI | `/users/me`에 두 필드 없음 | 숨김 또는 Backend 확장 결정 |
| 회원정보 수정 | `/mypage/edit` | API 없음 | 운영 제외 또는 Backend 선행 |
| 비밀번호 변경 | `/mypage/change-password` | API 없음 | 운영 제외 또는 Backend 선행 |
| 비밀번호 찾기 | `/find-password` | API 없음 | 운영 제외 |
| 이메일 인증 | `/verify-email` | 정책상 현재 범위 제외, API 없음 | 운영 제외 |
| 회원 탈퇴 | MyInfo UI | 정책만 있고 API 없음 | 기능 비활성 |
| password 안내 문구 | “영문·숫자·특수문자 포함” | 실제 regex는 각 종류 포함을 강제하지 않음 | 문구 수정 또는 정책 강화 결정 |

### 8.2 Category·Team

| 충돌 | 신규 디자인 | Backend | 판정 |
|---|---|---|---|
| category 값 | `lol`, `valorant`, `pubg`, `fifa`, `soccer`, `basketball` 소문자 | String이며 canonical enum/목록 API 없음; 기존 프론트는 대문자 정규화 | 사용자 결정 필수 |
| category 누락 | 디자인에 futsal asset/category 없음이나 route에서는 futsal 사용 | 테스트·정책 예시는 `FUTSAL` 다수 | category 목록 확정 필요 |
| level | `즐겜/빡겜`, 멤버 티어 | 필드 없음 | 제거 또는 Backend 스키마/API 추가 |
| location | 온라인/지역명 | 필드 없음 | 제거 또는 Backend 추가 |
| 인원·정원 | roster/memberCount 형태 | 정원 정책·필드 없음 | “마감 임박/남은 자리” 표현 금지 |
| 팀 생성 폼 | name, level, location 중심 | name, description, category 필요 | 폼 재구성 |
| 팀 설정에서 이름 수정 | `/teams/:id/settings` | update endpoint 없음 | 입력 제거/readonly |
| 모집 재개 | 설정 화면 기대 가능 | close만 있고 reopen 없음 | 재개 버튼 금지 |
| 내 팀 | `MY_TEAMS` | 내 활성 팀 목록 endpoint 없음 | Backend 확장 또는 화면 축소 |
| 팀 role | `lib/teamRole.ts`가 Mock에서 결정 | 실제 TeamMember role 필요 | 서버 응답 기반으로 교체 |
| 신청자 level | `JOIN_REQUESTS.level` | owner response에 level 없음 | 열 제거 |
| 포메이션 | `/formation/:sport` | Entity/API 없음 | 운영 route 제외 |

### 8.3 Board·Notice

| 충돌 | 신규 디자인 | Backend | 판정 |
|---|---|---|---|
| board tab | 공지/자유/팀모집/질문 | 게시글 category는 활동 category | 정보 구조 결정 필요 |
| views | list/detail 표시 | 필드/API 없음 | 제거 |
| like | 상세 동작 | API 없음 | 제거 |
| report | 신고 modal | API 없음 | 제거 또는 Backend 선행 |
| 검색 | 검색 입력 | 검색 query/service 없음 | 비활성/제거 |
| 목록 풍부한 정보 | 본문 일부, views 등 | summary에는 title/author/date 중심 | summary 범위로 축소 |
| notice field 이름 | Mock가 `body` 등 화면형 구조 | API는 `content`, `authorName` | adapter 필요 |
| 글·댓글 수정 UI | 신규 상세에 완전한 edit flow 부족 | Backend는 지원 | UI 보강 대상 |

### 8.4 Admin

| 충돌 | 신규 디자인 | Backend | 판정 |
|---|---|---|---|
| 사용자 목록 | loginId/joinedAt/status | API 없음 | Mock 화면 운영 금지 |
| suspended 상태 | active/suspended | UserStatus는 ACTIVE/DELETED | 모델 불일치 |
| 사용자 정지/해제 | 콘솔 action 전제 | API 없음 | 운영 제외 |
| 신고 게시글·신고 수 | reportedPosts/reportCount | 신고 Entity/API 없음 | 운영 제외 |
| 통계 | 콘솔 카드 | 통계 API 없음 | 운영 제외 |
| 관리자 강제 삭제 | 정책 문서에는 존재 | Controller 없음 | 정책 확정·API 미구현 |
| 공지 관리 | 공지 작성/수정/삭제 | 실제 ADMIN API 있음 | 연결 가능 |

### 8.5 Notification·Routing

| 충돌 | 신규 디자인 | Backend | 판정 |
|---|---|---|---|
| 알림 데이터 원천 | local array | Page API + SSE | 전면 교체 |
| 이동 정보 | `targetPath` | `targetType,targetId` | navigation mapper 필요 |
| 읽음 처리 | local state | 개별/전체 read API | 실제 mutation 연결 |
| SSE | 구현 없음 | `/stream` 제공 | 기존 안정화 계층 유지 |
| 평면 route | `App.tsx`의 28개 Route | 인증/USER/ADMIN 및 team role 분리 필요 | 기존 route guard 구조에 page만 이식 |
| 페이지별 layout | 각 page에서 layout 사용 | 전역 Auth/SSE 수명 유지 필요 | persistent layout 구조 유지 |

## 9. Backend 정책-구현 불일치

이 항목은 신규 디자인 문제가 아니며 Backend에서 별도 결정·수정이 필요하다.

### B-01. 일반 팀 삭제가 관련 상태를 정리하지 않음 — P0

정책:

- 팀 삭제 시 `UserCategoryMembership`을 삭제한다.
- `TeamMember`는 INACTIVE가 되어야 한다.
- 승인·탈퇴·강퇴·위임·팀 삭제의 관련 변경은 한 트랜잭션에 둔다.

실제:

- `TeamService.deleteTeam()`은 OWNER 검증 후 `team.softDelete()`만 호출한다.
- 모든 active TeamMember 비활성화, category membership 삭제, PENDING application 정리가 없다.
- 반면 OWNER 혼자 `leaveTeam()`을 수행하는 경로는 위 정리를 수행한다.

영향:

- DELETE endpoint로 팀을 삭제한 사용자가 category 점유 row 때문에 같은 category의 새 팀 생성/가입 승인을 막힐 수 있다.
- 삭제 팀의 active TeamMember와 PENDING application이 잔존할 수 있다.

프론트 임시 대응으로 해결할 수 없으며, Backend에서 일반 삭제와 OWNER 단독 탈퇴 삭제의 정책을 통일해야 한다.

### B-02. 같은 팀 PENDING 신청 생성의 race condition — P0/P1

정책:

- 같은 팀 PENDING 중복 신청 금지.
- 단순 exists 후 insert만으로 중복을 방어하지 않는다고 명시.

실제:

- 생성 시 `existsByTeamIdAndApplicantIdAndStatus(PENDING)` 검사 후 insert한다.
- `team_applications`에는 PENDING 중복을 막는 unique constraint가 없다.
- 동시성 테스트는 동일 신청의 동시 승인, 다른 팀의 같은 category 동시 승인에 집중되어 있고 동시 신청 생성 방어는 확인되지 않았다.

영향:

- 같은 사용자의 빠른 double submit 또는 동시 요청에서 PENDING 두 건이 생성될 가능성이 있다.
- 프론트 버튼 disable은 UX 보조일 뿐 최종 방어가 아니다.

### B-03. 활성 OWNER 1명 DB 보장 미확인 — P1

정책:

- 한 팀의 active OWNER는 정확히 한 명.
- DB 제약과 트랜잭션으로 함께 보장.

실제:

- delegation은 한 transaction에서 role을 바꾸고 active OWNER 수를 사후 검사한다.
- migration에는 active OWNER 1명을 보장하는 unique/index constraint가 없다.

영향:

- 비정상 데이터나 별도 쓰기 경로가 생기면 DB가 마지막 방어선이 되지 못한다.

### B-04. 회원 탈퇴 정책은 있으나 orchestration API 없음 — P1

정책:

- User soft delete, 로그인 차단, 팀원 비활성화, category 점유 해제, OWNER 정책 연동.

실제:

- `User.softDelete()`와 관련 조회 처리 일부는 있지만 사용자 탈퇴 Controller/API가 없다.
- 여러 팀과 OWNER 관계를 한 번에 정리하는 application service가 확인되지 않았다.

영향:

- 신규 디자인의 회원 탈퇴 버튼을 연결할 대상이 없다.

### B-05. 관리자 정책 다수가 API 미구현 — P1

정책:

- 회원 목록·상태 변경·강제 탈퇴
- 게시글·댓글 강제 삭제
- 가입 신청 조회
- 감사 로그
- 통계

실제:

- 현재 `/api/admin/**`에서 확인되는 업무 API는 공지 생성·수정·삭제다.
- 공지 변경 audit는 있지만 모든 관리자 변경을 포괄하지 않는다.

### B-06. 알림 30일 삭제 batch 미확인 — P2

정책:

- 생성 후 30일이 지난 알림 Hard Delete.

실제:

- SSE heartbeat scheduler는 있으나 알림 보관 정리 scheduler/repository delete는 확인되지 않았다.

### B-07. category canonical 값이 없음 — P1

실제:

- Team/Post의 category는 길이 50 String이다.
- 서버가 `trim()`은 하지만 enum 검증이나 대소문자 canonicalization을 강제하지 않는다.
- category 목록 조회 API도 없다.
- 운영 MySQL baseline collation은 `utf8mb4_0900_ai_ci`여서 영문 대소문자는 비교·unique에서 같게 취급될 수 있지만, 저장·응답 표기는 정규화되지 않고 H2 등 다른 실행 환경과의 비교 동작도 별도로 검증해야 한다.

영향:

- `lol`, `LOL`, `LeagueOfLegends`가 UI·URL·DB에서 혼재할 수 있다.
- same-category membership 정책이 문자열 표현에 종속된다.

category는 단순 표시값이 아니라 중복 소속 제약의 key이므로 Frontend만 임의로 정하면 안 된다.

## 10. 바로 연결 가능한 화면과 보류해야 할 화면

### 10.1 Backend 변경 없이 연결 가능

- Login
- Signup과 loginId/nickname 중복 확인
- Logout
- MyInfo의 `email,nickname,role,status` 조회
- Team list/detail/create/close/delete
- Team application create/list/cancel/approve/reject
- Member list/leave/kick/owner delegation
- Post list/detail/create/update/delete
- Comment list/create/update/delete
- Notice list/detail
- Admin notice create/update/delete
- Notification list/unread/read/read-all/SSE

단, “연결 가능”은 신규 디자인 핸들러를 그대로 쓸 수 있다는 뜻이 아니다. 기존 Auth/API/SSE 계층과 response adapter에 연결해야 한다.

### 10.2 Backend 선행 없이는 운영 금지

- EditInfo
- ChangePassword
- FindPassword
- EmailVerify
- User withdrawal
- Team edit/reopen
- My active teams
- Formation
- Post search/views/like/report
- Admin user/report/statistics console

### 10.3 필드 축소로 운영 가능

- TeamCard: name/category/status/owner/date만 사용
- TeamDetail: description/owner/active members 사용, level/location 제거
- BoardList: title/author/date만 사용, views 제거
- PostDetail: 본문과 comments 사용, like/report 제거
- MyInfo: email/nickname/role/status만 표시
- TeamManage: 신청자 nickname/message/status/date만 표시, level 제거

## 11. 사용자 결정 필요 목록

### D-01. category canonical contract — 최우선

선택지:

1. Backend enum 또는 category table/API를 추가하고 Frontend는 id/label mapper 사용
2. Backend 변경 없이 고정 대문자 문자열 목록을 Frontend·문서에서 공유
3. 신규 디자인 소문자 id를 DB canonical 값으로 채택하고 기존 데이터·기존 프론트를 migration

추천:

- v1.2.0 단기에는 확정된 대문자 code 목록을 공유하고 label만 프론트에서 변환한다.
- 중장기에는 category master 또는 enum을 Backend 계약으로 승격한다.
- 어떤 선택이든 `FUTSAL` 포함 여부와 `LOL/VALORANT/PUBG/FIFA/SOCCER/BASKETBALL` 실제 목록을 먼저 확정해야 한다.

### D-02. 신규 디자인의 Backend 미지원 route 처리

선택지:

1. v1.2.0에서 route/menu 완전 제거
2. “준비 중” read-only 화면으로 유지하되 submit과 성공 표현 제거
3. Backend 작업을 별도 Phase로 선행한 뒤 노출

추천:

- 인증 복구나 민감한 관리자 기능은 “준비 중”도 오해를 만들 수 있어 route/menu 제거.
- 포메이션처럼 명백한 후속 기능은 비노출 보존 가능.

### D-03. Team 확장 필드

결정 대상:

- level
- location
- activity time
- capacity/member count
- member level

추천:

- Phase 10 통합에서는 모두 제거하고 현재 Backend DTO 범위로 카드와 폼을 축소한다.
- 제품상 필수라면 프론트에 임시 저장하지 말고 Team 스키마·DTO·검색·migration 정책을 먼저 설계한다.

### D-04. 게시판 정보 구조

선택지:

1. 기존처럼 활동 category별 게시판만 유지
2. `공지/자유/팀모집/질문`이라는 별도 boardType을 Backend에 추가
3. 공지는 `/notices`, 일반 글은 활동 category로 분리하고 신규 tab 일부만 제거

추천:

- v1.2.0에는 3번. 공지와 일반 게시글을 명확히 분리하고 unsupported tab은 제거한다.
- `team.category`와 `post boardType`을 같은 문자열 필드로 혼용하지 않는다.

### D-05. My Page 범위

선택지:

1. 현재 API 범위인 내 정보 조회 + 가입 신청 목록 + 알림만 제공
2. Backend에 내 소속 팀·정보 수정·비밀번호 변경·탈퇴 API를 선행 추가

추천:

- 우선 1번으로 통합하고 없는 기능은 버튼까지 숨긴다.
- 로그인 계정의 loginId/joinedAt 표시가 꼭 필요하면 `/users/me` 응답 확장을 별도 Backend 요구로 확정한다.

### D-06. Backend 정책-구현 gap 처리 순서

추천 우선순위:

1. B-01 일반 팀 삭제 정리
2. B-02 PENDING 신청 생성 동시성
3. B-07 category canonical contract
4. B-03 OWNER DB 보장
5. 회원 탈퇴·관리자·알림 retention은 제품 범위 확정 후

## 12. Phase 10 통합 시 금지해야 할 가정

- 신규 디자인의 Mock 데이터 필드는 곧 Backend 응답 필드라는 가정
- `user/admin` 소문자 role을 서버 role로 그대로 사용하는 것
- 버튼을 disable하면 중복 요청의 DB 정합성이 해결된다는 가정
- Team DELETE가 현재 모든 멤버십과 category 점유를 정리한다는 가정
- CLOSED 팀을 다시 RECRUITING으로 바꿀 수 있다는 가정
- TeamSummary를 반복 상세 호출로 보강하는 방식
- SSE 한 연결만으로 알림 내역의 완전성이 보장된다는 가정
- `/users/me`가 loginId와 가입일을 반환한다는 가정
- 공지, 게시판 type, 활동 category가 하나의 category 개념이라는 가정
- 정책 문서에 적힌 관리자 기능이 이미 Controller로 제공된다는 가정

## 13. 다음 결정 후의 안전한 진행 순서

1. D-01 category code와 URL 규칙 확정
2. D-02 미지원 route의 제거/비노출/Backend 선행 범위 확정
3. D-03 Team 필드 축소 또는 Backend 확장 결정
4. D-04 게시판 정보 구조 확정
5. D-05 My Page v1.2.0 범위 확정
6. Backend B-01/B-02를 그대로 둘지 별도 수정 Phase로 둘지 결정
7. 결정문을 기준으로 route ownership과 화면별 DTO adapter를 확정
8. 그 뒤에만 신규 디자인 page/component를 기존 Auth/API/SSE 구조에 이식

## 14. 조사 범위 밖

- Backend 수정, migration 작성, API 추가
- 신규 디자인 코드 checkout/merge
- 화면 이식과 CSS 수정
- 실제 API 연결
- Mock 삭제
- commit, push
- 배포 환경에서의 end-to-end 실행 검증
