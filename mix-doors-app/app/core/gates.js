function get(state, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), state);
}

function supportsRequired(rules, state) {
  const primary = state.targets?.primary;
  const secondary = state.targets?.secondary || [];
  const when = rules?.supportsPolicy?.supportsRequiredWhen || {};
  const primaryCondition = Array.isArray(when.primaryNotIn)
    ? !when.primaryNotIn.includes(primary)
    : false;
  const secondaryCondition = when.orSecondaryNotEmpty ? secondary.length > 0 : false;
  return primaryCondition || secondaryCondition;
}

export function evaluateDone(rules, state) {
  const blockers = [];
  (rules?.doneGates || []).forEach((gate) => {
    if (gate.type === 'requiredField') {
      const value = get(state, gate.path);
      if (!value) blockers.push({ type: 'missingRequiredField', gate });
    }
    if (gate.type === 'requiredTestNotSkipped') {
      const verdict = state.tests?.[gate.testId]?.verdict;
      if (!verdict || verdict === 'SKIP') {
        blockers.push({ type: 'requiredTestMissing', gate });
      }
    }
    if (gate.type === 'supportsPolicy') {
      const requiresSupports = supportsRequired(rules, state);
      if (requiresSupports) {
        const ids = rules?.supportsPolicy?.supportTestsIds || [];
        const hasNonSkip = ids.some((id) => {
          const verdict = state.tests?.[id]?.verdict;
          return verdict && verdict !== 'SKIP';
        });
        if (!hasNonSkip) blockers.push({ type: 'supportsMissing', gate });
      }
    }
  });
  return { ok: blockers.length === 0, blockers };
}
