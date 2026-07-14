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
import { supabase } from '../lib/supabase';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckEmailDuplicate = async () => {
    setEmailCheckMessage('');
    if (!email) {
      setEmailCheckMessage('이메일을 입력해주세요.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      setEmailCheckMessage('사용 가능한 이메일입니다.');
    } else {
      setEmailCheckMessage('이미 가입된 이메일입니다.');
    }
  };

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
      setErrorMessage(error.message);
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
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                label="이메일"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
              />
              <Button variant="outlined" onClick={handleCheckEmailDuplicate} sx={{ whiteSpace: 'nowrap', mt: 1 }}>
                중복 검사
              </Button>
            </Box>
            {emailCheckMessage && (
              <Typography variant="body2" sx={{ mt: -1, color: 'text.secondary' }}>
                {emailCheckMessage}
              </Typography>
            )}

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
