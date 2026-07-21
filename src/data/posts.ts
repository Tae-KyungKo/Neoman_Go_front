export type BoardTab = '공지' | '자유' | '팀모집' | '질문';

export const BOARD_TABS: BoardTab[] = ['자유', '팀모집', '질문'];

export interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
}

export interface Post {
  id: number;
  pinned?: boolean;
  isMine?: boolean;
  category: BoardTab;
  title: string;
  preview: string;
  body: string;
  author: string;
  views: number;
  date: string;
  comments: Comment[];
}

export const POSTS: Post[] = [
  {
    id: 1,
    pinned: true,
    category: '공지',
    title: '자유게시판 이용 규칙을 확인해 주세요',
    preview: '모두가 즐거운 커뮤니티를 위해 규칙을 지켜주세요.',
    body: '모두가 즐거운 커뮤니티를 위해 타인을 비방하거나 허위 정보를 유포하지 않도록 주의해 주세요. 위반 시 관리자에 의해 게시글이 삭제될 수 있습니다.',
    author: '운영자',
    views: 842,
    date: '07.18',
    comments: [],
  },
  {
    id: 2,
    isMine: true,
    category: '팀모집',
    title: '발로란트 다이아 듀오 구합니다 (매너 좋으신 분)',
    preview: '매일 저녁 9시 이후 활동 가능하신 분 환영합니다.',
    body: '매일 저녁 9시 이후 활동 가능하신 분 환영합니다. 티어는 다이아 이상, 마이크 소통 가능하신 분이면 더 좋아요. 편하게 댓글이나 쪽지 남겨주세요!',
    author: '에임장인',
    views: 214,
    date: '07.19',
    comments: [
      { id: 1, author: '매칭요정', content: '저도 관심 있어요! 쪽지 드렸습니다.', date: '07.19 14:02' },
      { id: 2, author: '에임장인', content: '@매칭요정 확인했습니다 감사해요!', date: '07.19 14:20' },
      { id: 3, author: '듀오구함', content: '티어랑 포지션 좀 더 자세히 알 수 있을까요?', date: '07.19 15:47' },
    ],
  },
  {
    id: 3,
    category: '자유',
    title: '오늘 풋살 하신 분들 다들 고생하셨어요',
    preview: '비 와서 걱정했는데 다행히 경기 잘 끝났네요 ㅎㅎ',
    body: '비 와서 걱정했는데 다행히 경기 잘 끝났네요 ㅎㅎ 다음 주에도 다들 화이팅입니다.',
    author: '골넣는냥이',
    views: 97,
    date: '07.19',
    comments: [],
  },
  {
    id: 4,
    category: '질문',
    title: '팀 매칭 신청하면 언제쯤 연락 오나요?',
    preview: '신청한 지 이틀 됐는데 아직 소식이 없어서요',
    body: '신청한 지 이틀 됐는데 아직 소식이 없어서요. 보통 얼마나 걸리나요?',
    author: '초보유저',
    views: 156,
    date: '07.18',
    comments: [],
  },
  {
    id: 5,
    category: '팀모집',
    title: '농구 3대3 팀원 1명 급구합니다',
    preview: '주말 오전 리그 참가할 팀원 찾습니다. 포지션 무관.',
    body: '주말 오전 리그 참가할 팀원 찾습니다. 포지션 무관이며 매너 좋으신 분이면 좋겠어요.',
    author: '덩크왕',
    views: 88,
    date: '07.17',
    comments: [],
  },
  {
    id: 6,
    category: '자유',
    title: '피파 온라인 복귀했는데 다들 뭐하고 지내세요',
    preview: '오랜만에 접속했는데 아는 얼굴이 없네요 반가운 분들',
    body: '오랜만에 접속했는데 아는 얼굴이 없네요. 반가운 분들 댓글 남겨주세요!',
    author: '컴백유저',
    views: 301,
    date: '07.16',
    comments: [],
  },
  {
    id: 7,
    category: '질문',
    title: '매너 점수는 어떻게 올릴 수 있나요',
    preview: '경기 후 평가를 잘 받으면 오르는 건가요?',
    body: '경기 후 평가를 잘 받으면 오르는 건가요? 궁금해서 여쭤봐요.',
    author: '궁금이',
    views: 132,
    date: '07.15',
    comments: [],
  },
];

export function getPostById(id: number): Post | undefined {
  return POSTS.find((p) => p.id === id);
}

export const REPORT_REASONS = ['스팸/광고성 게시글', '욕설 및 비방', '음란물/불건전한 내용', '도배/중복 게시글', '기타'];
