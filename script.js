// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Highlight the current section in the rail nav while scrolling
const sections = document.querySelectorAll('main > section[id]');
const navLinks = document.querySelectorAll('.rail-nav a');

if ('IntersectionObserver' in window && sections.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--accent)'
            : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
}

// Load uploaded design & video work from the API
async function loadShowcase() {
  const grid = document.getElementById('showcase-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/works');
    const { items } = await res.json();

    if (!items || items.length === 0) {
      grid.innerHTML = '<p class="showcase-loading">No work uploaded yet — check back soon.</p>';
      return;
    }

    grid.innerHTML = '';
    items.forEach((item) => {
      const figure = document.createElement('figure');
      figure.className = 'showcase-item';

      const media = item.mediaType === 'video'
        ? document.createElement('video')
        : document.createElement('img');
      media.src = item.imageUrl;
      if (item.mediaType === 'video') {
        media.controls = true;
        media.preload = 'metadata';
      } else {
        media.alt = item.caption || item.title;
      }
      figure.appendChild(media);

      const figcaption = document.createElement('figcaption');
      const title = document.createElement('span');
      title.className = 'showcase-title';
      title.textContent = item.title;
      const tag = document.createElement('span');
      tag.className = 'project-tag';
      tag.textContent = item.category;
      figcaption.appendChild(title);
      figcaption.appendChild(tag);
      figure.appendChild(figcaption);

      if (item.link) {
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener';
        link.appendChild(figure);
        grid.appendChild(link);
      } else {
        grid.appendChild(figure);
      }
    });
  } catch {
    grid.innerHTML = '<p class="showcase-loading">Couldn\u2019t load work right now.</p>';
  }
}

loadShowcase();
