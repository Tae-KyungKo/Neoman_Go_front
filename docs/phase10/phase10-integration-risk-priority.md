# Phase 10-1 Integration Risk and Priority

## 기준선과 main 차이

- 통합 브랜치와 `dev`: `80234dafeddc8e6c746cbda972e37ddfa027450c`, tree 동일.
- `main`: `251fea320c377015574ef8cd3141cf3afeff1ac3`.
- `release/v1.1.0`: `c7e8f49904867fe8225e0bf7c78bf346e421f8c5`.
- `main^{tree}`와 `release/v1.1.0^{tree}`는 동일하다.
- `main`에만 있는 커밋은 release PR merge commit `251fea3` 한 개이며 실제 운영 코드 추가는 없다.
- 통합 브랜치에는 release 이후 안정화 커밋 `426247e`와 문서 커밋이 포함된다. 따라서 main에서 별도로 merge/cherry-pick할 운영 수정은 확인되지 않았다.

## P0 — 통합 전 필수 해결 (10개)

| 문제 | 영향 | 근거 | 권장 해결 | 저장소 | Phase 10 |
|---|---|---|---|---|---|
| 디자인 AuthContext로 교체 | token/reissue/deep-link 소실 | design `context/AuthContext.tsx` | 기존 AuthProvider 유지, UI만 연결 | Frontend | 필수 |
| mock login/signup | 서버 인증 없이 성공 표시 | design Login/Signup handler | 기존 auth action 사용 | Frontend | 필수 |
| page별 MainLayout | SSE 재마운트/중복 위험 | design 모든 page의 MainLayout | persistent route layout 한 곳 | Frontend | 필수 |
| Router 전체 교체 | guard/category/deep-link 손실 | design flat `App.tsx` | 기존 route tree에 page 단위 매핑 | Frontend | 필수 |
| ADMIN role toggle | 권한 우회처럼 보이는 UX | design `MyInfoPage` | 제거, Backend role만 사용 | Frontend | 필수 |
| team role mock | OWNER/MEMBER 오판 | design `teamRole.ts` | Backend team member 데이터 사용 | Frontend | 필수 |
| mutation 가짜 성공 | 데이터 미변경인데 성공 이동 | design Team/Post/Admin handlers | 실제 API 성공 후에만 state/navigation | Frontend | 필수 |
| API error wrapper 미처리 | 401/403/409 오동작 | Backend `ErrorResponse` | 기존 normalize + code mapping | Frontend | 필수 |
| Backend 미지원 화면 노출 | 영구 실패/가짜 기능 | Controller 전수 조사 | 운영 route/menu 제외 | Frontend | 필수 |
| package/lockfile 교체 | Auth/SSE deps 소실·build 회귀 | 두 package.json | 기존 유지, 필요 asset만 선별 | Frontend | 필수 |

## P1 — 주요 사용자 흐름/품질 (12개)

| 문제 | 영향 | 근거 | 권장 해결 | 저장소 | Phase 10 |
|---|---|---|---|---|---|
| signup 중복 확인 누락 | 409까지 늦은 실패 | design Signup | 기존 availability flow 이식 | Frontend | 필수 |
| 기존 password validator 과허용 | Backend 400 | 기존 Signup vs UserPolicy | Backend regex와 공유 가능한 상수화 | Frontend | 필수 |
| 신규 auth 외 maxLength 누락 | 400/입력 손실 | form inventory | DTO 최대 길이 반영 | Frontend | 필수 |
| team 디자인 필드 과다 | 저장 불가 정보 표시 | TeamCreate/Team data | 미지원 field 제거 | Frontend | 필수 |
| team/post card N+1 | 목록 성능 저하 | summary DTO 필드 부족 | summary 범위로 UI 축소 | Frontend 우선 | 필수 |
| 게시글/댓글 edit 누락 | 기존 운영 기능 회귀 | 기존 PostDetailPanel | 기존 UI 유지 또는 신규 edit 보강 | Frontend | 필수 |
| 가입 취소 누락 | 신청자 흐름 회귀 | 기존 MyTeamApplicationsPanel | 신규 MyTeam 화면에 복원 | Frontend | 필수 |
| 알림 target 변환 누락 | 잘못된 route 이동 | design `targetPath` mock | 기존 navigation hook 사용 | Frontend | 필수 |
| Page/date View Model 부재 | runtime 표시 오류 | Backend DTO | domain adapter 정의 | Frontend | 필수 |
| loading/error/empty 불완전 | 실패와 빈 결과 혼동 | design static arrays | 화면별 상태 명세 | Frontend | 필수 |
| responsive 규칙 부족 | mobile 파손 | design media rule 2개 | 화면별 breakpoint QA | Frontend | 필수 |
| prod SPA fallback 미확인 | 새로고침 404 | BrowserRouter | 배포 환경 QA | Infra | 필수 |

## P2 — 정리/일관성 (6개)

| 문제 | 영향 | 근거 | 권장 해결 | 저장소 | Phase 10 |
|---|---|---|---|---|---|
| CSS token namespace | 향후 충돌 | design token files | `--nm-*` 검토 | Frontend | 처리 권장 |
| global reset | 기존 style 영향 | design global.css | scope/import 순서 검증 | Frontend | 처리 권장 |
| 미사용 category image | bundle 증가 | design assets | 실제 route 사용분 선별 | Frontend | 가능 |
| 표현 enum 차이 | 상태 오표시 | 디자인 한글 vs Backend enum | label mapper | Frontend | 필수 |
| dark mode 일괄 활성 | 대비 불량 | mixed legacy CSS | 화면별 활성화 | Frontend | 선택 |
| Legacy/dev files | 조사 혼선 | `src/legacy`, `DevPage` | 운영 route 비노출 유지, 삭제는 별도 | Frontend | 후속 |

## 요구사항 정의서 대조

- 첨부 디렉터리와 Frontend/Backend 인접 저장소 범위에서 `요구사항_정의서_v1.1.pdf`를 찾지 못했다.
- 따라서 PDF에만 존재하는 기능은 분류하지 않았으며 `정보 부족`이다.
- 이번 판정 우선순위는 Backend v1.1.0 실제 코드 → 기존 운영 Frontend → 신규 디자인 순이다.

## Phase 10-2에서 결정할 항목

1. 기존 category 중심 URL을 유지하면서 신규 `/teams`, `/board` 시각 구조를 어떻게 매핑할지.
2. 신규 디자인의 별도 팀 설정/관리/탈퇴 route를 유지할지, 기존 상세 내부 panel로 합칠지.
3. My Page에서 조회 가능한 범위를 `/users/me`와 내 신청 목록까지만 제한할지.
4. Backend 미지원 route/menu를 완전히 숨길지 “준비 중”으로 남길지. 운영 기준 권장은 숨김이다.
5. 게시글/댓글 수정 UI를 신규 디자인에 보강할지 기존 panel을 유지할지.
6. TypeScript를 변환할지 부분 도입할지. 현재 권장은 JSX 변환이다.
7. dark mode를 v1.2.0 범위에 포함할지.

## 변경 금지 기준

- Backend API 추가를 이번 Frontend 통합의 전제로 삼지 않는다.
- 신규 디자인의 mock field 때문에 목록 DTO를 즉시 확장하지 않는다.
- Auth/SSE 안정화 파일, package.json, package-lock.json을 디자인 기준으로 교체하지 않는다.
- 화면 이식 전에 각 P0 항목의 소유권과 route 결정을 문서로 확정한다.
