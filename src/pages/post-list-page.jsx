import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { supabase } from '../lib/supabase';
import PostCard from '../components/community/post-card';

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순', column: 'view_count' },
  { value: 'latest', label: '최신순', column: 'created_at' },
  { value: 'rating', label: '평점순', column: 'avg_rating' },
];

const PRICE_RANGE_OPTIONS = [
  { value: '', label: '전체 가격대' },
  { value: 'under-10000', label: '1만원 이하', min: 0, max: 10000 },
  { value: '10000-20000', label: '1만원 ~ 2만원', min: 10000, max: 20000 },
  { value: '20000-30000', label: '2만원 ~ 3만원', min: 20000, max: 30000 },
  { value: 'over-30000', label: '3만원 이상', min: 30000, max: null },
];

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const search = searchParams.get('search') ?? '';
  const location = searchParams.get('location') ?? '';
  const categoryId = searchParams.get('category') ?? '';
  const priceRange = searchParams.get('price') ?? '';
  const sort = searchParams.get('sort') ?? 'latest';

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    supabase
      .from('mm_categories')
      .select('*')
      .order('category_id')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);

      const sortOption = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[1];
      const priceOption = PRICE_RANGE_OPTIONS.find((option) => option.value === priceRange);

      let query = supabase
        .from('mm_posts')
        .select('*, mm_categories(name), mm_post_images(image_url, sort_order), mm_comments(count)')
        .order(sortOption.column, { ascending: false })
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
      if (priceOption?.min != null) {
        query = query.gte('price', priceOption.min);
      }
      if (priceOption?.max != null) {
        query = query.lte('price', priceOption.max);
      }

      const { data } = await query;
      setPosts(data ?? []);
      setIsLoading(false);
    };

    loadPosts();
  }, [search, location, categoryId, priceRange, sort]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateParam('search', searchInput);
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 800, mb: { xs: 2, md: 3 } }}>
          맛집 목록
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}
          >
            <TextField
              size="small"
              placeholder="가게 이름, 지역 검색"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 220 } }}
            />
            <TextField
              select
              size="small"
              label="음식 종류"
              value={categoryId}
              onChange={(event) => updateParam('category', event.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">전체</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.category_id} value={String(category.category_id)}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="가격대"
              value={priceRange}
              onChange={(event) => updateParam('price', event.target.value)}
              sx={{ minWidth: 150 }}
            >
              {PRICE_RANGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="정렬"
              value={sort}
              onChange={(event) => updateParam('sort', event.target.value)}
              sx={{ minWidth: 120 }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained">
              검색
            </Button>
          </Box>
        </Paper>

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
