import { buildNav, mountScrollSpy } from '../../core/navigation.js';

export function mountSidebar(manifest) {
  const nav = document.querySelector('#nav');
  if (!nav) return;
  buildNav(manifest, nav);
  mountScrollSpy(manifest, nav);
}
