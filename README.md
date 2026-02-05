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

## Hébergement sur GitHub (GitHub Pages)

Pour mettre le site en ligne **directement depuis GitHub** (Settings → Pages) :

1. Sur le dépôt **[christiandoh/Gala_des_couple](https://github.com/christiandoh/Gala_des_couple)** : onglet **Settings**.
2. Dans le menu de gauche : **Pages**.
3. Sous **Build and deployment** → **Source** : choisir **GitHub Actions**.
4. À chaque push sur `main`, le workflow « Deploy to GitHub Pages » va build et déployer. L’URL du site sera : **https://christiandoh.github.io/Gala_des_couple/**

**Important :** GitHub Pages ne fait que du **statique**. Sur cette URL, le formulaire et les inscriptions **ne seront pas enregistrés** (pas d’API côté serveur). C’est une **version démo** du site. Pour une app complète (inscriptions, paiement, validation), utiliser Vercel (voir ci‑dessous).

---

## Hébergement complet (Vercel)

Pour une version **complète** (formulaire, liste, paiement Wave, validation capture) :

1. Allez sur **[vercel.com](https://vercel.com)** et connectez-vous avec **GitHub**.
2. **Add New… → Project** → importez **`christiandoh/Gala_des_couple`**.
3. **Deploy**. Chaque push sur `main` redéploiera. URL du type `gala-des-couple.vercel.app`.

**Note :** Les inscriptions sont stockées dans un fichier JSON. Sur Vercel ce stockage est temporaire. Pour une utilisation longue durée, prévoir une base de données.

## MCP

Le serveur MCP shadcn est configuré dans `.vscode/mcp.json` (commande : `npx shadcn@latest mcp init --client vscode`).
