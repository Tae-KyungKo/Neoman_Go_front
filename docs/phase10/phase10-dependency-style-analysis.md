# Phase 10-1 Dependency, Style, Auth and SSE Analysis

## 의존성 비교

| 항목 | 기존 | 신규 디자인 | 판정 | 이유 |
|---|---|---|---|---|
| Node | `.nvmrc` 24, 조사 환경 24.16.0 | `.nvmrc` 24 | 기존 버전 유지 | 동일 major |
| npm | 조사 환경 11.13.0 | lockfile npm | 기존 버전 유지 | package manager 변경 근거 없음 |
| React | `^19.2.6`, 설치 19.2.6 | `^19.2.7` | 업그레이드 불필요 | UI 이식에 patch upgrade 불필요 |
| React DOM | `^19.2.6` | `^19.2.7` | 업그레이드 불필요 | 동일 |
| Vite | `^8.0.12`, 설치 8.0.14 | `^8.1.1` | 업그레이드 불필요 | 디자인의 높은 버전은 도입 근거가 아님 |
| React Router | `^7.17.0` | `^7.18.1` | 기존 버전 유지 | 사용 API가 현재 버전에서 제공됨 |
| lint | ESLint 10 + react hooks/refresh | oxlint 1.71 | 도입 금지 | lint 체계 이중화 방지 |
| TypeScript | 없음 | `~6.0.2` | 개별 추가 검토 | 전체 전환은 Phase 10 범위 과다 |
| UI library | 없음 | 없음 | 기존 버전 유지 | 자체 컴포넌트 |
| icon library | 없음 | 자체 `Icon` + `icons.svg` | 개별 추가 검토 | asset license/접근성 확인 |
| CSS 도구 | plain global CSS | plain CSS + token | 호환성 검증 필요 | 전역 reset/token 충돌 |
| axios | 1.16.1 | 없음 | 기존 버전 유지 | Auth/API interceptor 필수 |
| SSE | `@microsoft/fetch-event-source` 2.0.1 | 없음 | 기존 버전 유지 | Bearer header SSE에 필요 |
| lockfile | npm lockfile v3 | npm lockfile v3 | 기존 버전 유지 | 디자인 lockfile 덮어쓰기 금지 |

## TypeScript 대안

| 대안 | 장점 | 비용·위험 | Phase 10 판단 |
|---|---|---|---|
| 디자인을 JSX로 변환 | 설정/lockfile 변경 없음, 기존 코드와 일관 | prop type 손실, 수동 변환 | **권장** |
| TypeScript 부분 도입 | 신규 component type 보존 | tsconfig, lint, build chain 검증 필요 | 후속 별도 결정 |
| 전체 TypeScript 전환 | 장기 type 안정성 | 기존 전체 변환, 회귀 범위 최대 | 이번 Phase 도입 금지 |

이번 통합은 인증·API·SSE 회귀 위험이 크므로 JSX 변환이 가장 작은 변경이다.

## CSS 구조와 충돌

- 신규 디자인은 CSS 파일 37개, `fig-tokens.css`, `fonts.css`, `spacing.css`, `typography.css`를 사용한다.
- `global.css`가 `*`, `html`, `body`, `#root`, `button/input/textarea/select`를 직접 스타일링한다.
- 기존은 `src/index.css`와 `src/App.css` 전역 class 기반이다.
- 신규 class는 주로 `nm-` prefix지만 token 이름은 일반적인 `--primary-*`, `--background-*`, `--status-*`이다.
- 반응형 `@media`는 2개(`CategoryPage.css`, `TeamFindPage.css`, 900px)뿐이다. 나머지 page의 mobile 안전성은 정보 부족이다.
- dark mode는 `:root[data-theme="dark"]`; ThemeContext가 root dataset을 변경하고 localStorage에 저장한다.

| 위험 | 영향 | 대응 |
|---|---|---|
| global reset 충돌 | 기존 modal/form/button 크기 변경 | 신규 reset을 즉시 import하지 않고 scope 검토 |
| body/#root 충돌 | 배경·최소높이·font 변경 | entry import 전 visual regression |
| CSS variable 충돌 | 기존/신규 색상 의미 혼재 | `--nm-*` namespace 검토 |
| breakpoint 부족 | 팀 관리·form·admin mobile 파손 | 화면별 responsive QA |
| dark selector | 기존 고정 색상과 대비 불량 | dark mode는 화면별 검증 후 활성 |
| modal/toast z-index | SSE toast가 modal 아래/위 오동작 | 공통 layering token 정의 |
| form selector | 기존 validation/error UI 파손 | form primitive 단위 이식 |

## Auth 보존 전략

다음 파일과 소유권은 신규 디자인 구현으로 대체하지 않는다.

- `src/auth/AuthContext.jsx`: 실제 token/currentUser와 초기 deep-link 복원.
- `src/auth/tokenStorage.js`: token 저장의 단일 진입점.
- `src/auth/authSession.js`: `refreshPromise` single-flight, 인증 종료 event.
- `src/api/client.js`: Authorization request interceptor와 401 response interceptor.
- `src/api/authApi.js`: login/signup/reissue/logout.
- `src/routes/ProtectedRoute.jsx`, `src/routes/AdminRoute.jsx`: 인증과 ADMIN route.

권장 mount:

```text
BrowserRouter
└─ AuthProvider
   └─ Routes
      └─ MainLayout (persistent)
         ├─ Header / BottomBar / Footer
         ├─ useNotificationStream (exactly once)
         └─ Outlet
```

신규 디자인처럼 모든 page가 `<MainLayout>`을 직접 렌더링하면 route transition마다 layout과 SSE hook이 unmount/mount된다. 일부 nested page가 기존 layout 아래에서 다시 신규 MainLayout을 렌더링하면 Header/Footer 중복뿐 아니라 SSE hook을 두 곳에 배치할 가능성이 생긴다.

## SSE 보존 전략

- `useNotificationStream` 소유자는 persistent top-level `MainLayout` 한 곳이다.
- page, Header, NotificationsPage에는 stream hook을 추가하지 않는다.
- 로그아웃 시작/session 종료 event에서 `AbortController.abort()`를 유지한다.
- SSE 401은 공통 `refreshTokensOnce`를 사용해 1회만 reissue하고 access token state 변경으로 재연결한다.
- 일반 네트워크 오류 backoff와 REST notifications를 source of truth로 유지한다.
- StrictMode 개발 환경에서는 effect cleanup이 선행되는지 확인하고 활성 connection이 한 개임을 QA한다.
- `SseStatusBadge`의 운영 노출 여부는 UI 결정 사항이지만 hook 소유권과는 분리한다.

## NotFound와 인증 deep-link

- 기존 wildcard `NotFoundPage`를 유지하고 신규 시각만 적용할 수 있다.
- 저장된 access token이 있으면 AuthProvider가 `/api/users/me`로 currentUser를 복원한 뒤 guard를 판정해야 한다.
- Router 전체 교체 또는 page별 AuthProvider 배치는 금지한다.
- production hosting의 SPA fallback은 프론트 코드 외 설정이므로 배포 QA가 필요하다.
