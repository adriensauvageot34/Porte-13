import { buildNav, mountScrollSpy } from '../core/navigation.js';

function renderTestsTable(tests, root) {
  if (!root || !tests?.length) return;
  const target = root.querySelector('[data-mount="tests"]');
  if (!target) return;

  const grouped = tests.reduce((acc, test) => {
    const key = test.category || 'DEFAULT';
    acc[key] = acc[key] || [];
    acc[key].push(test);
    return acc;
  }, {});

  const categoryLabel = (category) => {
    if (!category || category === 'DEFAULT') return '';
    if (category === 'ALWAYS') return 'Tests ALWAYS';
    if (category === 'SUPPORT') return 'Tests SUPPORT';
    return `Tests ${category}`;
  };

  const rows = Object.entries(grouped)
    .map(([category, list]) => {
      const heading = categoryLabel(category)
        ? `<tr><th colspan="5">${categoryLabel(category)}</th></tr>`
        : '';
      const items = list
        .map(
          (test) => `
            <tr data-test="${test.id}">
              <td>${test.label}${test.required ? ' <span class="tag">REQ</span>' : ''}</td>
              <td class="center"><input type="radio" name="test-${test.id}" value="PASS" data-bind="tests.${test.id}.verdict"></td>
              <td class="center"><input type="radio" name="test-${test.id}" value="FAIL" data-bind="tests.${test.id}.verdict"></td>
              <td class="center"><input type="radio" name="test-${test.id}" value="SKIP" data-bind="tests.${test.id}.verdict"></td>
              <td><input class="fill" placeholder="raison: ___" data-bind="tests.${test.id}.reason"></td>
            </tr>
          `
        )
        .join('');
      return `${heading}${items}`;
    })
    .join('');

  target.innerHTML = `
    <table class="tests-table">
      <tr>
        <th>Test</th>
        <th class="center">PASS</th>
        <th class="center">FAIL</th>
        <th class="center">SKIP</th>
        <th>Raison (si SKIP)</th>
      </tr>
      ${rows}
    </table>
  `;
}

export function renderLayout({ meta, manifest, contentHtml, resourcesHtml, tests }) {
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

  renderTestsTable(tests, contentTarget);

  const nav = app.querySelector('#nav');
  buildNav(manifest, nav);
  manifest.sections?.forEach((section) => {
    const found = contentTarget.querySelector(`#${section.id}`);
    if (found) found.setAttribute('data-section-id', section.id);
  });
  mountScrollSpy(manifest, nav);
}
