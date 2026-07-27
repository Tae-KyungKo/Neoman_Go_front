# NeomanGo Frontend

너만고 프로젝트의 React + TypeScript + Vite 프론트엔드입니다.

## 실행 환경

- Node.js 24 (`.nvmrc`)
- npm 11 이상
- 로컬 Backend: `http://localhost:8080`
- 로컬 Frontend: `http://localhost:5173`

## 로컬 실행

저장소에는 로컬 실행 기본값이 설정된 `.env.development`가 포함되어 있습니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

Backend 서버를 먼저 8080 포트에서 실행한 다음 Frontend를 실행합니다.

```bash
npm install
npm run dev
```

Vite 개발 서버는 Backend CORS 설정과 일치하도록 `localhost:5173`을 사용합니다.
해당 포트가 이미 사용 중이면 다른 포트로 자동 변경하지 않고 실행에 실패합니다.

개인별 API 주소가 필요하면 Git에 포함되지 않는 `.env.development.local`을 생성합니다.

```env
VITE_API_BASE_URL=http://localhost:8081
```

## 빌드 및 검증

```bash
npm run lint
npm run build
npm run preview
```

`npm run build`는 TypeScript 검사 후 Vite 운영 빌드를 생성합니다.

## 운영 환경

운영 빌드에는 `.env.production`이 반드시 필요합니다.

```env
VITE_API_BASE_URL=https://api.neomango.kr
```

로컬 검증이 필요하면 `.env.production.example`을 복사해 사용합니다.

```powershell
Copy-Item .env.production.example .env.production
npm run build
npm run preview
```

실제 `.env.production`은 Git에 커밋하지 않습니다. CI에서는 빌드 단계에서 운영 API
주소를 주입합니다.

`VITE_*` 환경변수는 브라우저 번들에 포함되는 공개 설정입니다. 비밀번호, JWT secret,
AWS access key 등의 민감정보를 저장하면 안 됩니다.

## 환경 파일

| 파일 | 용도 | Git 관리 |
|---|---|---|
| `.env.example` | 공통 환경변수 예시 | 포함 |
| `.env.development` | 기본 로컬 Backend 연결 | 포함 |
| `.env.development.local` | 개발자별 로컬 override | 제외 |
| `.env.production.example` | 운영 환경변수 예시 | 포함 |
| `.env.production` | 실제 운영 빌드 설정 | 제외 |
