# 새 디자인 프로토타입 ↔ 백엔드 API 대응 감사

## 1. 결론

조사 기준 시점은 2026-07-25이며, 다음 소스를 직접 비교했다.

- 새 디자인 라우트: `src/App.tsx`
- 새 디자인 페이지와 입력 상태: `src/pages/*.tsx`
- 프론트 API 어댑터: `src/api/*.ts`
- 백엔드 Controller/Request/Response DTO: `../neomango/src/main/java/com/neomango/**`

`/mypage`는 별도 화면 없이 `/mypage/info`로 이동하는 redirect이므로 페이지 수에서 제외했다.
`ReportModal`은 독립 route는 아니지만 백엔드 기능 대응이 필요한 프로토타입 UI이므로 별도 항목으로 포함했다.

| 분류 | 의미 | 페이지/기능 수 |
|---|---|---:|
| 1 | API·endpoint·입력 필드가 모두 일치 | 8 |
| 2 | API·endpoint는 있으나 프로토타입 필드/경로 모델이 다름 | 4 |
| 3 | 프로토타입 UI는 있으나 관련 백엔드 메서드가 전혀 없음 | 6 |
| 4 | 백엔드 API는 있으나 대응 프론트 UI가 없음 | 4개 기능군 |
| 5 | 정적 화면, 오류 화면 또는 한 페이지에 지원/미지원 기능이 혼재 | 9개 route 화면 + 1개 내부 modal |

> “페이지가 존재한다”는 route 또는 실제 사용자 조작 UI가 존재한다는 뜻이다.
> 단순히 API 함수 파일이 존재하는 것은 페이지 존재로 계산하지 않았다.

## 2. 전체 프로토타입 페이지 종류

| 영역 | 페이지 | route |
|---|---|---|
| 공통 | 홈 | `/` |
| 인증 | 로그인 | `/login` |
| 인증 | 회원가입 | `/signup` |
| 인증 | 비밀번호 찾기/재설정 | `/find-password` |
| 인증 | 이메일 인증 | `/verify-email` |
| 팀 | 카테고리별 팀 탐색 | `/categories/:categoryId` |
| 팀 | 전체 팀 찾기 | `/teams` |
| 팀 | 팀 생성 | `/teams/new` |
| 팀 | 팀 상세/가입 신청 | `/teams/:teamId` |
| 팀 | 팀 설정 | `/teams/:teamId/settings` |
| 팀 | 가입 신청·팀원 관리 | `/teams/:teamId/manage` |
| 팀 | 팀 탈퇴 | `/teams/:teamId/leave` |
| 팀 | 포메이션 편집 | `/teams/:teamId/formation/:sport` |
| 마이페이지 | 내 정보 | `/mypage/info` |
| 마이페이지 | 내 팀·가입 신청 | `/mypage/teams` |
| 마이페이지 | 알림 | `/mypage/notifications` |
| 마이페이지 | 회원 정보 수정 | `/mypage/edit` |
| 마이페이지 | 비밀번호 변경 | `/mypage/change-password` |
| 게시판 | 게시글 목록 | `/board` |
| 게시판 | 게시글 작성 | `/board/new` |
| 게시판 | 게시글 상세·댓글 | `/board/:postId` |
| 공지 | 공지 목록 | `/notices` |
| 공지 | 공지 상세 | `/notices/:id` |
| 관리자 | 관리자 콘솔 | `/admin` |
| 관리자 | 공지 관리 | `/admin/notices` |
| 시스템 | 접근 거부 | `/forbidden` |
| 시스템 | 찾을 수 없음 | `*` |
| 게시판 부속 UI | 신고 modal | `PostDetailPage` 내부 |

## 3. 분류 1 — API·endpoint·입력 필드가 모두 일치

이 분류는 화면의 핵심 사용자 작업이 백엔드 계약과 일치하는 경우다. 응답을 화면 View Model로 변환하는 것은 정상적인 프론트 책임이므로 필드 불일치로 보지 않았다.

| 페이지 | 프로토타입 입력/동작 | 백엔드 계약 | 판정 |
|---|---|---|---|
| 로그인 | `loginId`, `password` | `POST /api/auth/login`, 동일 필드 | 일치 |
| 회원가입 | `loginId`, `password`, `passwordConfirm`, `email`, `nickname`; 아이디/닉네임 중복 확인 | `POST /api/auth/signup`, `GET /api/auth/check-login-id`, `GET /api/auth/check-nickname`; 동일 필드 | 일치 |
| 가입 신청·팀원 관리 | 신청 조회·승인·거절, 팀원 조회·강퇴 | `GET /api/teams/{teamId}/applications`, `POST /api/team-applications/{id}/approve|reject`, `GET /api/teams/{teamId}/members`, `POST .../{teamMemberId}/kick` | 일치 |
| 팀 탈퇴 | body 없는 탈퇴 확인 | `POST /api/teams/{teamId}/members/me/leave` | 일치 |
| 알림 | 목록, 개별 읽음, 전체 읽음 | `GET /api/notifications`, `PATCH /{id}/read`, `PATCH /read-all` | 일치 |
| 공지 목록 | page 기반 목록 | `GET /api/notices?page&size` | 일치 |
| 공지 상세 | id 조회, ADMIN 삭제 | `GET /api/notices/{id}`, `DELETE /api/admin/notices/{id}` | 일치 |
| 공지 관리 | `title`, `content` 생성·수정, id 삭제 | `POST/PATCH/DELETE /api/admin/notices`; Request DTO의 `title`, `content`와 동일 | 일치 |

### 주의

- 로그인·회원가입은 계약이 일치하지만 서버 validation 오류를 각 필드 아래에 표시하는 처리는 아직 제한적이다.
- 알림의 실시간 SSE endpoint(`/api/notifications/stream`)는 백엔드에 있으나 현재 전역 UI 연결이 보이지 않는다. 알림 “페이지의 REST 기능”은 일치하지만 실시간 기능은 분류 4에도 별도 기록했다.

## 4. 분류 2 — API·endpoint는 있으나 프로토타입 필드/경로 모델이 다름

| 페이지 | 백엔드에 있는 것 | 불일치 |
|---|---|---|
| 카테고리별 팀 탐색 | `GET /api/teams?category&page&size&sort` | 프로토타입 카드가 `level`, `location`, `activityTime`과 멤버 수를 사용하지만 `TeamSummaryResponse`에는 해당 값이 부족하다. UI의 `latest/casual/competitive` 필터도 서버 sort/field 계약과 직접 일치하지 않는다. |
| 전체 팀 찾기 | `GET /api/teams` | 같은 카드 필드 불일치가 있고, 현재 프론트 category 값과 백엔드 category 문자열 정책을 명시적으로 변환해야 한다. |
| 팀 생성 | `POST /api/teams`의 `name`, `description`, `category` | 프로토타입은 추가로 `level`, `location`, `activityTime`을 필수처럼 수집한다. 이 값은 `TeamCreateRequest`에 없다. |
| 게시글 목록 | `GET /api/categories/{category}/posts` | 프로토타입은 단일 `/board`에서 `전체/공지/자유/질문`, keyword 검색, 조회수, 댓글 수를 요구한다. 백엔드는 category가 path 필수이며 summary DTO에 조회수·댓글 수가 없고 keyword 검색 계약도 없다. |

### 실무적인 해결 방향

- 팀 카드 요구가 확정된 경우 목록마다 상세 API를 추가 호출하면 안 된다. 클라이언트 N+1이 되므로 `TeamSummaryResponse`를 필요한 최소 필드만 보강한다.
- `level`, `location`, `activityTime`이 실제 도메인 요구사항인지 먼저 결정해야 한다. 단순 표시용 문구라면 description에 합치지 말고 명확한 필드/enum으로 모델링한다.
- 게시판은 `/board?category=...`를 프론트 전용 route로 유지하되 API 호출 시 `/api/categories/{category}/posts`로 변환할 수 있다. “전체” 탭과 검색은 별도 backend query 계약이 필요하다.

## 5. 분류 3 — 프로토타입 UI는 있으나 관련 백엔드 메서드가 전혀 없음

| 페이지/기능 | 프로토타입 입력 | 누락된 백엔드 기능 |
|---|---|---|
| 비밀번호 찾기/재설정 | `loginId`, `email`, OTP 6자리, `newPassword`, `confirmPassword` | 계정 확인, 인증번호 발송/검증, reset token 발급, 비밀번호 재설정 전부 없음 |
| 이메일 인증 | 이메일 발송 안내, 인증 완료 확인/재전송 개념 | 인증 메일 발송·재전송·토큰 검증·인증 상태 변경 없음 |
| 회원 정보 수정 | `nickname`, `email` | `PATCH /api/users/me` 계열 endpoint와 Request DTO 없음 |
| 비밀번호 변경 | `currentPassword`, `newPassword`, `confirmPassword` | 인증 사용자 비밀번호 변경 endpoint 없음 |
| 포메이션 편집 | 선수 `name`, `role`, 위치/배치 | formation 조회·저장·수정 모델 및 endpoint 없음 |
| 관리자 콘솔 | 사용자 목록/상태, 신고 게시글 목록/처리 | ADMIN 사용자 관리, 신고 목록·처리, 통계 endpoint 없음 |

비밀번호 재설정은 보안상 “loginId+email이 맞으면 바로 변경”으로 구현하면 안 된다. 짧은 만료시간, 1회용 reset token, 시도 횟수 제한, 사용자 존재 여부를 노출하지 않는 응답 정책이 필요하다.

## 6. 분류 4 — 백엔드 API는 있으나 대응 프론트 UI가 없음

| 백엔드 기능 | endpoint | 프론트 누락 |
|---|---|---|
| Access Token 재발급 | `POST /api/auth/reissue` | 독립 페이지가 필요한 기능은 아니지만 현재 `src/api/authApi.ts`에 reissue 호출과 401 자동 재시도 흐름이 없다. |
| 게시글 수정 | `PATCH /api/posts/{postId}` | 수정 form/page/modal이 없다. 상세 화면의 수정 버튼은 실제 편집 UI로 이어지지 않는다. |
| 댓글 수정·삭제 | `PATCH/DELETE /api/comments/{commentId}` | 댓글별 수정·삭제 조작 UI가 없다. |
| 실시간 알림 stream | `GET /api/notifications/stream` | 전역 layout/header 수준의 SSE 연결과 reconnect/fallback UI가 없다. |

다음 기능은 “프론트 페이지가 없음”으로 오해하기 쉬우나 분류 4에서 제외했다.

- 카테고리별 게시판: 독립 route는 없지만 `/board` 안에 category tab UI가 있으므로 분류 2의 경로/필드 불일치다.
- 게시글/댓글 생성·삭제: `BoardWritePage`와 `PostDetailPage`에 UI가 있으므로 분류 5의 미연동 기능이다.
- 로그아웃: `MyInfoPage`와 Header에서 제공된다.

## 7. 분류 5 — 혼합 대응·정적·오류 페이지

| 페이지/기능 | 지원되는 부분 | 지원되지 않거나 판단 대상인 부분 |
|---|---|---|
| 홈 | category 화면 이동 | 정적 랜딩/탐색 화면이라 직접 대응해야 할 backend endpoint가 없다. |
| 팀 상세/가입 신청 | 상세 조회와 가입 신청 endpoint가 있고 신청 `message`는 일치 | 상세 데이터가 mock이며 프로토타입의 `level/location/activityTime/memberCount`가 DTO와 다르다. |
| 팀 설정 | 팀원 조회, OWNER 위임(`targetTeamMemberId`), 모집 마감, 삭제는 지원 | 팀명 입력을 저장할 팀 수정 endpoint가 없다. 하나의 페이지에 분류 1과 3이 섞인다. |
| 내 정보 | `GET /api/users/me`, logout 지원 | 탈퇴 button의 회원 탈퇴 endpoint가 없다. role 전환 UI는 개발용 mock이라 운영 UI에서 제거해야 한다. |
| 내 팀·가입 신청 | 내 가입 신청 조회·취소 지원 | “내가 소속된 팀” 목록 endpoint가 없어 해당 tab은 mock이다. |
| 게시글 작성 | backend는 category path + body `title`, `content`로 생성 가능 | UI는 동일 정보를 수집하지만 실제 API 호출 없이 목록으로 이동한다. category 한글 tab → 서버 category 값 변환 정책도 필요하다. |
| 게시글 상세·댓글 | 게시글 상세/삭제, 댓글 목록/생성 endpoint 존재 | 현재 전부 mock/local 동작이다. 조회수 필드는 DTO에 없고, 신고 API가 없으며, 댓글 수정·삭제 UI가 없다. |
| 접근 거부 | HTTP 403 또는 route guard 결과를 표현 | 독립 도메인 API와 비교할 대상이 아닌 시스템 화면이다. |
| 찾을 수 없음 | 잘못된 client route를 표현 | backend 404 DTO와 직접 대응하는 입력 화면이 아니다. API 404와 client route 404를 구분해야 한다. |
| 신고 modal | 사유 선택/제출 UI 존재 | 신고 생성 endpoint가 없다. `PostDetailPage`의 지원 API와 섞여 있으므로 modal 단독으로는 분류 3, 페이지 전체는 분류 5다. |

## 8. 백엔드 계약은 있으나 현재 프론트가 mock인 주요 기능

이 표는 위 5개 분류와 별개로 “계약 존재 여부”와 “실제 연동 완료 여부”를 혼동하지 않기 위한 구현 현황이다.

| 기능 | 계약 | 현재 프론트 |
|---|---|---|
| 팀 목록·상세·생성 | 존재 | mock 조회 / 생성은 navigate만 수행 |
| 게시글 목록·상세·작성·삭제 | 존재 | mock 조회 / 작성·삭제는 local 동작 |
| 댓글 목록·작성 | 존재 | mock/local 동작 |
| 내 정보 조회 | 존재 | AuthContext의 사용자 상태를 표시 |
| 공지 CRUD | 존재 | 실제 연동 |
| 알림 REST | 존재 | 실제 연동 |
| 팀 신청·승인·거절·강퇴·탈퇴·위임·마감·삭제 | 존재 | 실제 연동 |

즉, 분류 1은 “프로토타입 요구와 backend 계약이 일치”한다는 뜻이지 모든 화면이 이미 API와 연결되었다는 뜻은 아니다.

## 9. 추천 우선순위

1. **계약이 있는데 mock인 핵심 경로 연결**
   - 팀 목록/상세/생성
   - 게시글 목록/상세/작성/댓글
   - 내 정보 조회
2. **계약 불일치 확정**
   - 팀의 `level/location/activityTime`
   - 팀/게시글 목록 summary 필드
   - 게시판 “전체”와 keyword 검색 정책
3. **백엔드 신규 개발**
   - 회원 정보·비밀번호 변경
   - 보안 요건을 포함한 비밀번호 재설정/이메일 인증
   - 내가 소속된 팀 조회
   - 신고 및 관리자 처리
4. **후순위 또는 운영 범위 결정**
   - 포메이션
   - 관리자 통계/사용자 관리
   - SSE 전역 연결

## 10. 주의할 실수

- 목록 카드 필드를 채우려고 행마다 상세 API를 호출하지 않는다.
- 프론트의 한글 category label을 그대로 DB/domain 값으로 사용하지 않는다. 안정적인 code/enum 매핑을 둔다.
- “API 함수가 있음”과 “페이지가 API를 실제 호출함”을 같은 의미로 취급하지 않는다.
- 비밀번호 찾기에서 사용자 존재 여부를 응답 메시지로 노출하지 않는다.
- 팀 정원/가입 승인 정합성은 프론트 버튼 disable로 보장할 수 없다. backend transaction과 DB 제약/lock 전략이 최종 방어선이어야 한다.
- 신고/관리자 기능은 일반 사용자 endpoint와 권한 정책을 분리한다.
