export function buildNav(manifest, container) {
  container.innerHTML = '';
  (manifest.sections || []).forEach((section) => {
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.dataset.nav = section.id;
    link.textContent = `${section.label}`;
    const pill = document.createElement('span');
    pill.className = `pill ${section.kind || ''}`;
    pill.textContent = section.level;
    link.appendChild(pill);
    container.appendChild(link);
  });
}

export function mountScrollSpy(manifest, container) {
  const observer = new IntersectionObserver((entries) => {
    let best = null;
    entries.forEach((entry) => {
      if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
        best = entry;
      }
    });
    if (best) {
      const id = best.target.getAttribute('data-section-id');
      container.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.nav === id));
    }
  }, { threshold: [0.1, 0.25, 0.5] });

  (manifest.sections || []).forEach((section) => {
    const node = document.querySelector(`[data-section-id="${section.id}"]`);
    if (node) observer.observe(node);
  });
}
