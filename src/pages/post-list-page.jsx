import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase';
import PostCard from '../components/community/post-card';

const PAGE_SIZE = 12;

export default function PostListPage() {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const search = searchParams.get('search') ?? '';
  const location = searchParams.get('location') ?? '';
  const categoryId = searchParams.get('category') ?? '';

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);

      let query = supabase
        .from('mm_posts')
        .select('*, mm_categories(name), mm_post_images(image_url, sort_order), mm_comments(count)')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (search) {
        query = query.or(`store_name.ilike.%${search}%,location.ilike.%${search}%`);
      }
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data } = await query;
      setPosts(data ?? []);
      setIsLoading(false);
    };

    loadPosts();
  }, [search, location, categoryId]);

  return (
    <Box sx={{ width: '100%', flexGrow: 1, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 800, mb: { xs: 2, md: 3 } }}>
          맛집 목록
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, md: 2 }}>
            {posts.map((post) => (
              <Grid key={post.post_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <PostCard post={post} />
              </Grid>
            ))}
            {posts.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography color="text.secondary">검색 결과가 없어요.</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
