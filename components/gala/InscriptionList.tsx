"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SECTION_LABELS, MONTANT_PARTICIPATION } from "@/types/gala";
import type { Inscription, Section } from "@/types/gala";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SECTIONS: Section[] = ["couple", "cheminant", "fiance"];

export function InscriptionList({
  inscriptions,
  onToggleSolde,
  onDelete,
  onEdit,
}: {
  inscriptions: Inscription[];
  onToggleSolde: (id: string, solde: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, patch: { nom?: string; telephone?: string; section?: Section; solde?: boolean; montantPaye?: number }) => Promise<void>;
}) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [editInscription, setEditInscription] = React.useState<Inscription | null>(null);
  const [editNom, setEditNom] = React.useState("");
  const [editTelephone, setEditTelephone] = React.useState("");
  const [editSection, setEditSection] = React.useState<Section | "">("");
  const [editSolde, setEditSolde] = React.useState(false);
  const [editMontantPaye, setEditMontantPaye] = React.useState("");
  const [editLoading, setEditLoading] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (editInscription) {
      setEditNom(editInscription.nom);
      setEditTelephone(editInscription.telephone ?? "");
      setEditSection(editInscription.section);
      setEditSolde(editInscription.solde);
      setEditMontantPaye(editInscription.montantPaye != null ? String(editInscription.montantPaye) : "");
      setEditError(null);
    }
  }, [editInscription]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInscription || !editNom.trim() || !editSection) return;
    const montantNum = editMontantPaye.trim()
      ? Math.min(MONTANT_PARTICIPATION, Math.max(0, Number(editMontantPaye.replace(/\s/g, "")) || 0))
      : undefined;
    setEditError(null);
    setEditLoading(true);
    try {
      await onEdit(editInscription.id, {
        nom: editNom.trim(),
        telephone: editTelephone.trim() || undefined,
        section: editSection,
        solde: editSolde,
        montantPaye: editSolde ? undefined : montantNum,
      });
      setEditInscription(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const deleteTarget = deleteId ? inscriptions.find((i) => i.id === deleteId) : null;

  if (inscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Aucune inscription pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Liste des inscrits</CardTitle>
          <CardDescription>
            {inscriptions.length} inscription(s) · {MONTANT_PARTICIPATION.toLocaleString("fr-FR")} XOF / personne
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left font-medium px-4 py-3">Nom</th>
                <th className="text-left font-medium px-4 py-3">Téléphone</th>
                <th className="text-left font-medium px-4 py-3">Section</th>
                <th className="text-left font-medium px-4 py-3">Participation</th>
                <th className="text-left font-medium px-4 py-3 w-24">Statut</th>
                <th className="text-left font-medium px-2 py-3 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inscriptions.map((ins) => (
                <tr key={ins.id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium">{ins.nom}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{ins.telephone || "—"}</td>
                  <td className="px-4 py-2.5">{SECTION_LABELS[ins.section]}</td>
                  <td className="px-4 py-2.5">
                    {MONTANT_PARTICIPATION.toLocaleString("fr-FR")} XOF
                    {!ins.solde && ins.montantPaye != null && ins.montantPaye > 0 && (
                      <span className="block text-muted-foreground text-xs mt-0.5">
                        {ins.montantPaye.toLocaleString("fr-FR")} XOF payés
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-0.5 px-1"
                      onClick={() => onToggleSolde(ins.id, !ins.solde)}
                    >
                      <Badge variant={ins.solde ? "soldé" : "non-soldé"}>
                        {ins.solde ? "Soldé" : "Non soldé"}
                      </Badge>
                    </Button>
                  </td>
                  <td className="px-2 py-2.5 flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditInscription(ins)}
                      title="Modifier"
                      aria-label={`Modifier ${ins.nom}`}
                    >
                      <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(ins.id)}
                      title="Supprimer"
                      aria-label={`Supprimer ${ins.nom}`}
                    >
                      <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Voulez-vous vraiment supprimer l'inscription de « ${deleteTarget.nom } » ? Cette action est irréversible.`
                : "Voulez-vous vraiment supprimer cette inscription ?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editInscription} onOpenChange={(open) => !open && setEditInscription(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'inscription</DialogTitle>
          </DialogHeader>
          {editInscription && (
            <form onSubmit={handleEditSubmit}>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel>Nom (couple ou personne)</FieldLabel>
                  <Input value={editNom} onChange={(e) => setEditNom(e.target.value)} placeholder="Ex. Jean et Marie Dupont" required />
                </Field>
                <Field>
                  <FieldLabel>Téléphone (optionnel)</FieldLabel>
                  <Input type="tel" value={editTelephone} onChange={(e) => setEditTelephone(e.target.value)} placeholder="Ex. 07 00 00 00 00" />
                </Field>
                <Field>
                  <FieldLabel>Section</FieldLabel>
                  <Select value={editSection} onValueChange={(v) => setEditSection(v as Section)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir une section" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{SECTION_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="edit-solde" checked={editSolde} onChange={(e) => setEditSolde(e.target.checked)} className="rounded border-border" />
                    <FieldLabel htmlFor="edit-solde" className="cursor-pointer">Participation soldée (payée)</FieldLabel>
                  </div>
                </Field>
                {!editSolde && (
                  <Field>
                    <FieldLabel>Somme déjà payée (XOF)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      max={MONTANT_PARTICIPATION}
                      step={1000}
                      value={editMontantPaye}
                      onChange={(e) => setEditMontantPaye(e.target.value)}
                      placeholder={`Max ${MONTANT_PARTICIPATION.toLocaleString("fr-FR")}`}
                    />
                  </Field>
                )}
                {editError && <p className="text-destructive text-sm">{editError}</p>}
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditInscription(null)}>Annuler</Button>
                  <Button type="submit" disabled={editLoading}>{editLoading ? "Enregistrement…" : "Enregistrer"}</Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
