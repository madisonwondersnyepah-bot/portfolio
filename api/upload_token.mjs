export const config = { runtime: 'edge' };

import { handleUpload } from '@vercel/blob/client';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let password = '';
        try {
          password = JSON.parse(clientPayload || '{}').password;
        } catch {
          // ignore parse errors, handled by the empty-password check below
        }

        if (!password || password !== process.env.ADMIN_PASSWORD) {
          throw new Error('Wrong password.');
        }

        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/webm',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 300 * 1024 * 1024, // 300MB — plenty for a short clip
        };
      },
      onUploadCompleted: async () => {
        // No-op — the admin page saves the item's title/category/etc.
        // itself right after the upload finishes (see /api/save-work).
      },
    });

    return new Response(JSON.stringify(jsonResponse), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Could not authorize upload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
