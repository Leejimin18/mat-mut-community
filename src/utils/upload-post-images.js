import { supabase } from '../lib/supabase';

export async function uploadPostImages(postId, files) {
  const uploadedUrls = [];

  for (const file of files) {
    const filePath = `${postId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('post-images').upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}
