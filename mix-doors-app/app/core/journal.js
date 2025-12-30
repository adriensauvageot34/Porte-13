export class Journal {
  constructor() {
    this.entries = [];
  }

  log(event) {
    const enriched = { ts: Date.now(), ...event };
    this.entries.unshift(enriched);
    if (this.entries.length > 200) this.entries.pop();
  }
}
