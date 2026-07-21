export type TeamLevel = '즐겜' | '빡겜';
export type TeamStatus = 'recruiting' | 'closed';
export type TeamRole = '팀장' | '팀원';

export interface TeamMember {
  name: string;
  role: TeamRole;
  level: string;
}

export interface Team {
  id: number;
  categoryId: string;
  name: string;
  level: TeamLevel;
  location: string;
  time: string;
  description: string;
  status: TeamStatus;
  ownerName: string;
  createdAt: string;
  roster: TeamMember[];
}

const LEVEL_POOL = ['다이아', '플래티넘', '골드', '실버'];

function buildRoster(memberCount: number, ownerName: string): TeamMember[] {
  const roster: TeamMember[] = [{ name: ownerName, role: '팀장', level: LEVEL_POOL[0] }];
  for (let i = 1; i < memberCount; i++) {
    roster.push({ name: `팀원${i}`, role: '팀원', level: LEVEL_POOL[i % LEVEL_POOL.length] });
  }
  return roster;
}

export const TEAMS: Team[] = [
  {
    id: 1,
    categoryId: 'lol',
    name: '골드 이상만 오세요',
    level: '빡겜',
    location: '온라인',
    time: '매일 20:00~',
    description: '매너 좋고 꾸준히 활동하실 분들과 함께 실력을 쌓아가는 팀입니다. 초보자도 편하게 참여하실 수 있어요.',
    status: 'recruiting',
    ownerName: '김주장',
    createdAt: '2026.05.02',
    roster: buildRoster(4, '김주장'),
  },
  {
    id: 2,
    categoryId: 'soccer',
    name: '강남 주말 풋살팀',
    level: '즐겜',
    location: '서울 강남구',
    time: '토 09:00~11:00',
    description: '매주 토요일 아침 풋살을 즐기는 팀입니다. 실력보다 매너를 중요하게 생각해요.',
    status: 'recruiting',
    ownerName: '플레이어1',
    createdAt: '2026.04.11',
    roster: buildRoster(8, '플레이어1'),
  },
  {
    id: 3,
    categoryId: 'valorant',
    name: '저녁 듀오 아카데미',
    level: '빡겜',
    location: '온라인',
    time: '평일 21:00~23:00',
    description: '다이아 이상, 마이크 소통 가능하신 분이면 더 좋아요. 편하게 신청해주세요.',
    status: 'recruiting',
    ownerName: '에임장인',
    createdAt: '2026.06.20',
    roster: buildRoster(3, '에임장인'),
  },
  {
    id: 4,
    categoryId: 'basketball',
    name: '화요 야간 농구 모임',
    level: '즐겜',
    location: '서울 송파구',
    time: '화 19:00~21:00',
    description: '화요일 저녁마다 모여서 편하게 농구하는 모임이에요.',
    status: 'recruiting',
    ownerName: '덩크왕',
    createdAt: '2026.03.15',
    roster: buildRoster(6, '덩크왕'),
  },
  {
    id: 5,
    categoryId: 'pubg',
    name: '스쿼드 상시모집 클랜',
    level: '즐겜',
    location: '온라인',
    time: '주말 저녁',
    description: '스쿼드 상시 모집 중인 클랜입니다. 언제든 편하게 신청하세요.',
    status: 'recruiting',
    ownerName: '치킨헌터',
    createdAt: '2026.02.28',
    roster: buildRoster(2, '치킨헌터'),
  },
  {
    id: 6,
    categoryId: 'fifa',
    name: '디비전 1 듀오 구함',
    level: '빡겜',
    location: '온라인',
    time: '협의 가능',
    description: '디비전 1 실력자와 듀오를 구하고 있어요.',
    status: 'closed',
    ownerName: '슈퍼스타K',
    createdAt: '2026.01.10',
    roster: buildRoster(1, '슈퍼스타K'),
  },
  {
    id: 7,
    categoryId: 'soccer',
    name: '목동 아마추어 축구단',
    level: '즐겜',
    location: '서울 양천구',
    time: '일 07:00~09:00',
    description: '일요일 아침마다 모이는 아마추어 축구단입니다. 신규 팀원 항상 환영해요.',
    status: 'recruiting',
    ownerName: '골넣는냥이',
    createdAt: '2025.11.02',
    roster: buildRoster(14, '골넣는냥이'),
  },
  {
    id: 8,
    categoryId: 'lol',
    name: '칼바람 즐겜 모임',
    level: '즐겜',
    location: '온라인',
    time: '매일 저녁 자유',
    description: '칼바람 나락만 도는 즐겜 모임입니다. 부담 없이 오세요.',
    status: 'recruiting',
    ownerName: '즐겜요정',
    createdAt: '2026.05.30',
    roster: buildRoster(7, '즐겜요정'),
  },
];

export function getTeamById(id: number): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getTeamsByCategory(categoryId: string): Team[] {
  return TEAMS.filter((t) => t.categoryId === categoryId);
}

export interface MyTeamEntry {
  teamId: number;
  role: TeamRole;
}

export const MY_TEAMS: MyTeamEntry[] = [
  { teamId: 1, role: '팀원' },
  { teamId: 2, role: '팀장' },
];

export interface MyApplication {
  id: number;
  teamId: number;
  status: 'pending' | 'rejected' | 'approved';
}

export const MY_APPLICATIONS: MyApplication[] = [
  { id: 101, teamId: 3, status: 'pending' },
  { id: 102, teamId: 4, status: 'rejected' },
];
