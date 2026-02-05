import { NextResponse } from "next/server";
import { updateInscription } from "@/lib/data";
import { validatePaymentCapture } from "@/lib/payment-capture";

/**
 * Valide une capture de paiement (texte collé du reçu) et marque l'inscription comme soldée
 * uniquement si la date extraite est du jour et le statut indique un paiement réussi.
 * Sinon : refus total (400).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const captureText = typeof body.captureText === "string" ? body.captureText : "";
    if (!captureText.trim()) {
      return NextResponse.json(
        { error: "Le texte de la capture est requis." },
        { status: 400 }
      );
    }

    const result = validatePaymentCapture(captureText);
    if (!result.valid) {
      return NextResponse.json(
        { error: result.error ?? "Capture invalide." },
        { status: 400 }
      );
    }

    const updated = await updateInscription(id, {
      solde: true,
      montantPaye: undefined, // considéré comme totalement payé
    });
    if (!updated) {
      return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      inscription: updated,
      extractedDate: result.extractedDate?.toISOString(),
      transactionId: result.transactionId,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
