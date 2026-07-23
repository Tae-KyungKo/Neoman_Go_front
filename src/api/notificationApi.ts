import { requestApi } from './httpClient';

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

export function getNotifications(
  page: number,
  accessToken: string,
  size = 20,
): Promise<NotificationPageResponse> {
  return requestApi<NotificationPageResponse>(
    `/api/notifications?page=${page}&size=${size}`,
    {},
    accessToken,
  );
}

export function getUnreadNotificationCount(
  accessToken: string,
): Promise<UnreadNotificationCountResponse> {
  return requestApi<UnreadNotificationCountResponse>(
    '/api/notifications/unread-count',
    {},
    accessToken,
  );
}

export function markNotificationAsRead(
  notificationId: number,
  accessToken: string,
): Promise<void> {
  return requestApi<void>(
    `/api/notifications/${notificationId}/read`,
    { method: 'PATCH' },
    accessToken,
  );
}

export function markAllNotificationsAsRead(accessToken: string): Promise<void> {
  return requestApi<void>(
    '/api/notifications/read-all',
    { method: 'PATCH' },
    accessToken,
  );
}
