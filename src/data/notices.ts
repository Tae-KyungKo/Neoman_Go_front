export interface Notice {
  id: number;
  title: string;
  createdAt: string;
  updatedAt?: string;
  body: string;
}

export const NOTICES: Notice[] = [
  {
    id: 1,
    title: '서비스 이용약관 변경 안내',
    createdAt: '2026.07.14',
    body: '서비스 이용약관 일부 조항이 개정되었습니다. 변경된 약관은 공지 발행일로부터 적용됩니다. 자세한 내용은 고객센터로 문의해 주세요.',
  },
  {
    id: 2,
    title: '7월 정기 점검 안내',
    createdAt: '2026.07.10',
    updatedAt: '2026.07.11',
    body: '더 안정적인 서비스 제공을 위해 7월 정기 점검을 진행합니다. 점검 시간 동안 일부 기능 이용이 제한될 수 있으니 양해 부탁드립니다.',
  },
  {
    id: 3,
    title: '팀 매칭 정책 업데이트 안내',
    createdAt: '2026.06.28',
    body: '팀 가입 신청과 승인 정책이 일부 업데이트되었습니다. 같은 카테고리에서는 하나의 팀에만 소속될 수 있으며, 승인 시 다른 대기 중인 신청은 자동으로 취소됩니다.',
  },
  {
    id: 4,
    title: '너만고 커뮤니티 가이드라인',
    createdAt: '2026.06.15',
    body: '건강한 커뮤니티 문화를 위해 게시글과 댓글 작성 시 타인을 비방하거나 허위 정보를 유포하지 않도록 주의해 주세요.',
  },
  {
    id: 5,
    title: "신규 종목 '농구' 카테고리 오픈",
    createdAt: '2026.05.30',
    body: '너만고에 농구 카테고리가 새롭게 추가되었습니다. 지금 바로 농구 팀을 만들거나 가입 신청을 해보세요.',
  },
];

export const NOTICE_PAGE_SIZE = 2;
