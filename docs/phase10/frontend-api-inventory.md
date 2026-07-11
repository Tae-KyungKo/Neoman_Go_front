# Phase 10-1 Frontend API Inventory

## 공통 API 구조

- 공통 axios client: `src/api/client.js`
- Base URL: `import.meta.env.VITE_API_BASE_URL?.trim()` 또는 개발 fallback `http://localhost:8080`. 운영 빌드는 env 누락 시 throw. 근거: `src/api/client.js:3`, `src/api/client.js:5`, `src/api/client.js:9`.
- Authorization 주입: `/api/auth/reissue`를 제외하고 localStorage `accessToken`이 있으면 `Authorization: Bearer ...`를 추가한다. 근거: `src/api/client.js:18`.
- 응답 래퍼는 백엔드 `ApiResponse<T>{ success, code, message, data }`와 일치한다. 근거: backend `src/main/java/com/neomango/global/response/ApiResponse.java:6`.
- 공통 response interceptor로 401 재발급/원요청 재시도는 구현되어 있지 않다.

## API 호출 전체 목록

| Domain | Method | Endpoint | Caller | Page | Request | Used Response Fields | Auth | Client | Error Handling | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Auth | POST | `/api/auth/signup` | `signup(payload)` | `SignupPage` | `loginId,email,password,passwordConfirm,nickname` | `data`는 가입 성공 후 직접 사용 적음 | Public | axios `api` | `normalizeApiError` | 정상 | `src/api/authApi.js:3`, `src/pages/SignupPage.jsx:201`, backend `AuthController.java:46` |
| Auth | POST | `/api/auth/login` | `login(payload)` | `LoginPage`, `LoginPanel` | `loginId,password` | `accessToken,refreshToken` | Public | axios `api` | `normalizeApiError`, panel local error | 정상 | `src/api/authApi.js:7`, `src/auth/AuthContext.jsx:126`, backend `AuthController.java:51` |
| Auth | GET | `/api/auth/check-login-id?loginId=` | `checkLoginId(loginId)` | `SignupPage` | query `loginId` | `available` | Public | axios `api` | local status message | 정상 | `src/api/authApi.js:11`, `src/pages/SignupPage.jsx:131`, backend `AuthController.java:34` |
| Auth | GET | `/api/auth/check-nickname?nickname=` | `checkNickname(nickname)` | `SignupPage` | query `nickname` | `available` | Public | axios `api` | local status message | 정상 | `src/api/authApi.js:15`, `src/pages/SignupPage.jsx:166`, backend `AuthController.java:40` |
| Auth | POST | `/api/auth/reissue` | `reissue(payload)` | `AuthContext`, SSE auth recovery | `refreshToken` | `accessToken,refreshToken,tokenType,accessTokenExpiresIn` | Public by SecurityConfig | axios `api` without Authorization injection | catch clears auth in AuthContext | 정상, 동시성 위험 | `src/api/authApi.js:23`, `src/auth/AuthContext.jsx:179`, backend `AuthController.java:56` |
| Auth | POST | `/api/auth/logout` | `logout()` | 미사용 | 없음 | 없음 | Authenticated | 호출 안 함 | Promise rejection | 미사용 후보 / 계약 불일치 후보 | frontend `src/api/authApi.js:19`, backend `AuthController.java:61` |
| User | GET | `/api/users/me` | `getCurrentUser()` | Auth initialization/login | 없음 | `id,email,nickname,role,status` | Authenticated | axios `api` | auth failure clears auth | 정상 | `src/api/userApi.js:3`, `src/auth/AuthContext.jsx:93`, backend `UserController.java:24` |
| Team | GET | `/api/teams` | `getTeams(params)` | `TeamListPanel` | query `category`, optional pageable | `content,page metadata,id,name,category,status,ownerNickname,createdAt` | Public | axios `api` | panel state | 정상 | `src/api/teamApi.js:3`, `src/components/TeamListPanel.jsx:40`, backend `TeamController.java:52` |
| Team | GET | `/api/teams` | `getTeamsByCategory(category)` | 확인된 import 없음 | query `category` | 확인 필요 | Public | axios `api` | caller 없음 | 미사용 후보 | `src/api/teamApi.js:7` |
| Team | GET | `/api/teams/{teamId}` | `getTeam(teamId)` | `TeamDetailPanel`, notification navigation | path `teamId` | `id,name,description,category,status,owner,members,createdAt` | Public | axios `api` | panel/hook local error | 정상 | `src/api/teamApi.js:13`, `src/components/TeamDetailPanel.jsx:38`, backend `TeamController.java:64` |
| Team | POST | `/api/teams` | `createTeam(payload)` | `TeamCreatePanel` | `name,description,category` | `id,name,category,status,ownerNickname,createdAt` | Authenticated | axios `api` | `isSubmitting`, local error | 정상 | `src/api/teamApi.js:17`, `src/components/TeamCreatePanel.jsx:24`, backend `TeamController.java:122` |
| Team | PATCH | `/api/teams/{teamId}/close` | `closeTeam(teamId)` | 확인된 호출 없음 | 없음 | 없음 | Authenticated, owner by service | 호출 안 함 | Promise rejection | 미사용 후보 / 프론트 구현 없음 | frontend `src/api/teamApi.js:21`, backend `TeamController.java:161` |
| Team | DELETE | `/api/teams/{teamId}` | `deleteTeam(teamId)` | 확인된 호출 없음 | 없음 | 없음 | Authenticated, owner by service | 호출 안 함 | Promise rejection | 미사용 후보 / 프론트 구현 없음 | frontend `src/api/teamApi.js:28`, backend `TeamController.java:174` |
| TeamMember | GET | `/api/teams/{teamId}/members` | `getTeamMembers(teamId)` | `TeamMemberManagementPanel` | path `teamId` | `teamMemberId,userId,nickname,role,status` | Authenticated | axios `api` | local error | 정상 | `src/api/teamApi.js:35`, `src/components/TeamMemberManagementPanel.jsx:70`, backend `TeamController.java:69` |
| TeamMember | POST | `/api/teams/{teamId}/members/me/leave` | `leaveTeam(teamId)` | `TeamMemberManagementPanel` | path `teamId` | no data | Authenticated | axios `api` | `processingKey`, local error | 정상 | `src/api/teamApi.js:39`, backend `TeamController.java:81` |
| TeamMember | POST | `/api/teams/{teamId}/members/{teamMemberId}/kick` | `kickMember(teamId, teamMemberId)` | `TeamMemberManagementPanel` | path ids | no data | Authenticated, owner by service | axios `api` | `processingKey`, local error | 정상 | `src/api/teamApi.js:43`, backend `TeamController.java:94` |
| TeamMember | POST | `/api/teams/{teamId}/owner/delegate` | `delegateOwner(teamId,targetTeamMemberId)` | `TeamMemberManagementPanel` | `targetTeamMemberId` | no data | Authenticated, owner by service | axios `api` | `processingKey`, local error | 정상 | `src/api/teamApi.js:47`, backend `TeamController.java:108` |
| TeamApplication | POST | `/api/teams/{teamId}/applications` | `applyToTeam(teamId,payload)` | `TeamApplicationPanel` | `message` max 500 | `applicationId/teamId/teamName/status/message` | Authenticated | axios `api` | `isSubmitting`, local error | 정상 | `src/api/applicationApi.js:3`, `src/components/TeamApplicationPanel.jsx:28`, backend `TeamController.java:135` |
| TeamApplication | GET | `/api/me/team-applications` | `getMyApplications()` | `MyTeamApplicationsPanel`, `TeamDetailPage` | 없음 | `applicationId,teamId,teamName,category,status,message,createdAt` | Authenticated | axios `api` | panel local error | 정상 | `src/api/applicationApi.js:7`, backend `MyTeamApplicationController.java:26` |
| TeamApplication | GET | `/api/teams/{teamId}/applications` | `getTeamApplications(teamId)` | `OwnerTeamApplicationsPanel` | path `teamId` | `applicationId,applicantId,applicantNickname,teamId,teamName,status,message,createdAt` | Authenticated, owner by service | axios `api` | panel local error | 정상 | `src/api/applicationApi.js:11`, backend `TeamController.java:149` |
| TeamApplication | PATCH | `/api/team-applications/{applicationId}/cancel` | `cancelApplication(applicationId)` | `MyTeamApplicationsPanel` | path `applicationId` | response mostly ignored | Authenticated | axios `api` | `cancelingId` | 정상 | `src/api/applicationApi.js:15`, backend `TeamApplicationController.java:26` |
| TeamApplication | POST | `/api/team-applications/{applicationId}/approve` | `approveApplication(applicationId)` | `OwnerTeamApplicationsPanel` | path `applicationId` | response mostly ignored | Authenticated, owner by service | axios `api` | `processingId` | 정상, 동시성은 backend 책임 | `src/api/applicationApi.js:19`, backend `TeamApplicationController.java:38` |
| TeamApplication | POST | `/api/team-applications/{applicationId}/reject` | `rejectApplication(applicationId)` | `OwnerTeamApplicationsPanel` | path `applicationId` | response mostly ignored | Authenticated, owner by service | axios `api` | `processingId` | 정상 | `src/api/applicationApi.js:23`, backend `TeamApplicationController.java:50` |
| Post | GET | `/api/categories/{category}/posts` | `getPosts(category,params)` | `PostListPanel` | path `category`, page/size | `content,id,category,title,authorNickname,createdAt,page metadata` | Public | axios `api` | panel state | 정상 | `src/api/postApi.js:3`, `src/components/PostListPanel.jsx:44`, backend `PostController.java:50` |
| Post | GET | `/api/posts/{postId}` | `getPost(postId)` | `PostDetailPanel`, notification navigation | path `postId` | `id,category,title,content,authorNickname,createdAt,updatedAt` | Public | axios `api` | panel/hook local error | 정상 | `src/api/postApi.js:7`, `src/components/PostDetailPanel.jsx:114`, backend `PostController.java:58` |
| Post | POST | `/api/categories/{category}/posts` | `createPost(category,payload)` | `PostCreatePanel` | `title,content` | `id,category,title,content` | Authenticated | axios `api` | `isSubmitting`, local validation | 정상 | `src/api/postApi.js:11`, `src/components/PostCreatePanel.jsx:51`, backend `PostController.java:36` |
| Post | PATCH | `/api/posts/{postId}` | `updatePost(postId,payload)` | `PostDetailPanel` | `title,content` | updated post | Authenticated, author by service | axios `api` | `processingKey` | 정상 | `src/api/postApi.js:15`, `src/components/PostDetailPanel.jsx:233`, backend `PostController.java:63` |
| Post | DELETE | `/api/posts/{postId}` | `deletePost(postId)` | `PostDetailPanel` | path `postId` | no data | Authenticated, author by service | axios `api` | `processingKey` | 정상 | `src/api/postApi.js:19`, `src/components/PostDetailPanel.jsx:275`, backend `PostController.java:76` |
| Comment | GET | `/api/posts/{postId}/comments` | `getComments(postId,params)` | `PostDetailPanel` | page/size | `content,id,content,authorNickname,createdAt,updatedAt,page metadata` | Public | axios `api` | local error | 정상 | `src/api/commentApi.js:3`, `src/components/PostDetailPanel.jsx:165`, backend `CommentController.java:49` |
| Comment | POST | `/api/posts/{postId}/comments` | `createComment(postId,payload)` | `PostDetailPanel` | `content` | response ignored, refresh list | Authenticated | axios `api` | `processingKey`, local validation | 정상 | `src/api/commentApi.js:7`, `src/components/PostDetailPanel.jsx:305`, backend `CommentController.java:35` |
| Comment | PATCH | `/api/comments/{commentId}` | `updateComment(commentId,payload)` | `PostDetailPanel` | `content` | response ignored, refresh list | Authenticated, author by service | axios `api` | `processingKey` | 정상 | `src/api/commentApi.js:11`, `src/components/PostDetailPanel.jsx:342`, backend `CommentController.java:57` |
| Comment | DELETE | `/api/comments/{commentId}` | `deleteComment(commentId)` | `PostDetailPanel` | path `commentId` | no data | Authenticated, author by service | axios `api` | `processingKey` | 정상 | `src/api/commentApi.js:15`, `src/components/PostDetailPanel.jsx:382`, backend `CommentController.java:70` |
| Notice | GET | `/api/notices` | `getNotices({page,size})` | `NoticeListPanel`, `AdminNoticePage` | page/size | `content,id,title,createdAt,page metadata` | Public | axios `api` | panel state | 정상 | `src/api/noticeApi.js:15`, `src/components/NoticeListPanel.jsx:35`, backend `NoticeController.java:23` |
| Notice | GET | `/api/notices/{noticeId}` | `getNotice(noticeId)` | `NoticeDetailPanel` | path `noticeId` | `id,title,content,createdAt,updatedAt` | Public | axios `api` | panel state | 정상 | `src/api/noticeApi.js:21`, `src/components/NoticeDetailPanel.jsx:53`, backend `NoticeController.java:28` |
| Admin | POST | `/api/admin/notices` | `createNotice({accessToken,title,content})` | `NoticeCreatePanel` | `title,content` | created notice `id` | Admin | axios `api` + explicit header | local validation/isSubmitting | 정상, 중복 header 방식 | `src/api/noticeApi.js:25`, `src/components/NoticeCreatePanel.jsx:29`, backend `AdminNoticeController.java:31` |
| Admin | PATCH | `/api/admin/notices/{noticeId}` | `updateNotice(...)` | `NoticeDetailPanel` | `title,content` | response ignored | Admin | axios `api` + explicit header | `processingKey` | 정상, 중복 header 방식 | `src/api/noticeApi.js:33`, backend `AdminNoticeController.java:44` |
| Admin | DELETE | `/api/admin/notices/{noticeId}` | `deleteNotice(...)` | `NoticeDetailPanel` | path `noticeId` | no data | Admin | axios `api` + explicit header | `processingKey` | 정상, 중복 header 방식 | `src/api/noticeApi.js:41`, backend `AdminNoticeController.java:57` |
| Notification | GET | `/api/notifications` | `getNotifications(params)` | `NotificationPage` | page/size | `content` or array, `id,type,title,message,targetType,targetId,read,readAt,createdAt` | Authenticated | axios `api` | auth error clears auth | 정상 | `src/api/notificationApi.js:3`, `src/pages/notifications/NotificationPage.jsx:64`, backend `NotificationController.java:30` |
| Notification | GET | `/api/notifications/unread-count` | `getUnreadNotificationCount()` | `NotificationBell`, `NotificationPage` | 없음 | `count` or `unreadCount` | Authenticated | axios `api` | bell local error, page auth clear | 정상 | `src/api/notificationApi.js:7`, `src/components/notifications/NotificationBell.jsx:35`, backend `NotificationController.java:40` |
| Notification | PATCH | `/api/notifications/{notificationId}/read` | `markNotificationAsRead(notificationId)` | `NotificationPage` | path `notificationId` | no data | Authenticated | axios `api` | `processingId` | 정상 | `src/api/notificationApi.js:11`, `src/pages/notifications/NotificationPage.jsx:127`, backend `NotificationController.java:49` |
| Notification | PATCH | `/api/notifications/read-all` | `markAllNotificationsAsRead()` | `NotificationPage` | 없음 | no data | Authenticated | axios `api` | `isMarkingAll` | 정상 | `src/api/notificationApi.js:15`, `src/pages/notifications/NotificationPage.jsx:167`, backend `NotificationController.java:60` |
| Notification | GET/SSE | `/api/notifications/stream` | `connectNotificationStream` | `MainLayout` via `useNotificationStream` | Authorization header | event `connected`, event `notification` JSON | Authenticated | `fetchEventSource` | hook status/error, one auth reissue attempt | 정상, 재연결 정책 확인 필요 | `src/api/notificationStreamClient.js:23`, `src/hooks/useNotificationStream.js:63`, backend `NotificationSseController.java:23` |

## 직접 fetch 호출 목록

- 브라우저 `fetch(` 직접 호출은 확인되지 않았다.
- SSE는 `@microsoft/fetch-event-source`의 `fetchEventSource`를 사용한다. 근거: `src/api/notificationStreamClient.js:1`.

## 공통 API 계층 목록

- `src/api/client.js`: axios instance, base URL, Authorization request interceptor, error normalization.
- 도메인 API 파일: `authApi`, `userApi`, `teamApi`, `applicationApi`, `postApi`, `commentApi`, `noticeApi`, `notificationApi`, `notificationStreamClient`.
- `src/api/clients.js`는 파일명상 후보이나 현재 조사 출력에서 사용 근거가 부족하다. 확인 필요.

## 하드코딩된 URL

- `http://localhost:8080`: `src/api/client.js:9`, `.env`, `.env.example`, `.env.development.example`.
- `https://api.neomango.kr`: `.env.production`, `.env.production.example`.
- `127.0.0.1` 하드코딩은 확인되지 않았다.

## API Base URL 생성 방식

- 일반 API: axios `baseURL` + `/api/...`.
- SSE: `${API_BASE_URL}/api/notifications/stream`. `API_BASE_URL` 끝 slash가 있을 때 `//api`가 될 수 있는 정규화 로직은 없다.
- Vite proxy는 설정되어 있지 않다.

## 같은 API를 여러 위치에서 호출하는 경우

- `GET /api/notifications/unread-count`: `NotificationBell`, `NotificationPage`.
- `GET /api/teams/{teamId}`: `TeamDetailPanel`, notification navigation.
- `GET /api/posts/{postId}`: `PostDetailPanel`, notification navigation.
- `GET /api/notices`: public notice list와 admin notice management에서 공유.

## DTO를 서로 다르게 해석하는 경우

- 로그인/토큰 응답은 `data.data`, `data`, `data.result`를 모두 허용한다. 백엔드 현재 래퍼는 `data.data`가 정식이다. 근거: `src/auth/AuthContext.jsx:10`, `src/api/authApi.js:31`.
- 알림 목록은 `data.data`가 배열이거나 `data.data.content`인 경우를 모두 허용한다. 백엔드는 `Page<NotificationResponse>`이므로 `content`가 정식이다. 근거: `src/pages/notifications/NotificationPage.jsx:17`, backend `NotificationController.java:30`.
- unread count는 `count` 또는 `unreadCount`를 모두 허용한다. 백엔드 DTO 필드명은 확인 필요이나 `UnreadNotificationCountResponse` 존재는 확인됨.

## 중복 요청 가능성

- 생성/수정/삭제 버튼은 대체로 `isSubmitting`, `processingKey`, `processingId`, `cancelingId`로 중복 클릭을 막는다.
- 목록 조회 `useEffect`는 cleanup의 `isActive`로 stale setState를 막지만 React StrictMode 개발 환경에서는 네트워크 요청 자체가 2회 발생할 수 있다.
- 공통 axios 401 재발급 큐가 없어서 여러 API 요청이 동시에 401을 받으면 자동 재발급 자체가 수행되지 않는다. 현재 재발급은 AuthContext 직접 호출 또는 SSE hook에서만 수행한다.
