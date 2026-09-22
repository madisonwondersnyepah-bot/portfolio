const { del } = require('@vercel/blob');

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
    const { id, imagePath } = req.body || {};
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }

    await del(`works/${id}.json`);
    if (imagePath) await del(imagePath);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};
