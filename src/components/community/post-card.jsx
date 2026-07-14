import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import StarRating from '../ui/star-rating';

const FALLBACK_IMAGE = 'https://placehold.co/400x300/FFD43B/FF7A30?text=Mat_Mut';

/**
 * PostCard 컴포넌트
 *
 * Props:
 * @param {object} post - 게시물 데이터 [Required]
 *
 * Example usage:
 * <PostCard post={post} />
 */
export default function PostCard({ post }) {
  const thumbnailUrl =
    [...(post.mm_post_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ?? FALLBACK_IMAGE;
  const commentCount = post.mm_comments?.[0]?.count ?? 0;
  const displayRating = commentCount > 0 ? Number(post.avg_rating) : Number(post.author_rating ?? 0);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} to={`/posts/${post.post_id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia component="img" image={thumbnailUrl} alt={post.store_name} sx={{ height: 180, objectFit: 'cover' }} />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
          {post.mm_categories?.name && (
            <Chip label={post.mm_categories.name} size="small" color="secondary" sx={{ alignSelf: 'flex-start', fontWeight: 700 }} />
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
            {post.store_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.main_ingredient} · {post.price ? `${post.price.toLocaleString()}원` : '가격 정보 없음'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <StarRating value={displayRating} isReadOnly />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <Box component="span" sx={{ fontSize: '0.9rem' }}>💬</Box>
              <Typography variant="body2">{commentCount}</Typography>
            </Box>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
