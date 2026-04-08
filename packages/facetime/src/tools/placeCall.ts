import { runCommand } from "@mailappmcp/shared";

export type CallMode = "phone" | "audio" | "video";

export interface PlaceCallResult {
  scheme: string;
  target: string;
  url: string;
  mode: CallMode;
  note: string;
}

/**
 * Validate a call target. Phone calls require an E.164-ish digits-only string
 * (with optional leading "+"). FaceTime audio/video accept either a phone number
 * OR an Apple-ID email address.
 */
function normalizeTarget(target: string, mode: CallMode): string {
  const trimmed = target.trim();
  if (!trimmed) throw new Error("target is empty");

  // FaceTime audio/video can use an email (Apple ID).
  if ((mode === "audio" || mode === "video") && /@/.test(trimmed)) {
    // Loose email check — enough to reject obvious garbage.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new Error(`invalid Apple ID email: ${trimmed}`);
    }
    return trimmed;
  }

  // Otherwise treat as a phone number. Strip spaces, dashes, parens, dots.
  const cleaned = trimmed.replace(/[\s\-().]/g, "");
  if (!/^\+?\d{4,15}$/.test(cleaned)) {
    throw new Error(
      `invalid phone number: ${target} — expected digits with optional leading + (E.164)`,
    );
  }
  return cleaned;
}

/**
 * Initiate a call by handing a URL to `open`. macOS routes:
 *
 *   tel://             → FaceTime, which forwards to a paired iPhone over Continuity
 *                        (cellular call). Falls back to FaceTime audio if no iPhone.
 *   facetime-audio://  → FaceTime audio (Apple-ID-to-Apple-ID, or phone number via iPhone)
 *   facetime://        → FaceTime video
 *
 * On modern macOS the user usually still has to confirm the call in a system
 * prompt — there is no fully silent dial path, by design.
 */
export async function placeCall(target: string, mode: CallMode): Promise<PlaceCallResult> {
  const normalized = normalizeTarget(target, mode);
  const scheme =
    mode === "phone" ? "tel" : mode === "audio" ? "facetime-audio" : "facetime";
  const url = `${scheme}://${normalized}`;

  await runCommand("open", [url]);

  const note =
    mode === "phone"
      ? "Cellular call routed via FaceTime → paired iPhone (Continuity must be enabled). macOS may show a confirmation prompt."
      : mode === "audio"
      ? "FaceTime audio call initiated. macOS may show a confirmation prompt before dialing."
      : "FaceTime video call initiated. macOS may show a confirmation prompt before dialing.";

  return { scheme, target: normalized, url, mode, note };
}
