export const TEAM_CATEGORIES = [
  { code: 'SOCCER', label: '축구' },
  { code: 'FUTSAL', label: '풋살' },
  { code: 'BASKETBALL', label: '농구' },
  { code: 'LOL', label: '리그 오브 레전드' },
  { code: 'VALORANT', label: '발로란트' },
  { code: 'PUBG', label: '배틀그라운드' },
  { code: 'FIFA', label: '피파' },
]

const CATEGORY_MAP = new Map(
  TEAM_CATEGORIES.map((category) => [category.code, category]),
)

export function normalizeCategoryCode(categoryCode) {
  return String(categoryCode ?? '').trim().toUpperCase()
}

export function isValidCategoryCode(categoryCode) {
  return CATEGORY_MAP.has(normalizeCategoryCode(categoryCode))
}

export function getCategoryLabel(categoryCode) {
  return CATEGORY_MAP.get(normalizeCategoryCode(categoryCode))?.label ?? ''
}

export function getCategoryByCode(categoryCode) {
  return CATEGORY_MAP.get(normalizeCategoryCode(categoryCode)) ?? null
}
