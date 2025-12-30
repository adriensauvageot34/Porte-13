import { buildNav, mountScrollSpy } from '../core/navigation.js';

export function renderLayout({ meta, manifest, contentHtml, resourcesHtml }) {
  document.title = `🧭 ${meta.title}`;
  const app = document.querySelector('#app');
  app.innerHTML = `
    <aside>
      <div class="nav-title">
        <span>Navigation</span>
      </div>
      <div class="nav" id="nav"></div>
    </aside>
    <main>
      <div class="door-title">
        <h1>${meta.title}</h1>
        <div class="meta">${meta.intent}</div>
      </div>
      <article id="door-content"></article>
      <article id="door-resources"></article>
    </main>
  `;

  const contentTarget = app.querySelector('#door-content');
  contentTarget.innerHTML = contentHtml;
  const resTarget = app.querySelector('#door-resources');
  resTarget.innerHTML = resourcesHtml;

  const nav = app.querySelector('#nav');
  buildNav(manifest, nav);
  manifest.sections?.forEach((section) => {
    const found = contentTarget.querySelector(`#${section.id}`);
    if (found) found.setAttribute('data-section-id', section.id);
  });
  mountScrollSpy(manifest, nav);
}
