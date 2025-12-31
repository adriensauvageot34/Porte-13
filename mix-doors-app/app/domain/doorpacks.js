import P13Meta from '../../doors/P13/door.meta.json';
import P13Manifest from '../../doors/P13/door.manifest.json';
import P13Rules from '../../doors/P13/door.rules.json';
import P13Tests from '../../doors/P13/door.tests.json';
import P13Paths from '../../doors/P13/door.paths.json';
import P13Targets from '../../doors/P13/door.targets.json';
import P13Content from '../../doors/P13/door.content.html?raw';
import P13Resources from '../../doors/P13/door.resources.html?raw';
import P13Css from '../../doors/P13/door.css?raw';

import P14Meta from '../../doors/P14/door.meta.json';
import P14Manifest from '../../doors/P14/door.manifest.json';
import P14Rules from '../../doors/P14/door.rules.json';
import P14Tests from '../../doors/P14/door.tests.json';
import P14Content from '../../doors/P14/door.content.html?raw';
import P14Resources from '../../doors/P14/door.resources.html?raw';

function normalizePaths(entry) {
  if (Array.isArray(entry)) return entry;
  if (entry?.paths) return entry.paths;
  return [];
}

function normalizeTargets(entry) {
  if (Array.isArray(entry)) return entry;
  if (entry?.targets) return entry.targets;
  return [];
}

function packDoor(meta, manifest, rules, tests, paths, targets, contentHtml, resourcesHtml, style = '') {
  return {
    meta,
    manifest,
    rules,
    tests,
    paths: normalizePaths(paths),
    targets: normalizeTargets(targets),
    contentHtml,
    resourcesHtml,
    style,
  };
}

export const doorRegistry = {
  [P13Meta.id]: packDoor(
    P13Meta,
    P13Manifest,
    P13Rules,
    P13Tests,
    P13Paths,
    P13Targets,
    P13Content,
    P13Resources,
    P13Css,
  ),
  [P14Meta.id]: packDoor(P14Meta, P14Manifest, P14Rules, P14Tests, [], [], P14Content, P14Resources),
};

export const doorList = Object.values(doorRegistry).map((door) => ({
  id: door.meta.id,
  title: door.meta.title,
}));

export function getDoorById(id) {
  return doorRegistry[id];
}

export const defaultDoorId = doorList[0]?.id || 'P13';
