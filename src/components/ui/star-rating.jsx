import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';

/**
 * StarRating 컴포넌트
 *
 * Props:
 * @param {number} value - 평점 값 (0~5) [Required]
 * @param {function} onChange - 평점 변경 시 실행할 함수 [Optional]
 * @param {boolean} isReadOnly - 읽기 전용 여부 [Optional, 기본값: true]
 *
 * Example usage:
 * <StarRating value={4.5} isReadOnly />
 */
export default function StarRating({ value, onChange, isReadOnly = true }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Rating
        value={value}
        precision={0.5}
        readOnly={isReadOnly}
        onChange={(_event, newValue) => onChange?.(newValue)}
        sx={{ color: 'primary.main' }}
      />
    </Box>
  );
}
