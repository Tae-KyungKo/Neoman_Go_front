# Phase 10-1 Form Validation Mapping

## 기준

- Backend 실제 DTO validation과 `UserPolicy`, `PostPolicy`, `CommentPolicy`가 최종 기준이다.
- 신규 디자인 `src/lib/validation.ts`와 각 submit/click handler를 함께 조사했다.
- 신규 디자인의 `FormField`/`TextareaField`는 HTML `required`, `maxLength`를 자동 부여하지 않는다.

| 화면 | 필드 | 신규 디자인 입력 | Backend DTO | 필수 | 길이 | 형식·정규식 | 중복 확인 | 불일치 | 수정 방향 |
|---|---|---|---|---|---|---|---|---|---|
| 로그인 | loginId | 상태값, 형식 검증 없음 | `LoginRequest.loginId` | 예 | 4~12 | `^[A-Za-z0-9]{4,12}$` | 해당 없음 | 디자인 submit이 mock만 검사 | 기존 login validator와 API 사용 |
| 로그인 | password | 상태값, 형식 검증 없음 | `LoginRequest.password` | 예 | Backend login에는 길이 pattern 없음 | 없음 | 해당 없음 | signup 정책과 달리 login DTO는 NotBlank만 | 비어 있음만 사전 검증 |
| 회원가입 | loginId | `validateLoginId` | `SignupRequest.loginId` | 예 | 4~12 | 동일 | Backend check API | 디자인은 형식만 검사 | blur/button 중복 확인 상태 필수 |
| 회원가입 | password | `validatePassword` | `SignupRequest.password` | 예 | 8~16 | Backend와 동일 ASCII 허용 집합 | 해당 없음 | 안내 문구는 “영문·숫자·특수문자 포함”이나 regex는 조합을 강제하지 않음 | 실제 regex에 맞춰 문구 수정 |
| 회원가입 | passwordConfirm | 일치 검사 | `SignupRequest.passwordConfirm` | 예 | 별도 제한 없음 | password 일치 | 해당 없음 | 일치 | 유지 |
| 회원가입 | email | 단순 email regex | `SignupRequest.email` | 예 | 명시 없음 | `@Email` | DB unique, 사전 check API 없음 | 신규 디자인은 unique 확인 불가 | submit 409 U002 처리 |
| 회원가입 | nickname | 2~12, 예약어 | `SignupRequest.nickname` | 예 | 2~12 | 예약어는 service policy | Backend check API | 디자인은 API 확인 없음 | 중복 확인 및 U004/U005 처리 |
| 팀 생성 | name | trim non-empty만 | `TeamCreateRequest.name` | 예 | 최대 50 | NotBlank | 해당 없음 | maxLength 없음 | 50자 제한·field error 추가 |
| 팀 생성 | description | 자유 textarea | `TeamCreateRequest.description` | 아니오 | 최대 500 | 없음 | 해당 없음 | maxLength 없음 | 500자 제한, 빈 값 null 허용 |
| 팀 생성 | category | chip | `TeamCreateRequest.category` | 예 | 최대 50 | enum 아님, 문자열 | 해당 없음 | 디자인 id와 Backend category 대소문자 계약 필요 | 기존 `normalizeCategoryCode` 사용 |
| 팀 생성 | level/location/time | 필수 아님 | DTO 필드 없음 | - | - | - | - | Backend 미지원 | 운영 저장 필드로 오인하지 말고 UI 제외 |
| 팀 수정 | name/description | name input만 | 수정 DTO 없음 | - | - | - | - | API 자체 없음 | 운영 제외 |
| 가입 신청 | message | textarea | `TeamApplicationCreateRequest.message` | 아니오 | 최대 500 | 없음 | 상태/중복은 Backend | 디자인 maxLength 없음 | 500자 제한, 409 TA002 처리 |
| 게시글 작성 | category | select `공지/자유/팀모집/질문` | path `{category}` | 예 | 문자열 | Backend enum 없음 | 해당 없음 | 디자인 tab과 운영 category가 다른 개념 | 팀/게임 category route 값을 사용 |
| 게시글 작성 | title | trim non-empty만 | `PostCreateRequest.title` | 예 | 1~100 | NotBlank | 해당 없음 | maxLength 없음 | 100자 제한 |
| 게시글 작성 | content | trim non-empty만 | `PostCreateRequest.content` | 예 | 1~5000 | NotBlank | 해당 없음 | maxLength 없음 | 5000자 제한 |
| 게시글 수정 | title/content | 신규 UI 없음 | `PostUpdateRequest` | 예 | 100/5000 | 작성자만 | 해당 없음 | 기존 운영 기능 누락 | 기존 edit UI 유지 또는 신규 edit 설계 |
| 댓글 작성 | content | trim non-empty만 | `CommentCreateRequest.content` | 예 | 1~1000 | NotBlank | 해당 없음 | maxLength 없음 | 1000자 제한 |
| 댓글 수정 | content | 신규 UI 없음 | `CommentUpdateRequest.content` | 예 | 1~1000 | 작성자만 | 해당 없음 | 기존 운영 기능 누락 | 기존 edit UI 유지 |
| 공지 작성/수정 | title | non-empty validation 없음 | Notice Create/Update | 예 | 최대 100 | NotBlank | 해당 없음 | 저장 버튼이 빈 값에도 활성 | 1~100 제한 |
| 공지 작성/수정 | content/body | non-empty validation 없음 | Notice Create/Update | 예 | 최대 5000 | NotBlank | 해당 없음 | 저장 버튼이 빈 값에도 활성 | 1~5000 제한 |
| 정보 수정 | nickname/email | 디자인 validator 사용 | DTO/API 없음 | - | - | - | - | Backend 미지원 | 운영 제외 |
| 비밀번호 변경/찾기 | password/OTP | 디자인 validator/6칸 | DTO/API 없음 | - | - | - | - | Backend 미지원 | 운영 제외 |

## 재검증된 인증 정책

- loginId: 영문 대소문자와 숫자만 4~12자.
- password: 8~16자이며 Backend regex가 허용한 ASCII 문자만 가능하다. 공백과 한글은 허용하지 않는다.
- passwordConfirm: 필수이며 service에서 불일치 시 U006.
- nickname: 2~12자. `관리자`, `운영자`, `admin`은 예약어.
- email/loginId/nickname: DB unique와 409 code가 최종 방어선이다.
- loginId와 nickname만 availability API가 있다. email availability API는 없다.
- 게시글: 제목 1~100, 본문 1~5000.
- 댓글: 본문 1~1000.
- 공지: 제목 최대 100, 본문 최대 5000이며 둘 다 NotBlank.

## 기존 Frontend와의 차이

- 기존 signup password regex `^[\x21-\x7E]{8,16}$`는 Backend보다 허용 범위가 넓다. Backend는 명시된 특수문자 집합만 허용하므로 기존 함수도 보정 대상이다.
- 기존 signup 예약어 배열은 `관리자`, `운영자`이고 Backend에는 `admin`도 포함된다.
- 기존 post/comment/notice/team form은 Backend 최대 길이를 대부분 반영한다.
- 신규 디자인은 auth 외 폼에 최대 길이 검증이 거의 없으므로 스타일만 이식하고 handler를 그대로 사용하면 안 된다.
