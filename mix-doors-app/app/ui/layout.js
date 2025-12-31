import { buildNav, mountScrollSpy } from '../core/navigation.js';

export function renderLayout({ meta, manifest, contentHtml, resourcesHtml, doors = [], currentDoorId }) {
  document.title = `🧭 ${meta.title}`;
  const app = document.querySelector('#app');
  const doorOptions = doors
    .map((door) => `<option value="${door.id}">${door.id} — ${door.title}</option>`)
    .join('');

  app.innerHTML = `
    <aside>
      <div class="nav-title">
        <span>Navigation</span>
        <span class="pill">${meta.id}</span>
      </div>
      <div class="door-switch">
        <label for="door-switch">Porte</label>
        <select id="door-switch">${doorOptions}</select>
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
    const found = contentTarget.querySelector(`[data-section-id="${section.id}"]`);
    if (found) found.setAttribute('id', section.id);
  });
  mountScrollSpy(manifest, nav);

  const doorSelect = app.querySelector('#door-switch');
  if (doorSelect && currentDoorId) {
    doorSelect.value = currentDoorId;
  }

  return { contentRoot: contentTarget, resourcesRoot: resTarget, doorSelect };
}
