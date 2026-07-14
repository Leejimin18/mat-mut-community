import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';
import { uploadPostImages } from '../utils/upload-post-images';
import StarRating from '../components/ui/star-rating';

export default function PostWritePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [mainIngredient, setMainIngredient] = useState('');
  const [price, setPrice] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('mm_categories')
      .select('*')
      .order('category_id')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Alert severity="warning">로그인 후 이용할 수 있어요.</Alert>
      </Container>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const { data: post, error: postError } = await supabase
        .from('mm_posts')
        .insert({
          user_id: user.id,
          category_id: categoryId || null,
          title,
          store_name: storeName,
          location,
          main_ingredient: mainIngredient,
          price: price ? Number(price) : null,
          content,
        })
        .select()
        .single();

      if (postError) throw postError;

      if (imageFiles.length > 0) {
        const imageUrls = await uploadPostImages(post.post_id, imageFiles);
        const imageRows = imageUrls.map((imageUrl, index) => ({
          post_id: post.post_id,
          image_url: imageUrl,
          sort_order: index,
        }));
        const { error: imageError } = await supabase.from('mm_post_images').insert(imageRows);
        if (imageError) throw imageError;
      }

      if (reviewComment) {
        const { error: commentError } = await supabase.from('mm_comments').insert({
          post_id: post.post_id,
          user_id: user.id,
          content: reviewComment,
          rating,
        });
        if (commentError) throw commentError;
      }

      navigate(`/posts/${post.post_id}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            🍽️ 맛집 등록
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="제목" value={title} onChange={(event) => setTitle(event.target.value)} required fullWidth />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="가게 상호명"
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="가게 위치" value={location} onChange={(event) => setLocation(event.target.value)} required fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField select label="음식 종류" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} fullWidth>
                  {categories.map((category) => (
                    <MenuItem key={category.category_id} value={category.category_id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="음식 주재료"
                  value={mainIngredient}
                  onChange={(event) => setMainIngredient(event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="가격"
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="상세 내용"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              fullWidth
              multiline
              minRows={5}
            />

            <Button variant="outlined" component="label">
              이미지 첨부 (다중 선택 가능)
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(event) => setImageFiles(Array.from(event.target.files))}
              />
            </Button>
            {imageFiles.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                선택된 이미지 {imageFiles.length}장
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">내 평점</Typography>
              <StarRating value={rating} onChange={setRating} isReadOnly={false} />
            </Box>
            <TextField
              label="한 줄 평"
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              fullWidth
            />

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              등록하기
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
