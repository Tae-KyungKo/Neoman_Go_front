export type BoardTab = '공지' | '자유' | '팀모집' | '질문';

export const BOARD_TABS: BoardTab[] = ['자유', '팀모집', '질문'];

export const REPORT_REASONS = [
  '스팸 또는 광고',
  '욕설 또는 혐오 표현',
  '개인정보 노출',
  '허위 정보',
  '기타',
] as const;
