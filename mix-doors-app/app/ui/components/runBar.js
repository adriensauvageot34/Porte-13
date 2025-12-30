import { evaluateDone } from '../../core/gates.js';

export function mountRunBar(rules, store) {
  const main = document.querySelector('main');
  const bar = document.createElement('div');
  bar.className = 'runbar';
  bar.innerHTML = `
    <div class="status">Run: <select id="run_select"><option value="global">Global</option></select></div>
    <div class="actions">
      <button id="btn_run">RUN</button>
      <button id="btn_fail">FAIL</button>
      <button id="btn_done">DONE</button>
      <span class="done-state"></span>
    </div>
  `;
  main.prepend(bar);

  const doneState = bar.querySelector('.done-state');
  const updateDone = () => {
    const result = evaluateDone(rules, store.state);
    doneState.textContent = result.ok ? 'DONE: OK' : `DONE: ${result.blockers.length} bloc(s)`;
  };
  store.subscribe(updateDone);
  updateDone();
}
