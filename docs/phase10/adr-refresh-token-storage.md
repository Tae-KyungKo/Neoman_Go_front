# ADR: Refresh Token Storage

## 상태

Accepted for Phase 10-1.5

## 현재 구조

Access Token과 Refresh Token은 현재 frontend `localStorage`에 저장한다. 저장 key는 기존 `accessToken`, `refreshToken`을 유지하며, Phase 10-1.5에서는 `tokenType`, `accessTokenExpiresIn`도 같은 token storage 유틸리티에서 함께 관리한다.

## 이번 단계의 결정

Phase 10-1.5에서는 기존 Backend API 계약을 유지하고 Refresh Token 저장 방식을 즉시 HttpOnly Cookie로 전환하지 않는다. 대신 서버 logout API 연동, reissue single-flight, refresh token rotation 결과 저장, 인증 실패 시 즉시 local token 제거를 구현한다.

## 이유

HttpOnly Cookie 전환에는 다음 변경을 함께 설계해야 한다.

- Backend login/reissue/logout 계약
- Cookie Domain
- Secure
- HttpOnly
- SameSite
- CORS credentials
- CSRF 위협 모델
- local/prodlike/prod 환경 검증

위 항목은 frontend 단독 수정 범위를 넘는다. 따라서 Phase 10-1.5에서는 운영 UI redesign 전 안정화 범위로 한정해 기존 계약 위에서 정합성을 보강한다.

## 위험

XSS가 발생하면 JavaScript를 통해 Refresh Token이 탈취될 수 있다. 이 방식은 안전한 최종 구조가 아니라 현재 API 계약과 릴리스 범위를 통제하기 위한 임시 유지 결정이다.

## Phase 10-1.5 보완

- 서버 logout API 연동
- Reissue Single-flight
- Refresh Token Rotation 결과 즉시 저장
- token 값 console 출력 금지
- ActionLogPanel 운영 route 렌더링 제거
- 신규 `dangerouslySetInnerHTML` 사용 금지
- 인증 실패 시 token 즉시 제거

## 후속 작업

Phase 13 이전 또는 별도 Security Phase에서 Refresh Token HttpOnly Cookie 전환을 검토한다.
