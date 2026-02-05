import { promises as fs } from "fs";
import path from "path";
import type { Inscription } from "@/types/gala";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "inscriptions.json");

export async function getInscriptions(): Promise<Inscription[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const data = JSON.parse(raw) as Inscription[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveInscriptions(inscriptions: Inscription[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(inscriptions, null, 2), "utf-8");
}

export async function addInscription(inscription: Omit<Inscription, "id" | "createdAt">): Promise<Inscription> {
  const list = await getInscriptions();
  const newOne: Inscription = {
    ...inscription,
    id: `ins-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(newOne);
  await saveInscriptions(list);
  return newOne;
}

export async function updateInscription(id: string, patch: Partial<Pick<Inscription, "nom" | "telephone" | "section" | "solde" | "montantPaye">>): Promise<Inscription | null> {
  const list = await getInscriptions();
  const index = list.findIndex((i) => i.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...patch };
  await saveInscriptions(list);
  return list[index];
}

export async function deleteInscription(id: string): Promise<boolean> {
  const list = await getInscriptions();
  const filtered = list.filter((i) => i.id !== id);
  if (filtered.length === list.length) return false;
  await saveInscriptions(filtered);
  return true;
}
