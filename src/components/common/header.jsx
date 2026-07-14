import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import { useAuth } from '../../hooks/use-auth';

export default function Header() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [keyword, setKeyword] = useState('');

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/posts?search=${encodeURIComponent(keyword)}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: { xs: 1, md: 3 }, flexWrap: 'wrap', py: 1 }}>
        <Typography
          component={Link}
          to="/"
          variant="h6"
          sx={{ fontWeight: 800, color: 'primary.main', textDecoration: 'none', flexShrink: 0 }}
        >
          🍊 Mat_Mut
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            maxWidth: { xs: '100%', md: 480 },
            bgcolor: 'secondary.light',
            borderRadius: 999,
            px: 2,
            order: { xs: 3, md: 0 },
          }}
        >
          <Box component="span" sx={{ fontSize: '0.95rem' }}>🔍</Box>
          <InputBase
            placeholder="가게 이름, 지역으로 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            sx={{ ml: 1, flex: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, ml: 'auto', alignItems: 'center' }}>
          <Button component={Link} to="/posts" color="inherit">
            맛집 목록
          </Button>
          {user ? (
            <>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {profile?.nickname ?? ''}님
              </Typography>
              <Button component={Link} to="/posts/new" variant="contained" color="primary">
                글쓰기
              </Button>
              <Button onClick={handleSignOut} color="inherit">
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" color="inherit">
                로그인
              </Button>
              <Button component={Link} to="/signup" variant="contained" color="primary">
                회원가입
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
