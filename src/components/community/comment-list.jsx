import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import StarRating from '../ui/star-rating';
import CommentForm from './comment-form';
import ReportDialog from './report-dialog';
import { formatDate } from '../../utils/format-date';

/**
 * CommentList 컴포넌트
 *
 * Props:
 * @param {array} comments - 댓글 목록 (대댓글 포함, 평탄화된 배열) [Required]
 * @param {string} currentUserId - 현재 로그인한 사용자 id [Optional]
 * @param {boolean} isPostOwner - 현재 사용자가 게시물 작성자인지 여부 [Optional, 기본값: false]
 * @param {Set} likedCommentIds - 현재 사용자가 좋아요한 댓글 id 집합 [Optional]
 * @param {function} onDelete - 댓글 삭제 시 실행할 함수 (commentId) [Optional]
 * @param {function} onReply - 답글 등록 시 실행할 함수 (parentCommentId, content) [Optional]
 * @param {function} onToggleLike - 좋아요 토글 시 실행할 함수 (commentId, isLiked) [Optional]
 * @param {function} onTogglePin - 상단 고정 토글 시 실행할 함수 (commentId, isPinned) [Optional]
 * @param {function} onReport - 신고 접수 시 실행할 함수 (commentId, reason) [Optional]
 *
 * Example usage:
 * <CommentList comments={comments} currentUserId={user.id} onDelete={handleDelete} />
 */
export default function CommentList({
  comments,
  currentUserId,
  isPostOwner = false,
  likedCommentIds = new Set(),
  onDelete,
  onReply,
  onToggleLike,
  onTogglePin,
  onReport,
}) {
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [reportTargetId, setReportTargetId] = useState(null);

  const topLevelComments = comments
    .filter((comment) => !comment.parent_comment_id)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const getReplies = (parentId) =>
    comments
      .filter((comment) => comment.parent_comment_id === parentId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const renderComment = (comment, isReply) => {
    const isLiked = likedCommentIds.has(comment.comment_id);

    return (
      <Paper key={comment.comment_id} variant="outlined" sx={{ p: 2, ml: isReply ? { xs: 2, md: 4 } : 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {comment.is_pinned && <Chip label="📌 고정" size="small" color="secondary" />}
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

            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                onClick={() => onToggleLike?.(comment.comment_id, isLiked)}
                sx={{ minWidth: 0, color: isLiked ? 'error.main' : 'text.secondary' }}
              >
                {isLiked ? '❤️' : '🤍'} {comment.like_count}
              </Button>
              {!isReply && currentUserId && (
                <Button size="small" onClick={() => setReplyOpenId(replyOpenId === comment.comment_id ? null : comment.comment_id)}>
                  답글
                </Button>
              )}
              {isPostOwner && !isReply && (
                <Button size="small" onClick={() => onTogglePin?.(comment.comment_id, comment.is_pinned)}>
                  {comment.is_pinned ? '고정 해제' : '상단 고정'}
                </Button>
              )}
              {currentUserId && currentUserId !== comment.user_id && (
                <Button size="small" color="warning" onClick={() => setReportTargetId(comment.comment_id)}>
                  신고
                </Button>
              )}
            </Box>

            {replyOpenId === comment.comment_id && (
              <Box sx={{ mt: 1.5 }}>
                <CommentForm
                  isReply
                  onSubmit={async (content) => {
                    await onReply?.(comment.comment_id, content);
                    setReplyOpenId(null);
                  }}
                />
              </Box>
            )}
          </Box>
          {currentUserId === comment.user_id && (
            <IconButton size="small" onClick={() => onDelete?.(comment.comment_id)}>
              🗑️
            </IconButton>
          )}
        </Box>
      </Paper>
    );
  };

  if (topLevelComments.length === 0) {
    return <Typography color="text.secondary">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {topLevelComments.map((comment) => (
        <Box key={comment.comment_id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {renderComment(comment, false)}
          {getReplies(comment.comment_id).map((reply) => renderComment(reply, true))}
        </Box>
      ))}

      <ReportDialog
        isOpen={reportTargetId != null}
        onClose={() => setReportTargetId(null)}
        onSubmit={(reason) => onReport?.(reportTargetId, reason)}
      />
    </Box>
  );
}
