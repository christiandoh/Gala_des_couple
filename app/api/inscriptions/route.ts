import { NextResponse } from "next/server";
import { getInscriptions, addInscription } from "@/lib/data";
import type { Inscription } from "@/types/gala";
import { SECTION_LABELS, MONTANT_PARTICIPATION } from "@/types/gala";

const SECTIONS = Object.keys(SECTION_LABELS) as Inscription["section"][];

function validateBody(body: unknown): { nom: string; telephone?: string; section: Inscription["section"]; solde: boolean; montantPaye?: number } | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const nom = typeof o.nom === "string" ? o.nom.trim() : "";
  const section = typeof o.section === "string" && SECTIONS.includes(o.section as Inscription["section"]) ? o.section as Inscription["section"] : null;
  if (!nom || !section) return null;
  const telephone = typeof o.telephone === "string" ? o.telephone.trim() || undefined : undefined;
  const solde = typeof o.solde === "boolean" ? o.solde : false;
  let montantPaye: number | undefined;
  if (typeof o.montantPaye === "number" && o.montantPaye >= 0 && o.montantPaye <= MONTANT_PARTICIPATION) {
    montantPaye = Math.round(o.montantPaye);
  }
  return { nom, telephone, section, solde, montantPaye };
}

export async function GET() {
  try {
    const list = await getInscriptions();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateBody(body);
    if (!validated) {
      return NextResponse.json({ error: "Données invalides (nom et section requis)" }, { status: 400 });
    }
    const created = await addInscription(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
