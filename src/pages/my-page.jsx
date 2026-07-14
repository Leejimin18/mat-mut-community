import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';
import { formatDate } from '../utils/format-date';
import PostCard from '../components/community/post-card';

const TABS = ['posts', 'comments', 'favorites', 'recent', 'profile'];

export default function MyPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  const [nickname, setNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    if (profile) setNickname(profile.nickname ?? '');
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const loadMyPageData = async () => {
      setIsLoading(true);

      const postSelect = '*, mm_categories(name), mm_post_images(image_url, sort_order), mm_comments(count)';

      const [postsRes, commentsRes, favoritesRes, viewsRes] = await Promise.all([
        supabase.from('mm_posts').select(postSelect).eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase
          .from('mm_comments')
          .select('*, mm_posts(post_id, title, store_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('mm_favorites')
          .select(`created_at, mm_posts(${postSelect})`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('mm_post_views')
          .select(`viewed_at, mm_posts(${postSelect})`)
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(50),
      ]);

      setMyPosts(postsRes.data ?? []);
      setMyComments(commentsRes.data ?? []);
      setFavoritePosts((favoritesRes.data ?? []).map((row) => row.mm_posts).filter(Boolean));

      const seenPostIds = new Set();
      const dedupedRecentPosts = [];
      for (const row of viewsRes.data ?? []) {
        if (!row.mm_posts || seenPostIds.has(row.mm_posts.post_id)) continue;
        seenPostIds.add(row.mm_posts.post_id);
        dedupedRecentPosts.push(row.mm_posts);
      }
      setRecentPosts(dedupedRecentPosts);

      setIsLoading(false);
    };

    loadMyPageData();
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Alert severity="warning">로그인 후 이용할 수 있어요.</Alert>
      </Container>
    );
  }

  const handleUpdateNickname = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    const { error } = await supabase.from('mm_users').update({ nickname }).eq('user_id', user.id);
    setProfileMessage(error ? error.message : '닉네임이 변경됐어요.');
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    if (!newPassword) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setProfileMessage(error ? error.message : '비밀번호가 변경됐어요.');
    setNewPassword('');
  };

  const handleWithdraw = async () => {
    if (!window.confirm('정말 탈퇴하시겠어요? 탈퇴 후 계정이 비활성화됩니다.')) return;
    await supabase.from('mm_users').update({ status: 'suspended' }).eq('user_id', user.id);
    await signOut();
    navigate('/');
  };

  const renderPostGrid = (posts, emptyMessage) => (
    <Grid container spacing={2}>
      {posts.map((post) => (
        <Grid key={post.post_id} size={{ xs: 12, sm: 6, md: 4 }}>
          <PostCard post={post} />
        </Grid>
      ))}
      {posts.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box sx={{ width: '100%', flexGrow: 1, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 800, mb: { xs: 2, md: 3 } }}>
          🙋 마이페이지
        </Typography>

        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Tabs
            value={activeTab}
            onChange={(_event, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab value="posts" label="내가 쓴 글" />
            <Tab value="comments" label="내가 쓴 댓글" />
            <Tab value="favorites" label="즐겨찾기" />
            <Tab value="recent" label="최근 본 글" />
            <Tab value="profile" label="프로필 수정" />
          </Tabs>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              {activeTab === 'posts' && renderPostGrid(myPosts, '아직 작성한 글이 없어요.')}

              {activeTab === 'comments' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {myComments.map((comment) => (
                    <Paper key={comment.comment_id} variant="outlined" sx={{ p: 2 }}>
                      <Typography
                        component={Link}
                        to={`/posts/${comment.mm_posts?.post_id}`}
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}
                      >
                        {comment.mm_posts?.store_name} - {comment.mm_posts?.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Paper>
                  ))}
                  {myComments.length === 0 && <Typography color="text.secondary">아직 작성한 댓글이 없어요.</Typography>}
                </Box>
              )}

              {activeTab === 'favorites' && renderPostGrid(favoritePosts, '즐겨찾기한 맛집이 없어요.')}

              {activeTab === 'recent' && renderPostGrid(recentPosts, '최근 본 글이 없어요.')}

              {activeTab === 'profile' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 420 }}>
                  {profileMessage && <Alert severity="info">{profileMessage}</Alert>}

                  <Box component="form" onSubmit={handleUpdateNickname} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      label="닉네임"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      fullWidth
                    />
                    <Button type="submit" variant="contained">
                      변경
                    </Button>
                  </Box>

                  <Box component="form" onSubmit={handleUpdatePassword} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      type="password"
                      label="새 비밀번호"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      fullWidth
                    />
                    <Button type="submit" variant="contained">
                      변경
                    </Button>
                  </Box>

                  <Button onClick={handleWithdraw} color="error" variant="outlined">
                    회원 탈퇴
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
