# NeomanGo Frontend

너만고 프로젝트의 React + Vite 기반 프론트엔드 레포지토리입니다.

현재 목적은 최종 서비스 UI 완성이 아니라 테스트 UI를 구현 및 검증

## 기술 스택

- React
- Vite
- JavaScript
- Axios

## 실행 환경

권장 Node.js 버전:

```text
Node.js v24.16.0 이상
npm v11.x 이상
```

## API 환경변수

로컬 개발 환경에서는 `.env.development` 또는 `.env.local`에 다음 값을 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

운영 빌드에서는 `.env.production`에 운영 API 주소를 설정해야 합니다. 값이 없으면 빌드가 실패합니다.

```env
VITE_API_BASE_URL=https://api.neomango.kr
```

실제 환경 파일은 Git에 커밋하지 않고, 저장소의 `.env.*.example`을 복사해 사용합니다.
`VITE_*` 변수는 브라우저 번들에 포함되는 public config이므로 비밀번호, JWT secret, AWS key 같은 민감정보를 넣으면 안 됩니다.
