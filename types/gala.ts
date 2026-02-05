export const SECTION_LABELS = {
  couple: "Couple",
  cheminant: "Cheminant",
  fiance: "Fiancé",
} as const;

export type Section = keyof typeof SECTION_LABELS;

export const MONTANT_PARTICIPATION = 20_000; // XOF

/** Lien de paiement Wave. Remplacer par NEXT_PUBLIC_PAYMENT_LINK dans .env si besoin. */
export const PAYMENT_LINK =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PAYMENT_LINK) ||
  "https://pay.wave.com/m/M_ci_PLf9VcTCfn5s/c/ci/";

export interface Inscription {
  id: string;
  nom: string;
  telephone?: string;
  section: Section;
  solde: boolean; // true = soldé, false = non soldé
  /** Somme déjà payée (XOF) lorsque non totalement soldé */
  montantPaye?: number;
  createdAt: string; // ISO
}
