# Phase 7.5. 1차 배포 전 시연용 UI 및 환경 정리

## 배경

- Phase 7에서 백엔드 Notification 저장, 알림 목록/읽음 API, 팀/댓글 알림 생성, SSE 연결, AFTER_COMMIT 기반 SSE 전송 연결까지 완료했다.
- Phase 8은 실제 배포, CI/CD, 모니터링 단계다.
- Phase 8로 바로 넘어가기 전에 기존 검증용 UI를 1차 시연 가능한 구조로 정리할 필요가 있다.
- 따라서 Phase 7.5를 추가한다.

## 목표

- 기존 검증용 UI 스타일은 유지한다.
- 본격적인 너만고 브랜드 디자인 시스템은 만들지 않는다.
- React Router 기반으로 화면을 분리한다.
- 전역 화면, 카테고리 화면, 팀 내부 화면, 관리자 화면, Dev 화면을 구분한다.
- 알림함 REST UI와 프론트 SSE 실시간 알림 UI를 시연 가능한 형태로 만든다.
- Phase 8 배포 전에 API URL, CORS, 포트, 환경변수를 정리한다.

## 포함 범위

- React Router 도입
- MainLayout, CategoryLayout, AdminLayout 구성
- Home, Login, Signup, Notice, Notification, MyPage 등 전역 화면 구성
- `/c/:categoryCode` 기반 카테고리 화면 구성
- 팀 목록, 팀 생성, 팀 상세, 팀 관리 페이지 분리
- 카테고리별 게시판, 게시글 상세, 댓글 페이지 분리
- 공지사항 조회 화면과 관리자 공지 관리 화면 분리
- 알림함 REST UI
- 프론트 SSE 실시간 알림 UI
- 기존 ActionLog/검증용 UI를 `/dev` 또는 접이식 Debug UI로 이동
- `VITE_API_BASE_URL` 등 프론트 환경변수 정리
- 백엔드, 프론트, MySQL, Redis 로컬 포트 기준 정리
- 1차 시연 시나리오 QA

## 제외 범위

- 너만고 브랜드 디자인 시스템 구축
- 전체 UI/UX 리디자인
- 모바일 반응형 완성
- 매치 기능 구현
- 관리자 회원 관리/통계 기능 구현
- Redis Pub/Sub
- Outbox
- WebSocket
- FCM
- 실제 운영 서버 배포
- CI/CD 구축
- 모니터링 구축

## Phase 7.5 세부 Step

- 7.5-0 기준점 확인 및 로드맵 문서 정리
- 7.5-1 React Router 기반 시연용 UI 뼈대 구성
- 7.5-2 전역 인증 상태 및 보호 라우트 정리
- 7.5-3 카테고리 기반 화면 구조 정리
- 7.5-4 팀 시나리오 UI 이관
- 7.5-5 게시판/댓글 UI 이관
- 7.5-6 공지사항/관리자 공지 UI 이관
- 7.5-7 알림함 REST UI
- 7.5-8 프론트 SSE 실시간 알림 UI
- 7.5-9 Dev/Debug UI 정리
- 7.5-10 환경변수/포트/CORS 정리
- 7.5-11 1차 시연 시나리오 QA

## 권장 라우트 초안

- `/`
- `/login`
- `/signup`
- `/notices`
- `/notices/:noticeId`
- `/notifications`
- `/me`
- `/c/:categoryCode`
- `/c/:categoryCode/teams`
- `/c/:categoryCode/teams/new`
- `/c/:categoryCode/teams/:teamId`
- `/c/:categoryCode/board`
- `/c/:categoryCode/posts/:postId`
- `/c/:categoryCode/matches`
- `/admin`
- `/admin/notices`
- `/dev`

## 화면 분류

### 1. 전역 화면

- Home
- Login
- Signup
- Notices
- Notifications
- MyPage

### 2. 카테고리 화면

- CategoryHome
- CategoryTeamList
- CategoryBoard
- CategoryMatchPlaceholder

### 3. 팀 내부 화면

- TeamDetail
- TeamApplication
- OwnerApplicationManagement
- TeamMemberManagement
- Leave/Delegate/Kick 흐름

### 4. 관리자 화면

- AdminDashboard placeholder
- AdminNoticeManagement

### 5. 개발용 화면

- DevPage
- ActionLog
- 기존 검증용 보조 패널

## 핵심 설계 원칙

- URL의 `categoryCode`를 카테고리 화면의 source of truth로 사용한다.
- 공지사항, 알림함, 내 정보는 카테고리와 무관한 전역 기능으로 둔다.
- 팀 목록, 팀 상세, 게시판, 게시글, 매치는 카테고리 종속 기능으로 둔다.
- SSE 연결은 NotificationPage 내부가 아니라 MainLayout 또는 인증된 앱 루트에서 관리한다.
- 로그아웃/계정 전환 시 이전 사용자의 알림, 팀 신청, 팀 상세, 게시글 상세, SSE 연결 상태가 남지 않아야 한다.
- 기존 검증용 UI는 삭제하지 말고 `/dev` 또는 접이식 Debug UI로 보존한다.
- Phase 7.5에서는 디자인 전면 개편을 하지 않는다.
- 기존 검증용 UI 스타일을 유지하되, 화면 흐름만 시연용으로 정리한다.

## 1차 시연 핵심 시나리오

### 1. 팀 가입 신청/승인 알림

- tester1 로그인
- LOL 팀 생성
- tester2 로그인
- tester1 팀에 가입 신청
- tester1 실시간 신청 알림 수신
- tester1 승인
- tester2 실시간 승인 알림 수신
- tester2 알림함에서 읽음 처리

### 2. 팀 멤버 변경 알림

- OWNER가 MEMBER 강퇴
- 강퇴당한 사용자 실시간 알림 수신
- OWNER가 주장 권한 위임
- 새 OWNER 실시간 알림 수신

### 3. 댓글 알림

- tester1 게시글 작성
- tester2 댓글 작성
- tester1 실시간 댓글 알림 수신
- tester1 알림함에서 읽음 처리

### 4. 공지사항 관리자 흐름

- ADMIN 로그인
- 공지 작성
- 비회원/USER 공지 조회
- ADMIN 공지 수정/삭제

### 5. 계정 전환 안정성

- tester1 로그인
- 알림/SSE 연결 확인
- 로그아웃
- tester2 로그인
- tester1 알림이 tester2 화면에 뜨지 않는지 확인

## 환경 기준 초안

- Frontend Vite: `5173`
- Backend Spring Boot: `8080`
- MySQL: `3306`
- Redis: `6379`
- Frontend API base URL: `VITE_API_BASE_URL`
- SSE URL은 `VITE_API_BASE_URL` 기반으로 생성한다.
- local/prod 환경변수 분리를 Phase 7.5-10에서 정리한다.

## 7.5-0 완료 기준

- 현재 워킹트리 상태를 확인한다.
- Phase 7.5의 범위, 제외 범위, 세부 Step, 라우트 초안, 시연 시나리오, 환경 기준을 문서화한다.
- 운영 코드, 프론트 기능 코드, 테스트 코드, CSS, 환경변수 파일은 수정하지 않는다.
