export function evaluateDone(rules, state) {
  const blockers = [];
  (rules?.gates || []).forEach((gate) => {
    if (gate.type === 'field') {
      const value = gate.path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), state);
      if (!value) blockers.push({ type: 'missingRequiredField', gate });
    }
    if (gate.type === 'testRequired') {
      const verdict = state.tests?.[gate.testId]?.verdict;
      if (!verdict || verdict === 'SKIP') {
        blockers.push({ type: 'requiredTestMissing', gate });
      }
    }
  });
  return { ok: blockers.length === 0, blockers };
}
