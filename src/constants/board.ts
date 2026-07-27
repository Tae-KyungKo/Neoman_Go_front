export type BoardTab = '자유' | '팀모집' | '질문';

export const BOARD_TABS: BoardTab[] = ['자유', '팀모집', '질문'];

export const BOARD_TYPE_BY_TAB = {
  자유: 'FREE',
  팀모집: 'RECRUITMENT',
  질문: 'QUESTION',
} as const;

export const BOARD_TAB_BY_TYPE = {
  FREE: '자유',
  RECRUITMENT: '팀모집',
  QUESTION: '질문',
} as const;

export const REPORT_REASONS = [
  '스팸 또는 광고',
  '욕설 또는 혐오 표현',
  '개인정보 노출',
  '허위 정보',
  '기타',
] as const;
