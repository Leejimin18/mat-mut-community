import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import StarRating from '../ui/star-rating';

/**
 * CommentForm 컴포넌트
 *
 * Props:
 * @param {function} onSubmit - 댓글 등록 시 실행할 함수 (content, rating) [Required]
 *
 * Example usage:
 * <CommentForm onSubmit={handleAddComment} />
 */
export default function CommentForm({ onSubmit }) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    await onSubmit(content, rating);
    setIsSubmitting(false);
    setContent('');
    setRating(5);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">평점</Typography>
        <StarRating value={rating} onChange={setRating} isReadOnly={false} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="댓글을 남겨보세요"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          등록
        </Button>
      </Box>
    </Box>
  );
}
