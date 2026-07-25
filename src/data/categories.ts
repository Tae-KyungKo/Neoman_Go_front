export interface Category {
  id: string;
  apiCode: 'LOL' | 'VALORANT' | 'PUBG' | 'FIFA' | 'SOCCER_FUTSAL' | 'BASKETBALL';
  ko: string;
  en: string;
}

export const CATEGORIES: Category[] = [
  { id: 'lol', apiCode: 'LOL', ko: 'LOL', en: 'League of Legends' },
  { id: 'valorant', apiCode: 'VALORANT', ko: '발로란트', en: 'Valorant' },
  { id: 'pubg', apiCode: 'PUBG', ko: '배틀그라운드', en: 'PUBG' },
  { id: 'fifa', apiCode: 'FIFA', ko: '피파', en: 'EA SPORTS FC' },
  { id: 'soccer', apiCode: 'SOCCER_FUTSAL', ko: '축구 · 풋살', en: 'Soccer & Futsal' },
  { id: 'basketball', apiCode: 'BASKETBALL', ko: '농구', en: 'Basketball' },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryByApiCode(apiCode: string): Category | undefined {
  return CATEGORIES.find((category) => category.apiCode === apiCode);
}
