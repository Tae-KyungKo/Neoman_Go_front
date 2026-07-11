# Phase 10 Frontend Gap Analysis

## Phase 10-1.5 Status

| Area | Status | Evidence | Notes |
|---|---|---|---|
| logout API 미사용 | Resolved | `src/api/authApi.js`, `src/auth/AuthContext.jsx` | `POST /api/auth/logout`를 호출한다. 실패해도 local logout은 `finally`에서 수행한다. |
| ActionLogPanel 운영 노출 | Resolved | `src/pages/**`, `src/pages/admin/AdminNoticePage.jsx` | 운영 Router에 연결된 page의 `ActionLogPanel` 렌더링을 제거했다. `src/legacy/LegacyDevApp.jsx`의 legacy/dev 참조는 Router에 연결되지 않아 유지했다. |
| refresh token localStorage | Partially Resolved | `src/auth/tokenStorage.js`, `docs/phase10/adr-refresh-token-storage.md` | Phase 10-1.5에서는 기존 계약상 localStorage를 유지한다. XSS 위험은 ADR에 명시했고 HttpOnly Cookie 전환은 후속 Security Phase로 이관한다. |
| wildcard home redirect | Resolved | `src/routes/AppRouter.jsx`, `src/pages/NotFoundPage.jsx` | `Navigate to="/"` 대신 NotFoundPage를 렌더링한다. |
| TODO API 함수 | Resolved | `src/api/authApi.js`, `src/api/teamApi.js` | `logout`, `closeTeam`, `deleteTeam`을 확정 Backend API로 연결했다. |
| axios 공통 401 재발급 | Resolved | `src/api/client.js`, `src/auth/authSession.js` | response interceptor가 401에서 single-flight reissue 후 원 요청을 1회 재시도한다. login/signup/reissue는 제외한다. |
| SSE retry/heartbeat | Partially Resolved | `src/hooks/useNotificationStream.js`, `src/api/notificationStreamClient.js` | `connected`와 `notification`만 처리한다. heartbeat comment는 알림으로 처리하지 않는다. 네트워크 오류는 backoff로 재시도한다. |
| URL trailing slash | Resolved | `src/api/url.js`, `src/api/client.js`, `src/api/notificationStreamClient.js` | base URL trailing slash를 제거하고 API/SSE 모두 `buildApiUrl`을 사용한다. |
| admin role mapping | Resolved | `src/auth/roles.js`, `src/routes/AdminRoute.jsx`, `src/components/layout/MainNavigation.jsx` | frontend admin 기준은 `user.role === "ADMIN"`으로 통일했다. `ROLE_ADMIN` 비교는 사용하지 않는다. |
| deep-link fallback | Verification Required | frontend only | Router wildcard는 NotFoundPage로 정리했다. S3/CloudFront deep-link fallback은 배포 인프라 설정에서 별도 QA가 필요하다. |
| clients.js 사용 여부 | Confirmed Not Applicable | `src/api/clients.js` | 파일은 비어 있고 실제 API client는 `src/api/client.js`다. 이번 단계에서는 삭제하지 않는다. |

## Remaining Risks

| Area | Status | Risk | Next Step |
|---|---|---|---|
| Refresh Token localStorage | Deferred | XSS 발생 시 refresh token 탈취 가능 | Security Phase에서 HttpOnly Cookie 전환 검토 |
| Backend reissue 동시성 | Deferred | Backend CAS/lock 방어가 없으므로 frontend single-flight 우회 상황은 서버가 최종 방어하지 못함 | Backend security/concurrency phase에서 검토 |
| Backend logout SSE emitter | Deferred | Backend logout은 기존 SSE emitter를 강제 제거하지 않음 | Frontend는 logout 시작 시 AbortController로 즉시 종료 |
| Last-Event-ID | Deferred | Backend replay 미지원으로 누락 알림 복구 불가 | REST 알림 목록을 source of truth로 유지 |
| prod deep-link fallback | Verification Required | 직접 URL 새로고침 시 hosting 설정에 따라 404 가능 | prod-like/production 배포 설정 QA |

## Manual QA Checklist

### 인증

- 로그인 성공
- `GET /api/users/me` 성공
- `user.role`이 `ADMIN`/`USER`로 매핑되는지 확인
- 일반 API 요청 성공
- Access Token 만료 후 reissue 수행
- reissue 응답의 새 Refresh Token 저장
- 여러 401 동시 발생 시 reissue HTTP 요청 1건만 발생
- reissue 실패 시 인증 상태 종료
- logout API 호출
- logout 후 localStorage token 제거
- logout 후 Redis `refresh:{userId}` 제거 확인 필요

### SSE

- 로그인 후 SSE 연결 1개
- `connected` 이벤트 수신
- `notification` 이벤트 수신
- heartbeat comment가 알림으로 표시되지 않음
- Access Token 만료 후 공통 reissue coordinator 사용
- 네트워크 실패 후 backoff 재연결
- logout 시작 즉시 연결 종료
- logout 후 재연결 없음
- 재로그인 후 연결 1개

### Team

- 팀 마감: `PATCH /api/teams/{teamId}/close`
- 팀 삭제: `DELETE /api/teams/{teamId}`
- OWNER가 아닌 사용자 403 처리
- CLOSED와 DELETED UX 구분은 후속 UI 단계에서 검증

### Router

- 존재하지 않는 URL에서 NotFoundPage 표시
- 직접 URL 접근
- 새로고침
- 보호 Route 비로그인 진입
- Admin Route USER 진입

### Config

- local API URL
- prodlike API URL
- production API URL
- trailing slash 유무와 관계없는 동일 동작
