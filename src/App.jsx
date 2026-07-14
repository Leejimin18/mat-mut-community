import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AuthProvider } from './contexts/auth-context';
import Header from './components/common/header';
import HomePage from './pages/home-page';
import LoginPage from './pages/login-page';
import SignupPage from './pages/signup-page';
import PostListPage from './pages/post-list-page';
import PostDetailPage from './pages/post-detail-page';
import PostWritePage from './pages/post-write-page';
import PostEditPage from './pages/post-edit-page';
import MyPage from './pages/my-page';
import AdminPage from './pages/admin-page';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/posts" element={<PostListPage />} />
              <Route path="/posts/new" element={<PostWritePage />} />
              <Route path="/posts/:postId" element={<PostDetailPage />} />
              <Route path="/posts/:postId/edit" element={<PostEditPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
