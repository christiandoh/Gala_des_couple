import { NextResponse } from "next/server";
import { updateInscription, deleteInscription } from "@/lib/data";
import { MONTANT_PARTICIPATION, SECTION_LABELS } from "@/types/gala";
import type { Inscription } from "@/types/gala";

const SECTIONS = Object.keys(SECTION_LABELS) as Inscription["section"][];

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteInscription(id);
    if (!deleted) return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const patch: Parameters<typeof updateInscription>[1] = {};
    const nom = typeof body.nom === "string" ? body.nom.trim() : undefined;
    if (nom !== undefined) patch.nom = nom;
    const telephone = typeof body.telephone === "string" ? body.telephone.trim() || undefined : undefined;
    if (telephone !== undefined) patch.telephone = telephone;
    const section = typeof body.section === "string" && SECTIONS.includes(body.section as Inscription["section"]) ? body.section as Inscription["section"] : undefined;
    if (section !== undefined) patch.section = section;
    const solde = typeof body.solde === "boolean" ? body.solde : undefined;
    if (solde !== undefined) patch.solde = solde;
    let montantPaye: number | undefined;
    if (typeof body.montantPaye === "number" && body.montantPaye >= 0 && body.montantPaye <= MONTANT_PARTICIPATION) {
      montantPaye = Math.round(body.montantPaye);
    } else if (body.montantPaye === null || body.montantPaye === undefined) {
      montantPaye = undefined;
    }
    if (montantPaye !== undefined) patch.montantPaye = montantPaye;
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
    }
    const updated = await updateInscription(id, patch);
    if (!updated) return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
