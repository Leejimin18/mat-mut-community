import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase';
import PostCard from '../components/community/post-card';

export default function HomePage() {
  const navigate = useNavigate();
  const [popularPosts, setPopularPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locationKeyword, setLocationKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);

      const [{ data: postsData }, { data: categoriesData }] = await Promise.all([
        supabase
          .from('mm_posts')
          .select('*, mm_categories(name), mm_post_images(image_url, sort_order), mm_comments(count)')
          .order('view_count', { ascending: false })
          .limit(8),
        supabase.from('mm_categories').select('*').order('category_id'),
      ]);

      setPopularPosts(postsData ?? []);
      setCategories(categoriesData ?? []);
      setIsLoading(false);
    };

    loadHomeData();
  }, []);

  const handleLocationSearch = (event) => {
    event.preventDefault();
    navigate(`/posts?location=${encodeURIComponent(locationKeyword)}`);
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                음식 종류
              </Typography>
              <List dense disablePadding>
                {categories.map((category) => (
                  <ListItemButton
                    key={category.category_id}
                    onClick={() => navigate(`/posts?category=${category.category_id}`)}
                    sx={{ borderRadius: 2 }}
                  >
                    {category.name}
                  </ListItemButton>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                가게 위치 검색
              </Typography>
              <Box component="form" onSubmit={handleLocationSearch}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="예: 강남구"
                  value={locationKeyword}
                  onChange={(event) => setLocationKeyword(event.target.value)}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: { xs: 2, md: 3 } }}>
              🔥 지금 인기있는 맛집
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <Grid container spacing={{ xs: 2, md: 2 }}>
                {popularPosts.map((post) => (
                  <Grid key={post.post_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <PostCard post={post} />
                  </Grid>
                ))}
                {popularPosts.length === 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography color="text.secondary">아직 등록된 맛집이 없어요. 첫 맛집을 등록해보세요!</Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
