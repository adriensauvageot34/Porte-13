function renderPathRow(path) {
  return `
    <tr data-path-id="${path.id}">
      <td>${path.label}</td>
      <td class="center"><input type="checkbox" data-bind="path.trials" data-value="${path.id}"></td>
      <td class="center"><input type="radio" name="path_commit" data-bind="path.commit" value="${path.id}"></td>
      <td>${path.croix || ''}</td>
      <td>${path.riskFocus || ''}</td>
    </tr>
  `;
}

export function mountPathTable(container, paths = [], rules = {}) {
  if (!container) return;
  const rows = paths.map((p) => renderPathRow(p)).join('');
  container.innerHTML = `
    <table class="paths-table table-compact">
      <tr>
        <th>PATH</th>
        <th class="center">TRIAL</th>
        <th class="center">COMMIT</th>
        <th>CROIX</th>
        <th>RISK_FOCUS</th>
      </tr>
      ${rows}
    </table>
  `;

  const maxTrials = rules.trialMax || Infinity;
  container.querySelectorAll('input[type="checkbox"][data-bind="path.trials"]').forEach((box) => {
    box.addEventListener('change', (e) => {
      if (!e.target.checked) return;
      const checked = Array.from(container.querySelectorAll('input[type="checkbox"][data-bind="path.trials"]:checked'));
      if (checked.length > maxTrials) {
        e.target.checked = false;
      }
    });
  });
}

function renderTargetRow(target) {
  return `
    <tr data-target-id="${target.id}">
      <td>${target.label}</td>
      <td class="center"><input type="radio" name="target_primary" data-bind="targets.primary" value="${target.id}"></td>
      <td class="center"><input type="checkbox" data-bind="targets.secondary" data-value="${target.id}"></td>
      <td>${target.kind || ''}</td>
    </tr>
  `;
}

export function mountTargetTable(container, targets = [], rules = {}) {
  if (!container) return;
  const rows = targets.map((t) => renderTargetRow(t)).join('');
  container.innerHTML = `
    <table class="targets-table table-compact">
      <tr>
        <th>Target</th>
        <th class="center">PRIMARY</th>
        <th class="center">SECONDARY</th>
        <th>Type</th>
      </tr>
      ${rows}
    </table>
  `;

  const maxSecondary = rules.secondaryMax || Infinity;
  container.querySelectorAll('input[type="checkbox"][data-bind="targets.secondary"]').forEach((box) => {
    box.addEventListener('change', (e) => {
      if (!e.target.checked) return;
      const checked = Array.from(
        container.querySelectorAll('input[type="checkbox"][data-bind="targets.secondary"]:checked'),
      );
      if (checked.length > maxSecondary) {
        e.target.checked = false;
      }
    });
  });
}

function renderTestRow(test, idx) {
  const requiredTag = test.required ? '<span class="tag">REQ</span>' : '';
  const nonSkipTag = test.nonSkippable ? '<span class="tag">NON SKIP</span>' : '';
  const supportTag = test.support ? '<span class="tag">SUPPORT</span>' : '';
  return `
    <tr data-test-id="${test.id}">
      <td>${test.label} ${requiredTag} ${nonSkipTag} ${supportTag}</td>
      <td class="center"><input type="radio" name="test-${idx}" value="PASS" data-bind="tests.${test.id}.verdict"></td>
      <td class="center"><input type="radio" name="test-${idx}" value="FAIL" data-bind="tests.${test.id}.verdict"></td>
      <td class="center"><input type="radio" name="test-${idx}" value="SKIP" data-bind="tests.${test.id}.verdict"></td>
      <td><input class="fill" placeholder="raison: ___" data-bind="tests.${test.id}.reason"></td>
    </tr>
  `;
}

export function mountTestsTable(container, testsData = {}) {
  if (!container) return;
  const groups = testsData.groups || [];
  const tests = testsData.tests || [];
  let rowIndex = 0;
  const rows = groups
    .map((group) => {
      const groupTests = tests.filter((t) => t.group === group.id);
      if (!groupTests.length) return '';
      const header = `<tr><th colspan="5">${group.label}</th></tr>`;
      const items = groupTests.map((test) => renderTestRow(test, rowIndex++)).join('');
      return `${header}${items}`;
    })
    .join('');

  container.innerHTML = `
    <table class="tests-table table-compact">
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
