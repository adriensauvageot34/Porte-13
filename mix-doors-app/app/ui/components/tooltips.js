export function enableTooltips() {
  document.querySelectorAll('[data-tip]').forEach((el) => {
    el.setAttribute('title', el.getAttribute('data-tip'));
  });
}
