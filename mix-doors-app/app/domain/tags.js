export function parseTags(node) {
  const raw = node.getAttribute('data-tags');
  if (!raw) return [];
  return raw.split(/\s+/).filter(Boolean);
}

export function indexTags(root) {
  const map = new Map();
  root.querySelectorAll('[data-tags]').forEach((el) => {
    parseTags(el).forEach((tag) => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(el);
    });
  });
  return map;
}
