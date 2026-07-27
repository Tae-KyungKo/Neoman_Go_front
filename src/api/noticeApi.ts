import { requestApi } from './httpClient';

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface NoticeSummaryResponse {
  id: number;
  title: string;
  authorName: string;
  createdAt: string;
}

export interface NoticeResponse {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface NoticePayload {
  title: string;
  content: string;
}

export function getNotices(page: number, size = 20): Promise<PageResponse<NoticeSummaryResponse>> {
  return requestApi<PageResponse<NoticeSummaryResponse>>(
    `/api/notices?page=${page}&size=${size}`,
  );
}

export function getNotice(noticeId: number): Promise<NoticeResponse> {
  return requestApi<NoticeResponse>(`/api/notices/${noticeId}`);
}

export function createNotice(
  payload: NoticePayload,
  accessToken: string,
): Promise<NoticeResponse> {
  return requestApi<NoticeResponse>(
    '/api/admin/notices',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function updateNotice(
  noticeId: number,
  payload: NoticePayload,
  accessToken: string,
): Promise<NoticeResponse> {
  return requestApi<NoticeResponse>(
    `/api/admin/notices/${noticeId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function deleteNotice(noticeId: number, accessToken: string): Promise<void> {
  return requestApi<void>(
    `/api/admin/notices/${noticeId}`,
    { method: 'DELETE' },
    accessToken,
  );
}
