"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTION_LABELS } from "@/types/gala";
import type { Inscription } from "@/types/gala";

function bySection(inscriptions: Inscription[]) {
  const counts: Record<string, number> = { couple: 0, cheminant: 0, fiance: 0 };
  for (const i of inscriptions) {
    counts[i.section] = (counts[i.section] ?? 0) + 1;
  }
  return [
    { section: SECTION_LABELS.couple, total: counts.couple },
    { section: SECTION_LABELS.cheminant, total: counts.cheminant },
    { section: SECTION_LABELS.fiance, total: counts.fiance },
  ];
}

function byMonth(inscriptions: Inscription[]) {
  const byMonth: Record<string, number> = {};
  for (const i of inscriptions) {
    const key = i.createdAt.slice(0, 7); // YYYY-MM
    byMonth[key] = (byMonth[key] ?? 0) + 1;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mois, total]) => ({ mois, total }));
}

export function StatsChart({ inscriptions }: { inscriptions: Inscription[] }) {
  const sectionData = bySection(inscriptions);
  const curveData = byMonth(inscriptions);
  const soldéCount = inscriptions.filter((i) => i.solde).length;
  const nonSoldéCount = inscriptions.length - soldéCount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistiques par section</CardTitle>
          <CardDescription>Nombre d'inscriptions (couple, cheminant, fiancé)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="section" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius-lg)",
                  }}
                />
                <Bar dataKey="total" name="Inscriptions" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Évolution des inscriptions</CardTitle>
          <CardDescription>Inscriptions par mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            {curveData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius-lg)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Inscriptions"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Pas encore de données dans le temps.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participation (20 000 XOF)</CardTitle>
          <CardDescription>Soldé vs non soldé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="rounded-lg border border-border bg-chart-2/10 px-4 py-3 min-w-[120px]">
              <p className="text-2xl font-semibold text-chart-2">{soldéCount}</p>
              <p className="text-sm text-muted-foreground">Soldé</p>
            </div>
            <div className="rounded-lg border border-border bg-destructive/10 px-4 py-3 min-w-[120px]">
              <p className="text-2xl font-semibold text-destructive">{nonSoldéCount}</p>
              <p className="text-sm text-muted-foreground">Non soldé</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
