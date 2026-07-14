import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/use-auth';
import { formatDate } from '../utils/format-date';

export default function AdminPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('reports');
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [targetSummaries, setTargetSummaries] = useState({});
  const [users, setUsers] = useState([]);

  const loadReports = async () => {
    const { data: reportRows } = await supabase
      .from('mm_reports')
      .select('*, mm_users!mm_reports_reporter_id_fkey(nickname)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    setReports(reportRows ?? []);

    const postIds = (reportRows ?? []).filter((r) => r.target_type === 'post').map((r) => r.target_id);
    const commentIds = (reportRows ?? []).filter((r) => r.target_type === 'comment').map((r) => r.target_id);

    const [{ data: postRows }, { data: commentRows }] = await Promise.all([
      postIds.length
        ? supabase.from('mm_posts').select('post_id, title, store_name, is_hidden').in('post_id', postIds)
        : Promise.resolve({ data: [] }),
      commentIds.length
        ? supabase.from('mm_comments').select('comment_id, content, is_hidden').in('comment_id', commentIds)
        : Promise.resolve({ data: [] }),
    ]);

    const summaries = {};
    for (const post of postRows ?? []) {
      summaries[`post:${post.post_id}`] = { label: `${post.store_name} - ${post.title}`, isHidden: post.is_hidden };
    }
    for (const comment of commentRows ?? []) {
      summaries[`comment:${comment.comment_id}`] = { label: comment.content, isHidden: comment.is_hidden };
    }
    setTargetSummaries(summaries);
  };

  const loadUsers = async () => {
    const { data } = await supabase.from('mm_users').select('*').order('created_at', { ascending: false });
    setUsers(data ?? []);
  };

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([loadReports(), loadUsers()]);
      setIsLoading(false);
    };
    loadAll();
  }, [profile]);

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Alert severity="error">관리자만 접근할 수 있어요.</Alert>
      </Container>
    );
  }

  const handleResolveReport = async (report, shouldDeleteTarget) => {
    if (shouldDeleteTarget) {
      const table = report.target_type === 'post' ? 'mm_posts' : 'mm_comments';
      const idColumn = report.target_type === 'post' ? 'post_id' : 'comment_id';
      await supabase.from(table).delete().eq(idColumn, report.target_id);
    }

    await supabase
      .from('mm_reports')
      .update({ status: shouldDeleteTarget ? 'resolved' : 'rejected', resolved_at: new Date().toISOString() })
      .eq('report_id', report.report_id);

    await loadReports();
  };

  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    await supabase.from('mm_users').update({ status: nextStatus }).eq('user_id', targetUser.user_id);
    await loadUsers();
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 800, mb: { xs: 2, md: 3 } }}>
          🛠️ 관리자 페이지
        </Typography>

        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Tabs value={activeTab} onChange={(_event, value) => setActiveTab(value)} sx={{ mb: 3 }}>
            <Tab value="reports" label="신고 관리" />
            <Tab value="users" label="회원 관리" />
          </Tabs>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              {activeTab === 'reports' && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>대상</TableCell>
                      <TableCell>내용</TableCell>
                      <TableCell>사유</TableCell>
                      <TableCell>신고자</TableCell>
                      <TableCell>접수일</TableCell>
                      <TableCell align="right">처리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => {
                      const summary = targetSummaries[`${report.target_type}:${report.target_id}`];
                      return (
                        <TableRow key={report.report_id}>
                          <TableCell>
                            <Chip size="small" label={report.target_type === 'post' ? '게시물' : '댓글'} />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 240 }}>
                            {summary?.label ?? '(삭제됨)'}
                            {summary?.isHidden && <Chip size="small" color="warning" label="숨김" sx={{ ml: 1 }} />}
                          </TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>{report.mm_users?.nickname ?? '-'}</TableCell>
                          <TableCell>{formatDate(report.created_at)}</TableCell>
                          <TableCell align="right">
                            <Button size="small" color="error" onClick={() => handleResolveReport(report, true)}>
                              삭제 처리
                            </Button>
                            <Button size="small" onClick={() => handleResolveReport(report, false)}>
                              반려
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {reports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography color="text.secondary">접수된 신고가 없어요.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'users' && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>닉네임</TableCell>
                      <TableCell>등급</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell>가입일</TableCell>
                      <TableCell align="right">관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((targetUser) => (
                      <TableRow key={targetUser.user_id}>
                        <TableCell>{targetUser.nickname}</TableCell>
                        <TableCell>{targetUser.role === 'admin' ? '관리자' : '일반회원'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={targetUser.status === 'active' ? 'success' : 'error'}
                            label={targetUser.status === 'active' ? '활동중' : '제재됨'}
                          />
                        </TableCell>
                        <TableCell>{formatDate(targetUser.created_at)}</TableCell>
                        <TableCell align="right">
                          {targetUser.role !== 'admin' && (
                            <Button size="small" onClick={() => handleToggleUserStatus(targetUser)}>
                              {targetUser.status === 'active' ? '제재하기' : '제재 해제'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
