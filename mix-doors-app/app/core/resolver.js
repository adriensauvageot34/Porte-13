export function resolveIssue(issueKey, registry) {
  const mapping = registry?.issues || {};
  return mapping[issueKey] || null;
}
