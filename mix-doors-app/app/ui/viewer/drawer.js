export function openResource(item) {
  const drawer = ensureDrawer();
  drawer.innerHTML = `<div class="drawer-content">${item || 'Aucune ressource'}</div>`;
  drawer.classList.add('open');
}

function ensureDrawer() {
  let drawer = document.querySelector('.drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.className = 'drawer';
    document.body.appendChild(drawer);
  }
  return drawer;
}
