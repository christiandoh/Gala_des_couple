"use client";

import * as React from "react";
import { InscriptionForm } from "@/components/gala/InscriptionForm";
import { InscriptionList } from "@/components/gala/InscriptionList";
import { StatsChart } from "@/components/gala/StatsChart";
import type { Inscription } from "@/types/gala";
import { HugeiconsIcon } from "@hugeicons/react";
import { WeddingIcon } from "@hugeicons/core-free-icons";

export default function Page() {
  const [inscriptions, setInscriptions] = React.useState<Inscription[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchInscriptions = React.useCallback(async () => {
    try {
      const res = await fetch("/api/inscriptions");
      if (res.ok) {
        const data = await res.json();
        setInscriptions(Array.isArray(data) ? data : []);
      }
    } catch {
      setInscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInscriptions();
  }, [fetchInscriptions]);

  const handleToggleSolde = async (id: string, solde: boolean) => {
    try {
      const res = await fetch(`/api/inscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solde }),
      });
      if (res.ok) fetchInscriptions();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/inscriptions/${id}`, { method: "DELETE" });
      if (res.ok) fetchInscriptions();
    } catch {
      // ignore
    }
  };

  const handleEdit = async (
    id: string,
    patch: { nom?: string; telephone?: string; section?: string; solde?: boolean; montantPaye?: number }
  ) => {
    try {
      const res = await fetch(`/api/inscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      if (res.ok) fetchInscriptions();
    } catch {
      throw new Error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Image d'arrière-plan : public/couple.png */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-background"
        style={{ backgroundImage: "url(/couple.png)" }}
      />
      <div className="absolute inset-0 -z-10 bg-background/20 backdrop-blur-[0.5px]" aria-hidden />
      <div className="relative min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
            <HugeiconsIcon icon={WeddingIcon} strokeWidth={2} className="size-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Gala Marié · Inscriptions</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        <InscriptionForm onSuccess={fetchInscriptions} />

        <section>
          <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
          {loading ? (
            <p className="text-muted-foreground text-sm">Chargement…</p>
          ) : (
            <StatsChart inscriptions={inscriptions} />
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Inscrits</h2>
          {loading ? (
            <p className="text-muted-foreground text-sm">Chargement…</p>
          ) : (
            <InscriptionList inscriptions={inscriptions} onToggleSolde={handleToggleSolde} onDelete={handleDelete} onEdit={handleEdit} />
          )}
        </section>
      </main>
      </div>
    </div>
  );
}
