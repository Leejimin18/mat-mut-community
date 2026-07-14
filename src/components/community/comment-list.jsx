import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import StarRating from '../ui/star-rating';
import { formatDate } from '../../utils/format-date';

/**
 * CommentList 컴포넌트
 *
 * Props:
 * @param {array} comments - 댓글 목록 [Required]
 * @param {string} currentUserId - 현재 로그인한 사용자 id [Optional]
 * @param {function} onDelete - 댓글 삭제 시 실행할 함수 (commentId) [Optional]
 *
 * Example usage:
 * <CommentList comments={comments} currentUserId={user.id} onDelete={handleDelete} />
 */
export default function CommentList({ comments, currentUserId, onDelete }) {
  if (comments.length === 0) {
    return <Typography color="text.secondary">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {comments.map((comment) => (
        <Paper key={comment.comment_id} variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {comment.mm_users?.nickname ?? '익명'}
                </Typography>
                {comment.rating != null && <StarRating value={comment.rating} isReadOnly />}
              </Box>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {comment.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.created_at)}
              </Typography>
            </Box>
            {currentUserId === comment.user_id && (
              <IconButton size="small" onClick={() => onDelete(comment.comment_id)}>
                🗑️
              </IconButton>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
