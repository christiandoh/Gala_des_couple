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

1. Sur le dépôt **[christiandoh/Gala_des_couple](https://github.com/christiandoh/Gala_des_couple)** : **Settings** → **Pages**.
2. Sous **Build and deployment** → **Source** : choisir **Deploy from a branch**.
3. **Branch** : `gh-pages` — **Folder** : `/ (root)` — puis **Save**.
4. À chaque push sur `main`, le workflow pousse le build vers la branche `gh-pages` ; le site sera à **https://christiandoh.github.io/Gala_des_couple/** (après le premier déploiement réussi).

**Important :** GitHub Pages ne sert que du **statique**. Sur cette URL, le formulaire et les inscriptions **ne sont pas enregistrés**. Pour l’app complète (inscriptions, paiement, validation), utiliser Vercel (voir ci‑dessous).

---

## Hébergement complet (Vercel)

Pour une version **complète** (formulaire, liste, paiement Wave, validation capture) :

1. Allez sur **[vercel.com](https://vercel.com)** et connectez-vous avec **GitHub**.
2. **Add New… → Project** → importez **`christiandoh/Gala_des_couple`**.
3. **Deploy**. Chaque push sur `main` redéploiera. URL du type `gala-des-couple.vercel.app`.

**Note :** Les inscriptions sont stockées dans un fichier JSON. Sur Vercel ce stockage est temporaire. Pour une utilisation longue durée, prévoir une base de données.

## MCP

Le serveur MCP shadcn est configuré dans `.vscode/mcp.json` (commande : `npx shadcn@latest mcp init --client vscode`).
