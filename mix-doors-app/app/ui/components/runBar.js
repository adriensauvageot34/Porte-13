import { evaluateDone } from '../../core/gates.js';

function formatBlocker(blocker) {
  if (blocker.gate?.message) return blocker.gate.message;
  if (blocker.type === 'missingRequiredField') return 'Champ requis manquant';
  if (blocker.type === 'requiredTestMissing') return 'Test requis manquant';
  if (blocker.type === 'supportsMissing') return 'Supports requis manquants';
  return 'Blocage inconnu';
}

export function mountRunBar(rules, store) {
  const main = document.querySelector('main');
  const bar = document.createElement('div');
  bar.className = 'runbar';
  bar.innerHTML = `
    <div class="stack">
      <div class="status">Run: <select id="run_select"><option value="global">Global</option></select></div>
      <div class="done-state"></div>
    </div>
    <div class="actions">
      <button id="btn_run">RUN</button>
      <button id="btn_fail">FAIL</button>
      <button id="btn_done" class="primary">DONE</button>
    </div>
    <div class="blockers"></div>
  `;
  main.prepend(bar);

  const doneState = bar.querySelector('.done-state');
  const blockers = bar.querySelector('.blockers');
  const updateDone = () => {
    const result = evaluateDone(rules, store.state);
    if (result.ok) {
      doneState.textContent = 'DONE possible';
      blockers.innerHTML = '<span class="blocker ok">Aucun blocage</span>';
      return;
    }
    doneState.textContent = `DONE bloqué (${result.blockers.length})`;
    blockers.innerHTML = result.blockers
      .map((blocker) => `<span class="blocker">⚠ ${formatBlocker(blocker)}</span>`)
      .join('');
  };
  store.subscribe(updateDone);
  updateDone();
}
