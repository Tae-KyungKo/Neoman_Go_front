# AGENTS.md - NeomanGo Frontend

이 문서는 Codex가 `neomango_front` 레포지토리에서 작업할 때 따라야 하는 규칙을 정의한다.

---

## 1. 프로젝트 목적

이 프로젝트는 너만고 백엔드 API를 검증하기 위한 React + Vite 기반 프론트엔드다.

현재 단계의 목적은 최종 사용자용 UI 완성이 아니라, 백엔드 Phase 1~4 기능을 로컬에서 빠르게 검증하는 것이다.

우선순위는 다음과 같다.

```text
API 흐름 검증 > 상태 변화 확인 > 권한 정책 확인 > 디자인 완성도
```

---

## 2. 기술 스택

사용 기술:

```text
- React
- Vite
- JavaScript
- Axios
```

초기 검증 UI 단계에서는 다음 기술을 도입하지 않는다.

```text
- TypeScript
- Redux
- Zustand
- React Query
- Tailwind CSS
- Next.js
```

위 기술들은 필요성이 명확해진 후 별도 리팩토링 단계에서 검토한다.

---

## 3. 개발 원칙

- 단일 페이지 기반으로 시작한다.
- 복잡한 라우팅을 도입하지 않는다.
- `useState`, `useEffect` 중심으로 구현한다.
- API 호출 결과를 화면과 로그 패널에 명확히 표시한다.
- 성공/실패 응답을 숨기지 않는다.
- 백엔드 Response DTO 구조를 기준으로 화면을 구성한다.
- 백엔드 Entity 구조를 직접 추측하지 않는다.
- 임의의 API 필드명을 만들지 않는다.
- 디자인보다 백엔드 정책 검증을 우선한다.
- 컴포넌트는 과하게 분리하지 않는다.
- 중복 제거보다 흐름 가독성을 우선한다.
- css는 사용하지 않아도 되고, 가독성을 위해서라도 최소한으로 사용한다.
- 추가 정보가 필요하면 요청하고, 백엔드 구조나 코드도 필요시 요청한다.

---

## 4. 인증 처리

JWT Access Token은 `localStorage`에 저장한다.

Axios interceptor에서 다음 형식으로 Authorization Header를 추가한다.

```text
Authorization: Bearer {accessToken}
```

Refresh Token 처리는 백엔드 정책에 맞춰 후속 단계에서 연결한다.

초기 검증 UI에서는 Access Token 기반 API 호출 검증을 우선한다.

---

## 5. 환경 변수

API base URL은 `.env`의 값을 사용한다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

`.env`는 커밋하지 않는다.

`.env.example`은 커밋한다.

`.env.example` 예시:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 6. 주요 검증 대상

Phase 1~4 기준으로 다음 기능을 검증한다.

```text
- 로그인/로그아웃
- 비회원 조회 가능 여부
- 카테고리 선택
- 카테고리별 팀 목록 조회
- 팀 생성
- 팀 상세 조회
- 팀 가입 신청
- 가입 신청 취소
- 가입 신청 승인/거절
- 같은 카테고리 다른 PENDING 신청 자동 CANCELED
- 팀원 목록 조회
- 일반 MEMBER 탈퇴
- OWNER의 팀원 강퇴
- OWNER 위임
- OWNER 단독 탈퇴 시 팀 DELETED 처리
```

이후 개발 진행에 따라 phase 4 이후 내용도 검증을 할 것이다.

---

## 7. 서비스 구조 이해

너만고는 카테고리별 독립 공간을 가진다.

```text
메인 페이지
→ 카테고리 선택
→ 카테고리 전용 페이지
   → 팀 목록 / 팀 생성 / 팀 가입 신청
   → 자유게시판
   → 매칭 보드
```

예시 카테고리:

```text
- 리그오브레전드
- 발로란트
- 배틀그라운드
- 피파
- 풋살
- 축구
- 농구
```

각 카테고리는 독립된 서비스 공간처럼 동작한다.

예를 들어 `리그오브레전드` 카테고리에서는 `리그오브레전드` 팀 목록, 자유게시판, 매칭 보드가 표시되어야 한다.

다른 카테고리의 데이터가 섞이면 안 된다.

---

## 8. 사용자 접근 정책

### 8.1 비회원

비회원은 조회 중심 기능만 사용할 수 있다.

가능한 기능:

```text
- 메인 페이지 접근
- 카테고리 선택
- 카테고리별 팀 목록 조회
- 카테고리별 게시글 목록 조회
- 게시글 상세 조회
- 카테고리별 매칭 보드 조회
```

불가능한 기능:

```text
- 팀 생성
- 팀 가입 신청
- 게시글 작성
- 댓글 작성
- 게시글 수정/삭제
- 댓글 수정/삭제
- 매칭 생성
- 매칭 신청
```

비회원이 참여 기능을 시도하면 로그인 요구 응답을 표시한다.

### 8.2 로그인 회원

로그인 회원은 생성, 신청, 작성 기능을 사용할 수 있다.

가능한 기능:

```text
- 팀 생성
- 팀 가입 신청
- 게시글 작성
- 댓글 작성
- 본인 게시글 수정/삭제
- 본인 댓글 수정/삭제
- 매칭 생성
- 매칭 신청
```

단, 팀 관리 기능은 팀 내 권한에 따라 제한된다.

---

## 9. 팀 도메인 UI 검증 기준

### 9.1 팀 목록

팀 목록은 선택된 카테고리 기준으로 조회한다.

검증 기준:

```text
- 선택한 카테고리의 팀만 표시
- DELETED 팀 미표시
- CLOSED 팀은 조회 가능하지만 가입 신청 불가
- 비회원도 팀 목록 조회 가능
```

### 9.2 팀 생성

검증 기준:

```text
- 로그인 사용자만 가능
- 생성자는 OWNER가 됨
- 생성자의 TeamMember가 ACTIVE로 생성됨
- 생성자의 UserCategoryMembership이 생성됨
```

### 9.3 팀 가입 신청

검증 기준:

```text
- 로그인 사용자만 가능
- 같은 팀 PENDING 중복 신청 불가
- 같은 카테고리 여러 팀에 PENDING 신청 가능
- 승인 시 같은 카테고리 다른 PENDING 신청은 CANCELED
- 이미 같은 카테고리 팀에 소속되어 있으면 추가 소속 불가
```

---

## 10. 팀원 관리 UI 검증 기준

### 10.1 팀원 목록

검증 기준:

```text
- ACTIVE TeamMember만 표시
- INACTIVE TeamMember는 표시하지 않음
- OWNER / MEMBER role 표시
```

### 10.2 일반 MEMBER 탈퇴

검증 기준:

```text
- TeamMember가 INACTIVE로 변경됨
- 해당 팀 카테고리의 UserCategoryMembership 삭제
- 팀원 목록에서 제외
- 같은 카테고리 다른 팀에 다시 신청 가능
```

### 10.3 팀원 강퇴

검증 기준:

```text
- OWNER만 가능
- 일반 MEMBER는 강퇴 불가
- OWNER 자기 자신 강퇴 불가
- OWNER 대상 강퇴 불가
- 대상 TeamMember가 INACTIVE로 변경됨
- 해당 팀 카테고리 UserCategoryMembership 삭제
- 팀원 목록에서 제외
- 강퇴 후 재신청 가능
```

### 10.4 OWNER 위임

검증 기준:

```text
- OWNER만 가능
- 같은 팀 ACTIVE MEMBER에게만 위임 가능
- 기존 OWNER는 MEMBER로 변경
- 대상 MEMBER는 OWNER로 변경
- ACTIVE OWNER는 1명 유지
- 위임 후 권한 버튼 표시가 변경됨
```

### 10.5 OWNER 탈퇴

다른 ACTIVE MEMBER가 있는 경우:

```text
- 위임 없이 탈퇴 불가
- 위임 필요 예외 메시지 표시
```

OWNER 혼자 남은 경우:

```text
- Team이 DELETED로 변경됨
- OWNER TeamMember가 INACTIVE로 변경됨
- 해당 팀 카테고리 UserCategoryMembership 삭제
- 해당 팀 PENDING 신청이 REJECTED로 변경됨
- 팀 목록에서 제외됨
```

---

## 11. 화면 구성 원칙

초기 검증 UI는 다음 패널 중심으로 구성한다.

```text
- LoginPanel
- CategorySelector
- TeamListPanel
- TeamDetailPanel
- ApplicationPanel
- OwnerActionPanel
- ActionLogPanel
```

`ActionLogPanel`은 필수다.

모든 주요 API 호출 결과는 성공/실패 여부와 메시지를 로그에 남긴다.

예시:

```text
[성공] 로그인 완료
[실패] 이미 가입 신청한 팀입니다
[성공] 가입 승인 완료
[성공] 같은 카테고리 다른 신청 자동 CANCELED
[실패] 팀 주장만 처리할 수 있습니다
```

---

## 12. API 클라이언트 구조

권장 구조:

```text
src/api/
├── client.js
├── authApi.js
├── teamApi.js
└── applicationApi.js
```

`client.js`에서 Axios instance와 Authorization interceptor를 관리한다.

각 도메인 API 파일은 API 호출 함수만 가진다.

화면 상태 변경 로직은 component에서 처리한다.

---

## 13. 권장 컴포넌트 구조

초기 구조:

```text
src/
├── api/
│   ├── client.js
│   ├── authApi.js
│   ├── teamApi.js
│   └── applicationApi.js
├── components/
│   ├── LoginPanel.jsx
│   ├── CategorySelector.jsx
│   ├── TeamListPanel.jsx
│   ├── TeamDetailPanel.jsx
│   ├── ApplicationPanel.jsx
│   ├── OwnerActionPanel.jsx
│   └── ActionLogPanel.jsx
├── App.jsx
└── main.jsx
```

필요성이 명확해지기 전까지 `pages`, `routes`, `store` 구조를 만들지 않는다.

---

## 14. 백엔드와의 관계

백엔드 레포지토리는 별도 프로젝트다.

```text
Backend: neomango
Frontend: neomango_front
```

이 프론트 레포에서 백엔드 파일을 수정하지 않는다.

백엔드 API 동작이 의심되면 다음을 보고한다.

```text
- 호출한 API
- 요청 payload
- 응답 status
- 응답 body
- 프론트에서 기대한 동작
- 실제 동작
```

백엔드 API 명세와 다르게 임의로 필드명을 가정하지 않는다.

---

## 15. 알림 구조 이해

알림함은 카테고리별로 존재하지 않는다.

알림함은 회원 단위로 하나만 존재한다.

즉, 한 회원에게 발생한 모든 알림은 하나의 알림함으로 모인다.

예시:

```text
읽지 않은 알림 - [리그오브레전드] 새로운 멤버 가입
읽지 않은 알림 - [풋살] 가입 승인
읽은 알림 - [발로란트] 가입 거절
```

알림은 어떤 카테고리에서 어떤 이벤트로 발생했는지 알 수 있어야 한다.

권장 API 구조:

```text
GET /api/notifications
GET /api/notifications/unread
PATCH /api/notifications/{notificationId}/read
```

다음 구조는 사용하지 않는다.

```text
GET /api/categories/{category}/notifications
```

---

## 16. 금지 사항

다음 작업은 하지 않는다.

```text
- Redux 도입
- Zustand 도입
- React Query 도입
- Tailwind CSS 도입
- Next.js 전환
- TypeScript 전환
- 복잡한 라우팅 구조 도입
- 디자인 시스템 구축
- 애니메이션 구현
- 백엔드 API 임의 변경
- 백엔드 레포지토리 파일 수정
- 프론트에서 백엔드 Entity 구조 추측
- category 조건 누락
```

---

## 17. 코드 작성 기준

- 컴포넌트는 너무 잘게 쪼개지 않는다.
- 검증 UI 목적에 맞게 단순하게 작성한다.
- 중복 제거보다 흐름 가독성을 우선한다.
- 에러를 catch해서 화면 로그에 표시한다.
- `console.log`만으로 검증하지 않는다.
- 사용하지 않는 import는 제거한다.
- 비회원/회원/OWNER/MEMBER 상태 차이를 화면에서 확인 가능하게 만든다.
- 성공/실패 응답을 사용자에게 보이게 한다.

---

## 18. 완료 보고 형식

작업 완료 후 다음을 보고한다.

```text
1. 수정/추가 파일 목록
2. 구현한 UI 기능
3. 연결한 API 목록
4. 인증 토큰 처리 방식
5. 성공/실패 로그 처리 방식
6. 테스트한 사용자 시나리오
7. 남은 문제 또는 백엔드 확인 필요 사항
```
