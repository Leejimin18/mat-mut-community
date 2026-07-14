import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';
import { formatDate } from '../utils/format-date';
import StarRating from '../components/ui/star-rating';
import CommentForm from '../components/community/comment-form';
import CommentList from '../components/community/comment-list';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from('mm_comments')
      .select('*, mm_users(nickname)')
      .eq('post_id', postId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    setComments(data ?? []);
  }, [postId]);

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);

      const [{ data: postData }, { data: imageData }] = await Promise.all([
        supabase.from('mm_posts').select('*, mm_categories(name), mm_users(nickname)').eq('post_id', postId).single(),
        supabase.from('mm_post_images').select('*').eq('post_id', postId).order('sort_order'),
      ]);

      setPost(postData);
      setImages(imageData ?? []);
      await loadComments();
      setIsLoading(false);

      if (postData) {
        await supabase
          .from('mm_posts')
          .update({ view_count: postData.view_count + 1 })
          .eq('post_id', postId);
      }
    };

    loadPost();
  }, [postId, loadComments]);

  const handleAddComment = async (content, rating) => {
    await supabase.from('mm_comments').insert({
      post_id: postId,
      user_id: user.id,
      content,
      rating,
    });
    await loadComments();
  };

  const handleDeleteComment = async (commentId) => {
    await supabase.from('mm_comments').delete().eq('comment_id', commentId);
    await loadComments();
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시물을 삭제하시겠어요?')) return;
    await supabase.from('mm_posts').delete().eq('post_id', postId);
    navigate('/posts');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">게시물을 찾을 수 없어요.</Typography>
      </Container>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <Box sx={{ width: '100%', flexGrow: 1, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          {post.mm_categories?.name && (
            <Chip label={post.mm_categories.name} size="small" color="secondary" sx={{ fontWeight: 700, mb: 1 }} />
          )}
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {post.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
            {post.store_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.main_ingredient} · {post.price ? `${post.price.toLocaleString()}원` : '가격 정보 없음'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <StarRating value={Number(post.avg_rating)} isReadOnly />
            <Typography variant="body2" color="text.secondary">
              {post.mm_users?.nickname ?? '익명'} · {formatDate(post.created_at)} · 조회 {post.view_count}
            </Typography>
          </Box>

          {images.length > 0 && (
            <ImageList cols={images.length > 1 ? 3 : 1} gap={8} sx={{ mt: 2 }}>
              {images.map((image) => (
                <ImageListItem key={image.image_id}>
                  <img src={image.image_url} alt={post.store_name} style={{ borderRadius: 12, objectFit: 'cover' }} />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          <Typography variant="body1" sx={{ mt: 3, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </Typography>

          {isOwner && (
            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Button component={Link} to={`/posts/${postId}/edit`} variant="outlined">
                수정
              </Button>
              <Button onClick={handleDeletePost} color="error" variant="outlined">
                삭제
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            댓글
          </Typography>

          {user ? (
            <Box sx={{ mb: 3 }}>
              <CommentForm onSubmit={handleAddComment} />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              댓글을 남기려면 로그인해주세요.
            </Typography>
          )}

          <CommentList comments={comments} currentUserId={user?.id} onDelete={handleDeleteComment} />
        </Paper>
      </Container>
    </Box>
  );
}
