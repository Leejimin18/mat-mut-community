import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import IconButton from '@mui/material/IconButton';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';
import { uploadPostImages } from '../utils/upload-post-images';
import StarRating from '../components/ui/star-rating';

export default function PostEditPage() {
  const { postId } = useParams();
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
  const [authorRating, setAuthorRating] = useState(5);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      const [{ data: post }, { data: images }, { data: categoriesData }] = await Promise.all([
        supabase.from('mm_posts').select('*').eq('post_id', postId).single(),
        supabase.from('mm_post_images').select('*').eq('post_id', postId).order('sort_order'),
        supabase.from('mm_categories').select('*').order('category_id'),
      ]);

      if (post) {
        setTitle(post.title);
        setStoreName(post.store_name);
        setLocation(post.location ?? '');
        setCategoryId(post.category_id ?? '');
        setMainIngredient(post.main_ingredient ?? '');
        setPrice(post.price ?? '');
        setContent(post.content ?? '');
        setAuthorRating(post.author_rating ?? 5);
      }
      setExistingImages(images ?? []);
      setCategories(categoriesData ?? []);
      setIsLoading(false);
    };

    loadPost();
  }, [postId]);

  const handleRemoveExistingImage = async (imageId) => {
    await supabase.from('mm_post_images').delete().eq('image_id', imageId);
    setExistingImages((prev) => prev.filter((image) => image.image_id !== imageId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from('mm_posts')
        .update({
          title,
          store_name: storeName,
          location,
          category_id: categoryId || null,
          main_ingredient: mainIngredient,
          price: price ? Number(price) : null,
          content,
          author_rating: authorRating,
          updated_at: new Date().toISOString(),
        })
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      if (newImageFiles.length > 0) {
        const imageUrls = await uploadPostImages(postId, newImageFiles);
        const startOrder = existingImages.length;
        const imageRows = imageUrls.map((imageUrl, index) => ({
          post_id: postId,
          image_url: imageUrl,
          sort_order: startOrder + index,
        }));
        const { error: imageError } = await supabase.from('mm_post_images').insert(imageRows);
        if (imageError) throw imageError;
      }

      navigate(`/posts/${postId}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', flexGrow: 1, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            ✏️ 맛집 게시물 수정
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

            {existingImages.length > 0 && (
              <ImageList cols={4} gap={8} sx={{ m: 0 }}>
                {existingImages.map((image) => (
                  <ImageListItem key={image.image_id} sx={{ position: 'relative' }}>
                    <img src={image.image_url} alt="" style={{ height: 100, objectFit: 'cover' }} />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveExistingImage(image.image_id)}
                      sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'background.paper' }}
                    >
                      ✕
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            )}

            <Button variant="outlined" component="label">
              이미지 추가 (다중 선택 가능)
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(event) => setNewImageFiles(Array.from(event.target.files))}
              />
            </Button>
            {newImageFiles.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                새로 추가할 이미지 {newImageFiles.length}장
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">내 평점</Typography>
              <StarRating value={authorRating} onChange={setAuthorRating} isReadOnly={false} />
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              수정 완료
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
