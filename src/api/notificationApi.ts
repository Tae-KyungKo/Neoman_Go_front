import { requestApi } from './httpClient';
import { API_BASE_URL } from '../config/env';

export type NotificationType =
  | 'TEAM_APPLICATION_CREATED'
  | 'TEAM_APPLICATION_APPROVED'
  | 'TEAM_APPLICATION_REJECTED'
  | 'TEAM_MEMBER_JOINED'
  | 'TEAM_MEMBER_LEFT'
  | 'TEAM_MEMBER_KICKED'
  | 'TEAM_OWNER_DELEGATED'
  | 'POST_COMMENT_CREATED';

export type NotificationTargetType = 'TEAM' | 'TEAM_APPLICATION' | 'POST';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetId: number;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPageResponse {
  content: NotificationResponse[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}

export class NotificationStreamError extends Error {
  status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'NotificationStreamError';
    this.status = status;
  }
}

export function getNotifications(
  page: number,
  size = 20,
): Promise<NotificationPageResponse> {
  return requestApi<NotificationPageResponse>(
    `/api/notifications?page=${page}&size=${size}`,
  );
}

export function getUnreadNotificationCount(): Promise<UnreadNotificationCountResponse> {
  return requestApi<UnreadNotificationCountResponse>('/api/notifications/unread-count');
}

export function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  return requestApi<void>(
    `/api/notifications/${notificationId}/read`,
    { method: 'PATCH' },
  );
}

export function markAllNotificationsAsRead(): Promise<void> {
  return requestApi<void>(
    '/api/notifications/read-all',
    { method: 'PATCH' },
  );
}

export async function connectNotificationStream(
  signal: AbortSignal,
  onNotification: (notification: NotificationResponse) => void,
  onConnected?: () => void,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/notifications/stream`, {
    headers: {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
    credentials: 'include',
    signal,
  });

  if (!response.ok || !response.body) {
    throw new NotificationStreamError(
      `SSE connection failed with status ${response.status}`,
      response.status,
    );
  }

  onConnected?.();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventName = '';
  let dataLines: string[] = [];

  const dispatch = () => {
    if (eventName === 'notification' && dataLines.length > 0) {
      try {
        onNotification(JSON.parse(dataLines.join('\n')) as NotificationResponse);
      } catch {
        // Ignore a malformed event and keep the long-lived connection alive.
      }
    }
    eventName = '';
    dataLines = [];
  };

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true }).replaceAll('\r\n', '\n');
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line === '') {
        dispatch();
      } else if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
  }
}
