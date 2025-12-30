export function showModal(html) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-body">${html}</div>`;
  modal.addEventListener('click', () => modal.remove());
  document.body.appendChild(modal);
}
