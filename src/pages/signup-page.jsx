import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useAuth } from '../hooks/use-auth';

const DUPLICATE_EMAIL_ERROR_PATTERN = /already registered|already exists|already been registered/i;

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isAgreed) {
      setErrorMessage('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, nickname);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(
        DUPLICATE_EMAIL_ERROR_PATTERN.test(error.message) ? '이미 가입된 이메일입니다.' : error.message,
      );
      return;
    }
    navigate('/login');
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
            🍊 회원가입
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="이메일"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />

            <TextField
              label="닉네임"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="비밀번호"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="비밀번호 확인"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              required
              fullWidth
            />

            <FormControlLabel
              control={<Checkbox checked={isAgreed} onChange={(event) => setIsAgreed(event.target.checked)} />}
              label="이용약관 및 개인정보처리방침에 동의합니다."
            />

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
              회원가입
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button component={Link} to="/login" color="inherit">
              로그인 하러가기
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
