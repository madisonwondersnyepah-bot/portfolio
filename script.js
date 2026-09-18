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
