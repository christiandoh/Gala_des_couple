/**
 * Validation des captures de paiement (reçu mobile, type Unit Express / UBA).
 * Le paiement est accepté uniquement si la date extraite est du jour (même jour calendaire).
 * Formats supportés : "5 Feb 2026 9:26 AM", "05/02/2026", "2026-02-05", etc.
 */

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Patterns pour extraire une date depuis le texte d'une capture (Date & time, etc.) */
const DATE_PATTERNS: { pattern: RegExp; parse: (m: RegExpMatchArray) => Date | null }[] = [
  // "5 Feb 2026 9:26 AM" ou "5 Feb 2026"
  {
    pattern: /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?/i,
    parse(m) {
      const day = parseInt(m[1], 10);
      const month = MONTHS_EN.findIndex((mo) => mo.toLowerCase() === m[2].toLowerCase()) + 1;
      const year = parseInt(m[3], 10);
      let hour = m[4] != null ? parseInt(m[4], 10) : 0;
      const minute = m[5] != null ? parseInt(m[5], 10) : 0;
      const ampm = (m[6] || "").toUpperCase();
      if (ampm === "PM" && hour < 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(year, month - 1, day, hour, minute, 0, 0);
      }
      return null;
    },
  },
  // "05/02/2026" ou "5/2/2026" (DD/MM/YYYY ou MM/DD/YYYY — on suppose DD/MM pour contexte africain)
  {
    pattern: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    parse(m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      const year = parseInt(m[3], 10);
      const day = a <= 31 && b <= 12 ? a : b;
      const month = a <= 31 && b <= 12 ? b : a;
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(year, month - 1, day, 0, 0, 0, 0);
      }
      return null;
    },
  },
  // "2026-02-05" ISO
  {
    pattern: /(\d{4})-(\d{2})-(\d{2})/,
    parse(m) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      const day = parseInt(m[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(year, month - 1, day, 0, 0, 0, 0);
      }
      return null;
    },
  },
];

/** Vérifier que le statut indique un paiement réussi */
const STATUS_PATTERN = /(?:Status|Statut)\s*[:\s]*(?:Completed|Complété|Success|Réussi|Succès)/i;

/** Optionnel : extraire l'ID de transaction */
const TRANSACTION_ID_PATTERN = /(?:Transaction\s*ID|ID\s*transaction|Reference)\s*[:\s]*([A-Z0-9]{10,30})/i;

export interface PaymentCaptureResult {
  valid: boolean;
  error?: string;
  extractedDate?: Date;
  transactionId?: string;
  statusFound?: boolean;
}

/**
 * Vérifie si une date correspond au jour courant (même jour calendaire, timezone locale).
 */
function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Analyse le texte d'une capture de paiement (reçu mobile).
 * - Extrait la date et vérifie qu'elle est du jour (sinon refus total).
 * - Vérifie la présence d'un statut type "Completed".
 */
export function validatePaymentCapture(captureText: string): PaymentCaptureResult {
  const text = captureText.trim();
  if (!text) {
    return { valid: false, error: "Aucun texte fourni. Collez le contenu de votre reçu." };
  }

  // 1) Extraire la date avec le premier pattern qui matche
  let extractedDate: Date | null = null;
  for (const { pattern, parse } of DATE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      extractedDate = parse(m);
      if (extractedDate) break;
    }
  }

  if (!extractedDate) {
    return {
      valid: false,
      error: "Date introuvable dans la capture. Assurez-vous que la date et l'heure du reçu sont visibles (ex. 5 Feb 2026 9:26 AM).",
    };
  }

  // 2) Paiement du jour obligatoire
  if (!isToday(extractedDate)) {
    return {
      valid: false,
      error: "Paiement refusé : la capture n'est pas du jour. Seuls les paiements effectués aujourd'hui sont acceptés.",
      extractedDate,
    };
  }

  // 3) Statut "Completed" (ou équivalent) requis
  const statusFound = STATUS_PATTERN.test(text);
  if (!statusFound) {
    return {
      valid: false,
      error: "Statut du paiement introuvable ou non « Completed ». Vérifiez que votre reçu indique bien un paiement réussi.",
      extractedDate,
    };
  }

  const transactionIdMatch = text.match(TRANSACTION_ID_PATTERN);
  const transactionId = transactionIdMatch ? transactionIdMatch[1] : undefined;

  return {
    valid: true,
    extractedDate,
    transactionId,
    statusFound: true,
  };
}
