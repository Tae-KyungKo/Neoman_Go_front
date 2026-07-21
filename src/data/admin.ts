export interface AdminUser {
  id: number;
  nickname: string;
  loginId: string;
  joinedAt: string;
  status: 'active' | 'suspended';
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 1, nickname: '플레이어1', loginId: 'neomango_user', joinedAt: '2026.03.02', status: 'active' },
  { id: 2, nickname: '매너킹', loginId: 'manner_king', joinedAt: '2026.02.14', status: 'active' },
  { id: 3, nickname: '트롤유저22', loginId: 'troll_user22', joinedAt: '2026.06.01', status: 'suspended' },
  { id: 4, nickname: '광고봇9999', loginId: 'spam_bot99', joinedAt: '2026.07.10', status: 'suspended' },
];

export interface ReportedPost {
  id: number;
  postId: number;
  category: string;
  title: string;
  author: string;
  reportCount: number;
  date: string;
}

export const REPORTED_POSTS: ReportedPost[] = [
  { id: 1, postId: 6, category: '자유', title: '광고 문의는 여기로 연락주세요 (링크 첨부)', author: '광고봇9999', reportCount: 6, date: '07.18' },
  { id: 2, postId: 2, category: '팀모집', title: '저녁 듀오 아카데미 팀원 모집', author: '에임장인', reportCount: 2, date: '07.19' },
  { id: 3, postId: 4, category: '질문', title: '이 유저 욕설 심한데 신고 가능한가요', author: '매너킹', reportCount: 1, date: '07.17' },
];

export interface JoinRequest {
  id: number;
  nickname: string;
  level: string;
  message: string;
}

export const JOIN_REQUESTS: JoinRequest[] = [
  { id: 1, nickname: '신규지원1', level: '플래티넘', message: '매너 좋고 꾸준히 참여할 수 있어요!' },
  { id: 2, nickname: '신규지원2', level: '골드', message: '주말에 시간 많이 낼 수 있습니다.' },
];
