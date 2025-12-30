export async function loadIssueMap() {
  const res = await fetch('./resources/registry/issue-map.json');
  return res.json();
}
