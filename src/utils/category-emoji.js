const CATEGORY_EMOJIS = {
  한식: '🍚',
  중식: '🥡',
  일식: '🍣',
  양식: '🍝',
  분식: '🍢',
  '카페/디저트': '🍰',
  기타: '🍽️',
};

export function getCategoryEmoji(categoryName) {
  return CATEGORY_EMOJIS[categoryName] ?? '🍴';
}
