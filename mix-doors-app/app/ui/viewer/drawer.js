export function openResource(resourceNode) {
  const drawer = ensureDrawer();
  drawer.innerHTML = '';
  const closeButton = document.createElement('button');
  closeButton.className = 'drawer-close';
  closeButton.innerHTML = '×';
  closeButton.addEventListener('click', closeDrawer);
  drawer.appendChild(closeButton);
  const content = document.createElement('div');
  content.className = 'drawer-content';
  if (resourceNode) {
    content.appendChild(resourceNode.cloneNode(true));
  } else {
    content.textContent = 'Aucune ressource';
  }
  drawer.appendChild(content);
  drawer.classList.add('open');
}

export function closeDrawer() {
  const drawer = document.querySelector('.drawer');
  if (drawer) {
    drawer.classList.remove('open');
  }
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
