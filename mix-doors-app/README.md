# Mix Doors App

Prototype multi-porte pour héberger les packs P10..P16. Ouvre `index.html` en file:// pour charger la porte par défaut (P13).

## Structure
- `app/` : moteur commun (store, gating, layout).
- `doors/` : packs de portes (meta, manifest, rules, tests, contenu, ressources, css).
- `resources/` : assets globaux.
- `tools/` : scripts utilitaires.

## Ajouter une porte
1. Copier `doors/P14` et ajuster meta/manifest/rules/tests.
2. Ajouter le HTML dans `door.content.html` et `door.resources.html`.
3. Ouvrir `index.html` pour vérifier le rendu.
