import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { supabase } from '../../lib/supabase';

/**
 * FavoriteButton 컴포넌트
 *
 * Props:
 * @param {number} postId - 게시물 번호 [Required]
 * @param {string} userId - 로그인한 사용자 id [Required]
 *
 * Example usage:
 * <FavoriteButton postId={post.post_id} userId={user.id} />
 */
export default function FavoriteButton({ postId, userId }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('mm_favorites')
      .select('favorite_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setIsFavorited(Boolean(data));
        setIsLoading(false);
      });
  }, [postId, userId]);

  const handleToggle = async () => {
    if (isFavorited) {
      await supabase.from('mm_favorites').delete().eq('post_id', postId).eq('user_id', userId);
      setIsFavorited(false);
    } else {
      await supabase.from('mm_favorites').insert({ post_id: postId, user_id: userId });
      setIsFavorited(true);
    }
  };

  return (
    <Button
      variant={isFavorited ? 'contained' : 'outlined'}
      color="secondary"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isFavorited ? '★ 즐겨찾기 완료' : '☆ 즐겨찾기'}
    </Button>
  );
}
