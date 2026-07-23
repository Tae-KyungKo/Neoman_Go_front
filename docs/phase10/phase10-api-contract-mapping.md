# Phase 10-1 API Contract Mapping

## 공통 계약

- 성공: `ApiResponse<T>{ success, code, message, data }`
- 실패: `ErrorResponse{ status, code, message, errors? }`
- 인증: `Authorization: Bearer <accessToken>`
- Page: Spring `Page<T>`가 `ApiResponse.data`에 들어간다. 주요 필드는 `content`, `number`, `size`, `totalElements`, `totalPages`, `first`, `last`.
- 날짜: 대부분 `LocalDateTime`; 알림 `createdAt`만 KST offset이 포함된 `OffsetDateTime`.
- Backend 근거: `global/response/ApiResponse.java`, `global/exception/ErrorResponse.java`, 각 Controller/DTO.
- 신규 디자인에는 axios/fetch/EventSource 호출이 한 건도 없다. 아래의 “신규 상태”는 모두 연결 필요를 의미한다.

## Auth·User

| 기능 | 화면 | Method | Backend endpoint | Path/Query/Body | 요청 DTO | 응답 DTO | 인증·권한 | 주요 오류 | 기존 API 함수 | 신규 상태 | 판정 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| loginId 확인 | Signup | GET | `/api/auth/check-login-id` | query `loginId` | 없음 | `AvailabilityResponse{available}` | 공개 | 400 | `checkLoginId` | 형식 검사만 있음 | 그대로 재사용 |
| nickname 확인 | Signup | GET | `/api/auth/check-nickname` | query `nickname` | 없음 | `AvailabilityResponse` | 공개 | 400 | `checkNickname` | 예약어 로컬 검사만 있음 | 그대로 재사용 |
| 회원가입 | Signup | POST | `/api/auth/signup` | body 5필드 | `SignupRequest` | `UserResponse` | 공개 | U002~U006, 400/409 | `signup` | navigate만 수행 | 그대로 재사용 |
| 로그인 | Login | POST | `/api/auth/login` | `loginId,password` | `LoginRequest` | `TokenResponse` | 공개 | 400/401 | `login` via AuthContext | mock credential 비교 | 그대로 재사용 |
| 재발급 | 전역 | POST | `/api/auth/reissue` | `refreshToken` | `ReissueRequest` | `TokenResponse` | 공개 | 400/401 | `refreshTokensOnce` | 없음 | 그대로 재사용 |
| 로그아웃 | Header/MyInfo | POST | `/api/auth/logout` | body 없음 | 없음 | `Void` | 인증 | G002 | `logout` via AuthContext | state 제거만 함 | 그대로 재사용 |
| 내 정보 | MyInfo/Auth init | GET | `/api/users/me` | 없음 | 없음 | `MeResponse{id,email,nickname,role,status}` | 인증 | U001/G002 | `getCurrentUser` | hardcoded/in-memory | View Model 변환 필요 |
| 정보 수정 | EditInfo | - | 없음 | - | - | - | - | - | 없음 | mock navigate | 운영 제외 |
| 비밀번호 변경/찾기 | Change/FindPassword | - | 없음 | - | - | - | - | - | 없음 | step state만 변경 | 운영 제외 |
| 이메일 인증 | EmailVerify | - | 없음 | - | - | - | - | - | 없음 | local boolean | 운영 제외 |

## Team·Application

| 기능 | 화면 | Method | Backend endpoint | Path/Query/Body | 요청 DTO | 응답 DTO | 인증·권한 | 주요 오류 | 기존 API 함수 | 신규 상태 | 판정 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 팀 목록 | Category/TeamFind | GET | `/api/teams` | `category?`, `page,size,sort` | 없음 | `Page<TeamSummaryResponse>` | 공개 | 400 | `getTeams` | `TEAMS` 배열 | View Model 변환 필요 |
| 팀 상세 | TeamDetail | GET | `/api/teams/{teamId}` | path | 없음 | `TeamDetailResponse` | 공개 | T001/404 | `getTeam` | `getTeamById` | View Model 변환 필요 |
| 팀 생성 | TeamCreate | POST | `/api/teams` | `name,description,category` | `TeamCreateRequest` | `TeamResponse` | USER/ADMIN | T007/400/409 | `createTeam` | navigate만 수행 | 기존 함수 보정 |
| 팀 수정 | TeamSettings | - | 없음 | - | - | - | OWNER | - | 없음 | name input만 존재 | 운영 제외 |
| 모집 마감 | TeamSettings | PATCH | `/api/teams/{teamId}/close` | path | 없음 | `Void` | OWNER | T001/T002/T006 | `closeTeam` | dialog 후 navigate | 그대로 재사용 |
| 팀 삭제 | TeamSettings | DELETE | `/api/teams/{teamId}` | path | 없음 | `Void` | OWNER | T001/T002 | `deleteTeam` | dialog 후 navigate | 그대로 재사용 |
| 팀원 목록 | TeamDetail/Settings | GET | `/api/teams/{teamId}/members` | path | 없음 | `List<TeamMemberListResponse>` | 인증 | T001/G002 | `getTeamMembers` | team mock roster | View Model 변환 필요 |
| 팀 탈퇴 | TeamLeave | POST | `/api/teams/{teamId}/members/me/leave` | path | 없음 | `Void` | TEAM_MEMBER | T008/T010 | `leaveTeam` | navigate만 수행 | 그대로 재사용 |
| 팀원 강퇴 | Team manage | POST | `/api/teams/{teamId}/members/{teamMemberId}/kick` | path ids | 없음 | `Void` | OWNER | T002/T008/T009/T012 | `kickMember` | 신규 화면 동작 없음 | 그대로 재사용 |
| OWNER 위임 | TeamSettings | POST | `/api/teams/{teamId}/owner/delegate` | body `targetTeamMemberId` | `OwnerDelegationRequest` | `Void` | OWNER | T002/T011/T013 | `delegateOwner` | 선택 id 저장 없이 dialog | 기존 함수 보정 |
| 가입 신청 | TeamDetail | POST | `/api/teams/{teamId}/applications` | body `message?` max 500 | `TeamApplicationCreateRequest` | `TeamApplicationResponse` | USER | TA002/T003/T006/T007 | `applyToTeam` | modal close만 수행 | 그대로 재사용 |
| 내 신청 목록 | MyTeam | GET | `/api/me/team-applications` | 없음 | 없음 | `List<TeamApplicationSummaryResponse>` | USER | G002 | `getMyApplications` | `MY_APPLICATIONS` | View Model 변환 필요 |
| 신청 취소 | MyTeam | PATCH | `/api/team-applications/{id}/cancel` | path | 없음 | `TeamApplicationResponse` | 신청자 | TA004/TA005 | `cancelApplication` | 동작 없음 | 그대로 재사용 |
| OWNER 신청 목록 | TeamManage | GET | `/api/teams/{teamId}/applications` | path | 없음 | `List<TeamApplicationOwnerResponse>` | OWNER | TA006 | `getTeamApplications` | `JOIN_REQUESTS` | View Model 변환 필요 |
| 신청 승인 | TeamManage | POST | `/api/team-applications/{id}/approve` | path | 없음 | `TeamApplicationResponse` | OWNER | TA003/T002/T007 | `approveApplication` | 배열에서 제거 | 그대로 재사용 |
| 신청 거절 | TeamManage | POST | `/api/team-applications/{id}/reject` | path | 없음 | `TeamApplicationResponse` | OWNER | TA003/T002 | `rejectApplication` | 배열에서 제거 | 그대로 재사용 |
| 내 소속 팀 목록 | MyTeam | - | 없음 | - | - | - | USER | - | 없음 | `MY_TEAMS` | Backend 검토 필요 |
| 포메이션 | Formation | - | 없음 | - | - | - | MEMBER/OWNER | - | 없음 | mock drag/input | 운영 제외 |

`TeamSummaryResponse`에는 description, member count, level, location, activity time이 없다. 목록 카드가 이 값을 요구하면 목록마다 상세를 호출하지 말아야 한다. 이는 **클라이언트 N+1 위험**이며 다음 중 하나를 선택해야 한다.

- 목록 카드 축소: 기존 목록 DTO로 해결 가능.
- 상세 진입 후 표시: View Model 변환으로 해결 가능.
- 목록에서 반드시 필요: Backend 목록 DTO 보강 검토 필요.

## Post·Comment·Notice

| 기능 | 화면 | Method | Backend endpoint | Path/Query/Body | 요청/응답 | 인증·권한 | 주요 오류 | 기존 API 함수 | 신규 상태 | 판정 |
|---|---|---|---|---|---|---|---|---|---|---|
| 게시글 목록 | BoardList | GET | `/api/categories/{category}/posts` | category + pageable | `Page<PostSummaryResponse>` | 공개 | 400 | `getPosts` | `POSTS` | View Model 변환 필요 |
| 게시글 상세 | PostDetail | GET | `/api/posts/{postId}` | path | `PostResponse` | 공개 | P001 | `getPost` | `getPostById` | View Model 변환 필요 |
| 게시글 작성 | BoardWrite | POST | `/api/categories/{category}/posts` | body `title,content` | `PostCreateRequest`/`PostResponse` | USER | 400 | `createPost` | navigate만 | 그대로 재사용 |
| 게시글 수정 | PostDetail | PATCH | `/api/posts/{postId}` | body `title,content` | `PostUpdateRequest`/`PostResponse` | 작성자 | P001/P002 | `updatePost` | 신규 UI 누락 | 기존 UI 유지 |
| 게시글 삭제 | PostDetail | DELETE | `/api/posts/{postId}` | path | `Void` | 작성자 | P001/P002 | `deletePost` | navigate만 | 그대로 재사용 |
| 댓글 목록 | PostDetail | GET | `/api/posts/{postId}/comments` | pageable | `Page<CommentResponse>` | 공개 | P001 | `getComments` | post 내부 배열 | View Model 변환 필요 |
| 댓글 작성 | PostDetail | POST | `/api/posts/{postId}/comments` | body `content` | `CommentCreateRequest`/`CommentResponse` | USER | 400 | `createComment` | input clear만 | 그대로 재사용 |
| 댓글 수정/삭제 | PostDetail | PATCH/DELETE | `/api/comments/{commentId}` | body/path | `CommentUpdateRequest`/`Void` | 작성자 | C001/C002 | `updateComment`,`deleteComment` | 신규 UI 누락 | 기존 UI 유지 |
| 공지 목록 | NoticeList | GET | `/api/notices` | pageable | `Page<NoticeSummaryResponse>` | 공개 | - | `getNotices` | `NOTICES` | View Model 변환 필요 |
| 공지 상세 | NoticeDetail | GET | `/api/notices/{noticeId}` | path | `NoticeResponse` | 공개 | N001 | `getNotice` | array find | View Model 변환 필요 |
| 공지 작성 | AdminNotice | POST | `/api/admin/notices` | `title,content` | `NoticeCreateRequest`/`NoticeResponse` | ADMIN | 400/403 | `createNotice` | local mode 전환 | 그대로 재사용 |
| 공지 수정 | AdminNotice | PATCH | `/api/admin/notices/{noticeId}` | `title,content` | `NoticeUpdateRequest`/`NoticeResponse` | ADMIN | N001/403 | `updateNotice` | local mode 전환 | 그대로 재사용 |
| 공지 삭제 | AdminNotice | DELETE | `/api/admin/notices/{noticeId}` | path | `Void` | ADMIN | N001/403 | `deleteNotice` | modal close만 | 그대로 재사용 |
| 게시글 신고 | ReportModal | - | 없음 | - | - | USER | - | 없음 | modal close만 | 운영 제외 |

Post/Notice summary에는 본문, 조회수, 댓글 수가 없다. 목록에서 해당 값을 표시하려고 상세 API를 row마다 호출하면 **클라이언트 N+1 위험**이다. 현재 권장안은 목록 UI를 summary DTO 필드로 제한하는 것이다.

## Notification·SSE

| 기능 | 화면 | Method | Backend endpoint | 요청/응답 | 인증 | 기존 API | 신규 상태 | 판정 |
|---|---|---|---|---|---|---|---|---|
| 알림 목록 | Notifications | GET | `/api/notifications` | `Page<NotificationResponse>` | 인증 | `getNotifications` | hardcoded arrays | View Model 변환 필요 |
| 미읽음 수 | Header | GET | `/api/notifications/unread-count` | `{unreadCount}` | 인증 | `getUnreadNotificationCount` | 배열 계산 | 그대로 재사용 |
| 개별 읽음 | Notifications | PATCH | `/api/notifications/{id}/read` | `Void` | 소유 사용자 | `markNotificationAsRead` | local state만 | 그대로 재사용 |
| 전체 읽음 | Notifications | PATCH | `/api/notifications/read-all` | `Void` | 인증 | `markAllNotificationsAsRead` | local state만 | 그대로 재사용 |
| 실시간 stream | 전역 layout | GET SSE | `/api/notifications/stream` | `connected`, `notification` event | Bearer | `connectNotificationStream` | 없음 | 그대로 재사용 |

`NotificationResponse.createdAt`은 KST offset을 포함하지만 `readAt`은 `LocalDateTime`이다. UI formatter에서 두 형식을 모두 처리해야 한다. target은 `TEAM`, `TEAM_APPLICATION`, `POST`이며 기존 `useNotificationNavigation` 정책을 재사용한다.

## 오류 처리 기준

| HTTP | 의미 | Frontend 처리 |
|---|---|---|
| 400 | DTO validation, 형식 오류 | `ErrorResponse.errors[]`를 field error로 매핑 |
| 401 | access token 없음/만료 | 기존 axios single-flight reissue 후 1회 재시도 |
| 403 | ADMIN/OWNER/작성자/신청자 권한 실패 | 재발급하지 말고 403 UI 또는 이전 화면 |
| 404 | 리소스 없음 | 화면 NotFound/empty와 API error를 구분 |
| 409 | 중복·상태 전이·도메인 제약 | code별 사용자 메시지, 낙관적 성공 금지 |

핵심 code는 `U002~U006`, `T001~T013`, `TA001~TA006`, `P001~P002`, `C001~C002`, `N001`, `NT001`이다.
