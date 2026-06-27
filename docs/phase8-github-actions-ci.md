# Phase 8 GitHub Actions Frontend CI

## Scope

- Phase 8-9 is CI only.
- This workflow does not deploy frontend artifacts.
- AWS CLI, S3 sync, and CloudFront invalidation are intentionally excluded.
- GitHub Secrets are not required.

## Node Version

- The repository pins Node through `.nvmrc`.
- Current Node version: `24`.
- GitHub Actions reads `.nvmrc` through `actions/setup-node`.

## Workflow

- Workflow file: `.github/workflows/frontend-ci.yml`
- Runner: `ubuntu-latest`
- Triggers:
  - `pull_request` to `dev`, `main`, `release/**`
  - `push` to `dev`, `main`, `release/**`
  - `workflow_dispatch`

## Checks

The frontend CI runs:

```text
npm ci
npm run lint
npm run build
```

## Follow-Up

- Branch protection should be configured later in the GitHub UI.
- Deployment/CD should be handled in a separate phase with explicit production environment policy.
