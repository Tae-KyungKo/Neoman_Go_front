import {
  getAuthSession,
  isAccessTokenExpired,
  setAuthSession,
  setCsrfToken,
} from '../auth/authSession';
import { clearTokens } from '../auth/tokenStorage';
import { API_BASE_URL } from '../config/env';

interface ApiEnvelope<T> {
  success?: boolean;
  code?: string;
  message?: string;
  data?: T;
  errors?: unknown;
}

interface WebTokenResponse {
  accessToken: string;
  tokenType: string;
  accessTokenExpiresIn: number;
}

export interface CsrfTokenResponse {
  token: string;
  headerName: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number | null;
  code: string;
  errors?: unknown;

  constructor(message: string, status: number | null, code: string, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

const WEB_AUTH_PATH = '/api/auth/web/';
const CSRF_PATH = `${WEB_AUTH_PATH}csrf`;
const REFRESH_LOCK_NAME = 'neomango:refresh-session';
let reissuePromise: Promise<string> | null = null;
let csrfPromise: Promise<CsrfTokenResponse> | null = null;

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function isUnsafeMethod(method?: string): boolean {
  const normalizedMethod = (method ?? 'GET').toUpperCase();
  return !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(normalizedMethod);
}

function expireAuthSession(): void {
  clearTokens();
  window.dispatchEvent(new Event('neomango:auth-expired'));
}

export async function ensureCsrfToken(): Promise<CsrfTokenResponse> {
  const currentToken = getAuthSession().csrfToken;
  if (currentToken) {
    return { token: currentToken, headerName: 'X-XSRF-TOKEN' };
  }

  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = sendRequest<CsrfTokenResponse>(
    CSRF_PATH,
    { credentials: 'include' },
  )
    .then((response) => {
      if (response.error) {
        throw response.error;
      }

      const csrf = response.data as CsrfTokenResponse;
      setCsrfToken(csrf.token);
      return csrf;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
}

async function prepareRequest(path: string, init: RequestInit): Promise<RequestInit> {
  const headers = new Headers(init.headers);

  if (path.startsWith(WEB_AUTH_PATH) && isUnsafeMethod(init.method)) {
    const csrf = await ensureCsrfToken();
    if (!headers.has(csrf.headerName)) {
      headers.set(csrf.headerName, csrf.token);
    }
  }

  return {
    ...init,
    credentials: init.credentials ?? 'include',
    headers,
  };
}

export async function refreshAccessToken(): Promise<string> {
  if (reissuePromise) {
    return reissuePromise;
  }

  reissuePromise = withRefreshLock(async () => {
    const csrf = await ensureCsrfToken();
    let response = await sendRequest<WebTokenResponse>(
      `${WEB_AUTH_PATH}refresh`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { [csrf.headerName]: csrf.token },
      },
    );

    if (response.error?.code === 'A001') {
      response = await sendRequest<WebTokenResponse>(
        `${WEB_AUTH_PATH}refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { [csrf.headerName]: csrf.token },
        },
      );
    }

    if (response.error) {
      throw response.error;
    }

    const tokens = response.data as WebTokenResponse;
    setAuthSession(tokens);
    return tokens.accessToken;
  })
    .catch((error) => {
      if (
        error instanceof ApiError
        && (error.status === 401 || error.status === 403)
      ) {
        expireAuthSession();
      }
      throw error;
    })
    .finally(() => {
      reissuePromise = null;
    });

  return reissuePromise;
}

async function withRefreshLock<T>(operation: () => Promise<T>): Promise<T> {
  if (
    typeof navigator !== 'undefined'
    && 'locks' in navigator
    && navigator.locks
  ) {
    return navigator.locks.request(REFRESH_LOCK_NAME, operation);
  }
  return operation();
}

export async function requestApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const normalizedPath = normalizePath(path);
  const isWebAuthRequest = normalizedPath.startsWith(WEB_AUTH_PATH);
  const session = getAuthSession();
  let requestAccessToken = isWebAuthRequest
    ? undefined
    : (session.accessToken || undefined);

  if (
    requestAccessToken
    && requestAccessToken === session.accessToken
    && isAccessTokenExpired()
  ) {
    requestAccessToken = await refreshAccessToken();
  }

  const preparedInit = await prepareRequest(normalizedPath, init);
  const response = await sendRequest<T>(
    normalizedPath,
    preparedInit,
    requestAccessToken,
  );

  if (response.error?.status === 401 && requestAccessToken && !isWebAuthRequest) {
    const nextAccessToken = await refreshAccessToken();
    const retryResponse = await sendRequest<T>(
      normalizedPath,
      preparedInit,
      nextAccessToken,
    );

    if (!retryResponse.error) {
      return retryResponse.data as T;
    }

    if (retryResponse.error.status === 401 || retryResponse.error.status === 403) {
      expireAuthSession();
    }
    throw retryResponse.error;
  }

  if (response.error) {
    throw response.error;
  }
  return response.data as T;
}

async function sendRequest<T>(
  path: string,
  init: RequestInit,
  accessToken?: string,
): Promise<{ data?: T; error?: ApiError }> {
  const headers = new Headers(init.headers);

  headers.set('Accept', 'application/json');
  if (init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
      ...init,
      credentials: init.credentials ?? 'include',
      headers,
    });
  } catch {
    return {
      error: new ApiError(
        '서버에 연결할 수 없습니다.',
        null,
        'NETWORK_ERROR',
      ),
    };
  }

  const responseText = await response.text();
  let body: ApiEnvelope<T> | T | null = null;

  if (responseText) {
    try {
      body = JSON.parse(responseText) as ApiEnvelope<T> | T;
    } catch {
      return {
        error: new ApiError(
          '서버 응답을 확인할 수 없습니다.',
          response.status,
          'INVALID_RESPONSE',
        ),
      };
    }
  }

  if (!response.ok) {
    const errorBody = body as ApiEnvelope<T> | null;
    return {
      error: new ApiError(
        errorBody?.message ?? '요청 처리 중 오류가 발생했습니다.',
        response.status,
        errorBody?.code ?? `HTTP_${response.status}`,
        errorBody?.errors,
      ),
    };
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return { data: (body as ApiEnvelope<T>).data as T };
  }

  return { data: body as T };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !Array.isArray(error.errors)) {
    return {};
  }

  return error.errors.reduce<Record<string, string>>((fieldErrors, item) => {
    if (
      item
      && typeof item === 'object'
      && 'field' in item
      && 'message' in item
      && typeof item.field === 'string'
      && typeof item.message === 'string'
      && !fieldErrors[item.field]
    ) {
      const field = item.field.includes('.')
        ? item.field.slice(item.field.lastIndexOf('.') + 1)
        : item.field;
      fieldErrors[field] = item.message;
    }
    return fieldErrors;
  }, {});
}
