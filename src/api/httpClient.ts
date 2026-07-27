import { API_BASE_URL } from '../config/env';
import {
  clearTokens,
  getRefreshToken,
  saveTokens,
} from '../auth/tokenStorage';

interface ApiEnvelope<T> {
  success?: boolean;
  code?: string;
  message?: string;
  data?: T;
  errors?: unknown;
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

let reissuePromise: Promise<string> | null = null;

interface ReissuedTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresIn: number;
}

export async function requestTokenReissue(
  refreshToken: string,
): Promise<ReissuedTokens> {
  const response = await sendRequest<ReissuedTokens>(
    '/api/auth/reissue',
    {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (response.error) {
    throw response.error;
  }
  return response.data as ReissuedTokens;
}

export async function refreshAccessToken(): Promise<string> {
  if (reissuePromise) {
    return reissuePromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    window.dispatchEvent(new Event('neomango:auth-expired'));
    throw new ApiError('로그인이 만료되었습니다.', 401, 'REFRESH_TOKEN_MISSING');
  }

  reissuePromise = requestTokenReissue(refreshToken)
    .then((tokens) => {
      saveTokens(tokens);
      return tokens.accessToken;
    })
    .catch((error) => {
      clearTokens();
      window.dispatchEvent(new Event('neomango:auth-expired'));
      throw error;
    })
    .finally(() => {
      reissuePromise = null;
    });

  return reissuePromise;
}

export async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const response = await sendRequest<T>(path, init, accessToken);

  if (response.error?.status === 401 && accessToken) {
    const nextAccessToken = await refreshAccessToken();
    const retryResponse = await sendRequest<T>(path, init, nextAccessToken);
    if (!retryResponse.error) {
      return retryResponse.data as T;
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
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
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
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...init,
      headers,
    });
  } catch {
    return { error: new ApiError('서버에 연결할 수 없습니다.', null, 'NETWORK_ERROR') };
  }

  const responseText = await response.text();
  let body: ApiEnvelope<T> | T | null = null;

  if (responseText) {
    try {
      body = JSON.parse(responseText) as ApiEnvelope<T> | T;
    } catch {
      return {
        error: new ApiError('서버 응답을 확인할 수 없습니다.', response.status, 'INVALID_RESPONSE'),
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
      item &&
      typeof item === 'object' &&
      'field' in item &&
      'message' in item &&
      typeof item.field === 'string' &&
      typeof item.message === 'string' &&
      !fieldErrors[item.field]
    ) {
      const field = item.field.includes('.')
        ? item.field.slice(item.field.lastIndexOf('.') + 1)
        : item.field;
      fieldErrors[field] = item.message;
    }
    return fieldErrors;
  }, {});
}
