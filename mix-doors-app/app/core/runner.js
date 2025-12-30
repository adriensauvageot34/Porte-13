export class Runner {
  constructor() {
    this.runs = [{ id: 'global', label: 'Run global' }];
    this.activeRunId = 'global';
  }

  addRun(id, label) {
    this.runs.push({ id, label });
  }

  setActive(id) {
    this.activeRunId = id;
  }
}
