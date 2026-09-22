const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Wrong password' });
    return;
  }

  try {
    const { title, category, caption, link, imageUrl, imagePath, mediaType } = req.body || {};

    if (!title || !category || !imageUrl || !imagePath) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const id = Date.now().toString();
    const record = {
      id,
      title,
      category,
      caption: caption || '',
      link: link || '',
      imageUrl,
      imagePath,
      mediaType: mediaType === 'video' ? 'video' : 'image',
      createdAt: Number(id),
    };

    await put(`works/${id}.json`, JSON.stringify(record), {
      access: 'public',
      contentType: 'application/json',
    });

    res.status(200).json({ item: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Save failed' });
  }
};
