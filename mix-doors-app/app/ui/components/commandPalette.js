export function mountCommandPalette() {
  const dialog = document.createElement('div');
  dialog.className = 'palette hidden';
  dialog.innerHTML = '<input type="text" placeholder="Tape une commande" />';
  document.body.appendChild(dialog);
}
