# React + TypeScript + Vite

## Local Backend 연결

개발 모드에서는 저장소의 `.env.development` 설정을 사용한다.

```text
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_DATA=false
```

Backend를 `http://localhost:8080`에서 먼저 실행한 뒤 Frontend를 실행한다.

```bash
npm install
npm run dev
```

Frontend 개발 서버는 Backend CORS 기준과 일치하도록
`http://localhost:5173`에서 실행되며, 해당 port를 사용할 수 없으면 다른 port로
자동 변경하지 않고 즉시 실패한다. 개인별 override가 필요하면 Git에 포함되지 않는
`.env.development.local`을 사용한다.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
