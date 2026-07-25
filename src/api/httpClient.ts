import { API_BASE_URL } from '../config/env';

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

export async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
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
    throw new ApiError('서버에 연결할 수 없습니다.', null, 'NETWORK_ERROR');
  }

  const responseText = await response.text();
  let body: ApiEnvelope<T> | T | null = null;

  if (responseText) {
    try {
      body = JSON.parse(responseText) as ApiEnvelope<T> | T;
    } catch {
      throw new ApiError('서버 응답을 확인할 수 없습니다.', response.status, 'INVALID_RESPONSE');
    }
  }

  if (!response.ok) {
    const errorBody = body as ApiEnvelope<T> | null;
    throw new ApiError(
      errorBody?.message ?? '요청 처리 중 오류가 발생했습니다.',
      response.status,
      errorBody?.code ?? `HTTP_${response.status}`,
      errorBody?.errors,
    );
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return (body as ApiEnvelope<T>).data as T;
  }

  return body as T;
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
