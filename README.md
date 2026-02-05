# Gala Marié · Inscriptions

Application d'inscription au gala (sections : Couple, Cheminant, Fiancé) avec suivi des participations (20 000 XOF), statistiques et badges Soldé / Non soldé.

## Stack

- **Frontend** : Next.js 16 (App Router), React 19, Tailwind, shadcn (radix-ui), Recharts, Hugeicons
- **Backend** : API Routes Next.js, persistance JSON (`data/inscriptions.json`)
- **Design** : Rouge et or, typographie Public Sans / Geist (comme le dashboard santé)

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3001](http://localhost:3001).

## API

- `GET /api/inscriptions` — liste des inscriptions
- `POST /api/inscriptions` — créer une inscription (body: `{ nom, section, solde?, telephone? }`)
- `PATCH /api/inscriptions/[id]` — mettre à jour le statut payé (body: `{ solde: boolean }`)

## MCP

Le serveur MCP shadcn est configuré dans `.vscode/mcp.json` (commande : `npx shadcn@latest mcp init --client vscode`).
