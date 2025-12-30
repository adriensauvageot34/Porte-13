#!/usr/bin/env python3
from pathlib import Path
import json
import sys

BASE = Path(__file__).resolve().parent.parent / 'doors'

def scaffold(door_id):
  target = BASE / door_id
  target.mkdir(parents=True, exist_ok=True)
  (target / 'door.meta.json').write_text(json.dumps({
    "id": door_id,
    "title": f"Porte {door_id}",
    "intent": "Décrire l'intention",
    "prev": "",
    "next": "",
    "version": "0.0.1"
  }, indent=2))
  (target / 'door.manifest.json').write_text(json.dumps({"t3Order": [], "sections": []}, indent=2))
  (target / 'door.rules.json').write_text(json.dumps({
    "schemaVersion": 1,
    "policies": {},
    "gates": [],
    "toggles": [],
    "targets": {"primary": [], "secondary": []}
  }, indent=2))
  (target / 'door.tests.json').write_text('[]')
  (target / 'door.content.html').write_text('<section>Nouvelle porte</section>')
  (target / 'door.resources.html').write_text('<section>Ressources</section>')
  print(f"Porte {door_id} créée dans {target}")

if __name__ == '__main__':
  if len(sys.argv) < 2:
    print("Usage: scaffold.py P10")
    sys.exit(1)
  scaffold(sys.argv[1])
