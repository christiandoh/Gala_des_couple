"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SECTION_LABELS, MONTANT_PARTICIPATION, PAYMENT_LINK } from "@/types/gala";
import type { Section } from "@/types/gala";

const SECTIONS: Section[] = ["couple", "cheminant", "fiance"];

async function extractTextFromImage(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("fra+eng", 1, { logger: () => {} });
  const { data } = await worker.recognize(file);
  await worker.terminate();
  return data.text ?? "";
}

export function InscriptionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [nom, setNom] = React.useState("");
  const [telephone, setTelephone] = React.useState("");
  const [section, setSection] = React.useState<Section | "">("");
  const [solde, setSolde] = React.useState(false);
  const [montantPaye, setMontantPaye] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = React.useState<string | null>(null);
  const [captureText, setCaptureText] = React.useState("");
  const [captureImagePreview, setCaptureImagePreview] = React.useState<string | null>(null);
  const [captureLoading, setCaptureLoading] = React.useState(false);
  const [captureOcrLoading, setCaptureOcrLoading] = React.useState(false);
  const [captureError, setCaptureError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !section) return;
    const montantNum = montantPaye.trim() ? Math.min(MONTANT_PARTICIPATION, Math.max(0, Number(montantPaye.replace(/\s/g, "")) || 0)) : undefined;
    if (montantNum !== undefined && (montantNum < 0 || montantNum > MONTANT_PARTICIPATION)) {
      setError(`La somme doit être entre 0 et ${MONTANT_PARTICIPATION.toLocaleString("fr-FR")} XOF`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          telephone: telephone.trim() || undefined,
          section,
          solde: solde ? false : false, // si "soldé" coché, on valide via capture puis PATCH
          montantPaye: solde ? undefined : montantNum,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }
      const created = await res.json();
      if (solde && created?.id) {
        setPendingPaymentId(created.id);
        setCaptureText("");
        setCaptureError(null);
      } else {
        setNom("");
        setTelephone("");
        setSection("");
        setSolde(false);
        setMontantPaye("");
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const processImageFile = React.useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setCaptureError(null);
    setCaptureImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCaptureOcrLoading(true);
    setCaptureText("");
    extractTextFromImage(file)
      .then((text) => {
        setCaptureText(text.trim());
      })
      .catch(() => {
        setCaptureError("Impossible de lire le texte sur l'image. Collez une capture plus nette ou saisissez le texte.");
      })
      .finally(() => setCaptureOcrLoading(false));
  }, []);

  const handleCapturePaste = React.useCallback(
    (e: React.ClipboardEvent) => {
      const file = e.clipboardData?.files?.[0];
      if (file?.type.startsWith("image/")) {
        e.preventDefault();
        processImageFile(file);
      }
    },
    [processImageFile]
  );

  const handleCaptureDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file?.type.startsWith("image/")) processImageFile(file);
    },
    [processImageFile]
  );

  const handleCaptureDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleCaptureFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImageFile(file);
      e.target.value = "";
    },
    [processImageFile]
  );

  React.useEffect(() => {
    if (!pendingPaymentId) {
      setCaptureImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [pendingPaymentId]);

  const handleValidateCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPaymentId || !captureText.trim()) return;
    setCaptureError(null);
    setCaptureLoading(true);
    try {
      const res = await fetch(`/api/inscriptions/${pendingPaymentId}/validate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captureText: captureText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCaptureError(data.error || "Validation échouée.");
        return;
      }
      setPendingPaymentId(null);
      setCaptureImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setNom("");
      setTelephone("");
      setSection("");
      setSolde(false);
      setMontantPaye("");
      onSuccess?.();
    } catch {
      setCaptureError("Erreur lors de la validation.");
    } finally {
      setCaptureLoading(false);
    }
  };

  return (
    <>
    <Card className="bg-white/70 dark:bg-white/10 backdrop-blur-2xl border border-white/30 dark:border-white/20 shadow-xl shadow-black/5">
      <CardHeader className="border-white/20">
        <CardTitle className="text-foreground">Nouvelle inscription</CardTitle>
        <CardDescription className="text-muted-foreground/90">
          Participation : {MONTANT_PARTICIPATION.toLocaleString("fr-FR")} XOF
        </CardDescription>
      </CardHeader>
      <CardContent className="border-t border-white/20">
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Nom (couple ou personne)</FieldLabel>
              <Input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex. Jean et Marie Dupont"
                required
                className="bg-white/50 dark:bg-white/10 border-white/30 backdrop-blur-sm"
              />
            </Field>
            <Field>
              <FieldLabel>Téléphone (optionnel)</FieldLabel>
              <Input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Ex. 07 00 00 00 00"
                className="bg-white/50 dark:bg-white/10 border-white/30 backdrop-blur-sm"
              />
            </Field>
            <Field>
              <FieldLabel>Section</FieldLabel>
              <Select value={section} onValueChange={(v) => setSection(v as Section)} required>
                <SelectTrigger className="w-full bg-white/50 dark:bg-white/10 border-white/30 backdrop-blur-sm">
                  <SelectValue placeholder="Choisir une section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SECTION_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="solde"
                  checked={solde}
                  onChange={(e) => setSolde(e.target.checked)}
                  className="rounded border-border"
                />
                <FieldLabel htmlFor="solde" className="cursor-pointer">
                  Participation soldée (payée)
                </FieldLabel>
              </div>
            </Field>
            {!solde && (
              <Field>
                <FieldLabel>Somme déjà payée (XOF)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={MONTANT_PARTICIPATION}
                  step={1000}
                  value={montantPaye}
                  onChange={(e) => setMontantPaye(e.target.value)}
                  placeholder={`Ex. 10 000 (max ${MONTANT_PARTICIPATION.toLocaleString("fr-FR")})`}
                  className="bg-white/50 dark:bg-white/10 border-white/30 backdrop-blur-sm"
                />
              </Field>
            )}
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>

    <Dialog open={!!pendingPaymentId} onOpenChange={(open) => !open && setPendingPaymentId(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Valider votre paiement</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Passez au paiement en cliquant sur le lien ci-dessous. Après avoir payé, <strong>collez la capture de votre reçu</strong> (comme l&apos;exemple : capture d&apos;écran avec Date, Statut Completed, Transaction ID). <strong>Seuls les paiements du jour sont acceptés.</strong>
        </p>
        {PAYMENT_LINK ? (
          <a
            href={PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Aller au paiement →
          </a>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">Configurez NEXT_PUBLIC_PAYMENT_LINK dans .env pour afficher le lien.</p>
        )}
        <form onSubmit={handleValidateCapture}>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel>Capture du reçu</FieldLabel>
              <div
                onPaste={handleCapturePaste}
                onDrop={handleCaptureDrop}
                onDragOver={handleCaptureDragOver}
                className="rounded-lg border-2 border-dashed border-input bg-muted/30 p-4 text-center text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCaptureFileChange}
                  className="sr-only"
                />
                {captureImagePreview ? (
                  <div className="space-y-2">
                    <img src={captureImagePreview} alt="Capture du reçu" className="mx-auto max-h-40 rounded border border-border object-contain" />
                    {captureOcrLoading ? (
                      <p>Lecture du reçu…</p>
                    ) : (
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Changer l&apos;image
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <p><strong>Collez</strong> la capture ici (Ctrl+V) ou <strong>déposez</strong> l&apos;image</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()} disabled={captureOcrLoading}>
                      Choisir un fichier
                    </Button>
                  </>
                )}
              </div>
            </Field>
            <Field>
              <FieldLabel>Texte extrait (modifiable si besoin)</FieldLabel>
              <textarea
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value)}
                placeholder="Le texte sera extrait automatiquement après collage de la capture. Sinon collez ou saisissez le texte du reçu (Date, Statut, Transaction ID)."
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </Field>
            {captureError && <p className="text-destructive text-sm">{captureError}</p>}
            <Button type="submit" disabled={captureLoading || !captureText.trim()}>
              {captureLoading ? "Validation…" : "Valider le paiement"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
