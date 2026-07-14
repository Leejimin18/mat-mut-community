const CATEGORY_COLORS = {
  한식: { bg: '#FFE0B2', text: '#E65100' },
  중식: { bg: '#FFCDD2', text: '#C62828' },
  일식: { bg: '#BBDEFB', text: '#1565C0' },
  양식: { bg: '#C8E6C9', text: '#2E7D32' },
  분식: { bg: '#F8BBD0', text: '#AD1457' },
  '카페/디저트': { bg: '#D7CCC8', text: '#4E342E' },
  기타: { bg: '#E0E0E0', text: '#424242' },
};

const DEFAULT_COLOR = { bg: '#FFF3E0', text: '#E65100' };

export function getCategoryColor(categoryName) {
  return CATEGORY_COLORS[categoryName] ?? DEFAULT_COLOR;
}
