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

## Hébergement (déploiement depuis GitHub)

Le dépôt est prêt à être hébergé. Pour mettre l’app en ligne gratuitement avec **Vercel** (compatible Next.js) :

1. Allez sur **[vercel.com](https://vercel.com)** et connectez-vous avec **GitHub**.
2. Cliquez sur **Add New… → Project**.
3. Importez le dépôt **`christiandoh/Gala_des_couple`**.
4. Laissez les options par défaut (Framework: Next.js) et cliquez sur **Deploy**.
5. Après le déploiement, votre app aura une URL du type `gala-des-couple.vercel.app`. Chaque **push sur `main`** redéploiera automatiquement.

**Note :** Les inscriptions sont stockées dans un fichier JSON sur le serveur. Sur Vercel (serverless), ce stockage est temporaire. Pour une utilisation longue durée, prévoir une base de données (ex. Vercel Postgres, Supabase).

## MCP

Le serveur MCP shadcn est configuré dans `.vscode/mcp.json` (commande : `npx shadcn@latest mcp init --client vscode`).
