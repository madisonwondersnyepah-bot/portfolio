import { upload } from 'https://esm.sh/@vercel/blob@2.6.1/client';

let adminPassword = '';

const gate = document.getElementById('gate');
const panel = document.getElementById('panel');
const gateMsg = document.getElementById('gate-msg');

document.getElementById('unlock-btn').addEventListener('click', async () => {
  const candidate = document.getElementById('password-input').value;
  if (!candidate) return;

  // Verify by attempting a harmless authed call: a delete with a bogus id.
  // A 401 means wrong password; anything else means the password is accepted.
  const res = await fetch('/api/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': candidate },
    body: JSON.stringify({ id: '__check__' }),
  });

  if (res.status === 401) {
    gateMsg.textContent = 'Wrong password.';
    return;
  }

  adminPassword = candidate;
  gate.hidden = true;
  panel.hidden = false;
  loadExisting();
});

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  const submitBtn = document.getElementById('submit-btn');
  const fileInput = document.getElementById('image');
  const file = fileInput.files[0];

  if (!file) return;

  submitBtn.disabled = true;
  msg.textContent = 'Uploading… this can take a moment for video.';
  msg.className = '';

  try {
    // Uploads straight from the browser to Blob storage — the file
    // never passes through our own server, so there's no small
    // body-size limit to worry about.
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload-token',
      clientPayload: JSON.stringify({ password: adminPassword }),
    });

    const mediaType = file.type.startsWith('video') ? 'video' : 'image';

    const res = await fetch('/api/save-work', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
      body: JSON.stringify({
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        caption: document.getElementById('caption').value,
        link: document.getElementById('link').value,
        imageUrl: blob.url,
        imagePath: blob.pathname,
        mediaType,
      }),
    });

    if (!res.ok) throw new Error();

    msg.textContent = 'Uploaded. It\u2019s live on your homepage now.';
    msg.className = 'ok';
    e.target.reset();
    loadExisting();
  } catch (err) {
    msg.textContent = err && err.message === 'Wrong password.'
      ? 'Wrong password — try unlocking again.'
      : 'Upload failed — try again.';
    msg.className = 'err';
  } finally {
    submitBtn.disabled = false;
  }
});

async function loadExisting() {
  const list = document.getElementById('existing-list');
  list.textContent = 'Loading…';

  const res = await fetch('/api/works');
  const { items } = await res.json();

  if (!items || items.length === 0) {
    list.textContent = 'Nothing uploaded yet.';
    return;
  }

  list.innerHTML = '';
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'existing-item';

    const thumb = item.mediaType === 'video'
      ? `<video src="${item.imageUrl}" muted></video>`
      : `<img src="${item.imageUrl}" alt="">`;

    row.innerHTML = `
      ${thumb}
      <div class="meta">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.category)}</span>
      </div>
      <button class="btn btn-ghost" data-id="${item.id}" data-path="${item.imagePath}">Delete</button>
    `;
    row.querySelector('button').addEventListener('click', async (e) => {
      const { id, path } = e.target.dataset;
      if (!confirm('Delete this piece?')) return;
      await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ id, imagePath: path }),
      });
      loadExisting();
    });
    list.appendChild(row);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
