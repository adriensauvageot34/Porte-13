import { Store } from './store.js';
import { loadState } from './persistence.js';
import { renderLayout } from '../ui/layout.js';
import { mountRunBar } from '../ui/components/runBar.js';
import { enableTooltips } from '../ui/components/tooltips.js';
import { mountCommandPalette } from '../ui/components/commandPalette.js';
import { setupBindings } from './bindings.js';
import { mountPathTable, mountTargetTable, mountTestsTable } from '../ui/components/mounts.js';
import { openResource } from '../ui/viewer/drawer.js';
import { defaultDoorId, doorList, getDoorById } from '../domain/doorpacks.js';

const mountedStyles = new Set();

function mapResources(resourcesRoot) {
  const map = {};
  resourcesRoot?.querySelectorAll('[data-resource-id]')?.forEach((node) => {
    map[node.dataset.resourceId] = node;
  });
  return map;
}

function attachResourceOpeners(resourcesMap) {
  document.querySelectorAll('[data-open-resource]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-open-resource');
      openResource(resourcesMap[id]);
    });
  });
}

function syncDerivedFields(store, door) {
  const commitId = store.state.path.commit;
  const pathMeta = door.paths.find((p) => p.id === commitId);
  const desiredPathCommit = pathMeta?.label || '';
  const desiredCroix = pathMeta?.croix || '';
  const desiredRisk = pathMeta?.riskFocus || '';

  const defaultPrimary = door.rules?.targets?.primaryDefault || '';
  const primaryTarget = store.state.targets.primary || defaultPrimary;
  const secondary = store.state.targets.secondary || [];
  const secondaryLabel = secondary.length ? secondary.join(', ') : 'Aucun';
  const trialMax = door.rules?.path?.trialMax || null;

  const coreUpdates = {};
  const pathUpdates = {};
  const targetUpdates = {};
  let nextDoorUpdate;

  if (!store.state.targets.primary && primaryTarget) targetUpdates.primary = primaryTarget;

  if (store.state.core.pathCommit !== desiredPathCommit) coreUpdates.pathCommit = desiredPathCommit;
  if (store.state.core.croix !== desiredCroix) coreUpdates.croix = desiredCroix;
  if (store.state.core.riskFocus !== desiredRisk) coreUpdates.riskFocus = desiredRisk;
  if (store.state.core.targetPrimary !== primaryTarget) coreUpdates.targetPrimary = primaryTarget;
  if (store.state.core.targetSecondary !== secondaryLabel) coreUpdates.targetSecondary = secondaryLabel;

  if (store.state.path.croix !== desiredCroix) pathUpdates.croix = desiredCroix;
  if (store.state.path.riskFocus !== desiredRisk) pathUpdates.riskFocus = desiredRisk;

  const uniqueTrials = Array.isArray(store.state.path.trials)
    ? Array.from(new Set(store.state.path.trials))
    : [];
  const limitedTrials = trialMax ? uniqueTrials.slice(0, trialMax) : uniqueTrials;
  if (
    store.state.path.trials?.length !== limitedTrials.length ||
    uniqueTrials.some((val, idx) => store.state.path.trials[idx] !== val)
  ) {
    pathUpdates.trials = limitedTrials;
  }

  if (store.state.handoff.nextDoor !== door.meta?.next) {
    nextDoorUpdate = door.meta?.next || store.state.handoff.nextDoor;
  }

  if (Object.keys(coreUpdates).length || Object.keys(pathUpdates).length || Object.keys(targetUpdates).length || nextDoorUpdate) {
    store.batch((state) => {
      state.core = { ...state.core, ...coreUpdates };
      state.path = { ...state.path, ...pathUpdates };
      state.targets = { ...state.targets, ...targetUpdates };
      if (nextDoorUpdate) state.handoff.nextDoor = nextDoorUpdate;
    });
  }
}

function applyDoorStyle(door) {
  if (!door?.style || mountedStyles.has(door.meta.id)) return;
  const style = document.createElement('style');
  style.dataset.doorStyle = door.meta.id;
  style.textContent = door.style;
  document.head.appendChild(style);
  mountedStyles.add(door.meta.id);
}

function resolveDoorIdFromHash() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get('door');
}

function updateHash(doorId) {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  params.set('door', doorId);
  window.location.hash = params.toString();
}

function cleanListeners(node) {
  const clone = node.cloneNode(true);
  node.replaceWith(clone);
  return clone;
}

async function renderDoor(doorId) {
  const door = getDoorById(doorId) || getDoorById(defaultDoorId);
  if (!door) return;
  applyDoorStyle(door);

  const store = new Store(door.meta);
  const persisted = loadState(door.meta.id, store.state.runId);
  if (persisted) store.hydrate(persisted);

  const { contentRoot, resourcesRoot, doorSelect } = renderLayout({
    meta: door.meta,
    manifest: door.manifest,
    contentHtml: door.contentHtml,
    resourcesHtml: door.resourcesHtml,
    doors: doorList,
    currentDoorId: door.meta.id,
  });

  if (doorSelect) {
    doorSelect.value = door.meta.id;
    const freshSelect = cleanListeners(doorSelect);
    freshSelect.addEventListener('change', (event) => {
      updateHash(event.target.value);
      renderDoor(event.target.value);
    });
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  mountPathTable(contentRoot.querySelector('[data-mount="path-table"]'), door.paths, door.rules?.path);
  mountTargetTable(contentRoot.querySelector('[data-mount="target-table"]'), door.targets, door.rules?.targets);
  mountTestsTable(contentRoot.querySelector('[data-mount="tests-table"]'), door.tests);

  setupBindings(store);
  mountRunBar(door.rules, store);
  enableTooltips();
  mountCommandPalette();

  const resourcesMap = mapResources(resourcesRoot);
  attachResourceOpeners(resourcesMap);

  syncDerivedFields(store, door);
  store.subscribe(() => syncDerivedFields(store, door));
}

document.addEventListener('DOMContentLoaded', () => {
  const doorId = resolveDoorIdFromHash() || defaultDoorId;
  renderDoor(doorId);
});
