export interface Category {
  id: string;
  ko: string;
  en: string;
}

export const CATEGORIES: Category[] = [
  { id: 'lol', ko: 'LOL', en: 'League of Legends' },
  { id: 'valorant', ko: '발로란트', en: 'Valorant' },
  { id: 'pubg', ko: '배틀그라운드', en: 'PUBG' },
  { id: 'fifa', ko: '피파', en: 'EA SPORTS FC' },
  { id: 'soccer', ko: '축구 · 풋살', en: 'Soccer & Futsal' },
  { id: 'basketball', ko: '농구', en: 'Basketball' },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
