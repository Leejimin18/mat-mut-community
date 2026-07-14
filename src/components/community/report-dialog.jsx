import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';

const REPORT_REASONS = ['욕설', '광고/스팸', '허위 정보', '기타'];

/**
 * ReportDialog 컴포넌트
 *
 * Props:
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 시 실행할 함수 [Required]
 * @param {function} onSubmit - 신고 접수 시 실행할 함수 (reason) [Required]
 *
 * Example usage:
 * <ReportDialog isOpen={isOpen} onClose={handleClose} onSubmit={handleReport} />
 */
export default function ReportDialog({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);

  const handleSubmit = async () => {
    await onSubmit(reason);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>신고하기</DialogTitle>
      <DialogContent>
        <RadioGroup value={reason} onChange={(event) => setReason(event.target.value)}>
          {REPORT_REASONS.map((option) => (
            <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit} variant="contained" color="error">
          신고 접수
        </Button>
      </DialogActions>
    </Dialog>
  );
}
