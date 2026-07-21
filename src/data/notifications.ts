import type { IconName } from '../components/icons/Icon';

export interface Notification {
  id: number;
  icon: IconName;
  text: string;
  time: string;
  unread: boolean;
  targetPath: string;
}

export const NOTIFICATIONS_TODAY: Notification[] = [
  {
    id: 1,
    icon: 'Persons',
    text: '강남 주말 풋살팀 참가 신청이 승인되었어요.',
    time: '14:20',
    unread: true,
    targetPath: '/mypage/teams',
  },
  {
    id: 2,
    icon: 'Message',
    text: '내 게시글에 새 댓글이 달렸어요: "티어랑 포지션 좀 더..."',
    time: '11:05',
    unread: true,
    targetPath: '/board/2',
  },
];

export const NOTIFICATIONS_YESTERDAY: Notification[] = [
  {
    id: 3,
    icon: 'Heart',
    text: '내 게시글에 좋아요가 눌렸어요.',
    time: '19:44',
    unread: false,
    targetPath: '/board/2',
  },
  {
    id: 4,
    icon: 'Flag',
    text: '7월 정기 점검 안내 공지가 등록되었어요.',
    time: '09:00',
    unread: false,
    targetPath: '/notices/2',
  },
];
