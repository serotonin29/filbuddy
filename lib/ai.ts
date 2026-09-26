"use client";

// ============================================================
// Klien AI (OpenAI-compatible) untuk fitur terjemahan subtitle.
// Konfigurasi via env client: NEXT_PUBLIC_AI_BASE_URL,
// NEXT_PUBLIC_AI_API_KEY, NEXT_PUBLIC_AI_MODEL.
// ============================================================

const BASE = (process.env.NEXT_PUBLIC_AI_BASE_URL ?? "").replace(/\/+$/, "");
const KEY = process.env.NEXT_PUBLIC_AI_API_KEY ?? "";
const MODEL = process.env.NEXT_PUBLIC_AI_MODEL ?? "glm-5.3-flash";

/** true kalau konfigurasi AI lengkap → fitur terjemahan aktif. */
export function aiReady(): boolean {
  return !!(BASE && KEY);
}

export function aiModelName(): string {
  return MODEL;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Satu panggilan chat completions; lempar Error dengan pesan ramah. */
export async function aiChat(messages: ChatMessage[], opts?: { temperature?: number }): Promise<string> {
  if (!aiReady()) throw new Error("Konfigurasi AI belum lengkap (NEXT_PUBLIC_AI_BASE_URL / API key).");
  let res: Response;
  try {
    res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: opts?.temperature ?? 0.2,
        stream: false,
      }),
    });
  } catch {
    throw new Error("Tidak bisa menghubungi server AI (jaringan/CORS).");
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) detail = body.error.message;
    } catch {
      /* body bukan json */
    }
    throw new Error(`Server AI menolak (${detail}).`);
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Respons AI kosong.");
  return text;
}

export type Cue = { i: number; text: string };

const SYSTEM_PROMPT =
  "Kamu penerjemah subtitle. Terjemahkan SETIAP baris ke bahasa Indonesia yang santai dan mudah dipahami mahasiswa. " +
  "Pertahankan istilah teknis umum (mis. array, stack, big O) bila memang lazim. " +
  "Balas HANYA dengan baris bernomor dalam format persis 'N| terjemahan' (N = nomor asli), tanpa penjelasan, tanpa markdown, tanpa mengubah urutan atau nomor.";

/**
 * Terjemahkan kumpulan cue (sudah dipecah per batch) → map index → terjemahan.
 * Baris yang gagal/terlewat dikembalikan apa adanya (tidak pernah throw per-baris).
 */
export async function translateCues(
  cues: Cue[],
  onProgress?: (done: number, total: number) => void
): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  const BATCH = 30;
  const batches: Cue[][] = [];
  for (let i = 0; i < cues.length; i += BATCH) batches.push(cues.slice(i, i + BATCH));

  let done = 0;
  for (const batch of batches) {
    const userContent = batch.map((c) => `${c.i}| ${c.text.replace(/\n/g, " ")}`).join("\n");
    try {
      const reply = await aiChat([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ]);
      for (const line of reply.split("\n")) {
        const m = line.match(/^\s*(\d+)\s*\|\s?(.*)$/);
        if (!m) continue;
        const idx = Number(m[1]);
        const translated = m[2].trim();
        if (translated) result.set(idx, translated);
      }
    } catch {
      /* batch ini gagal → cue asli dipakai */
    }
    done += 1;
    onProgress?.(done, batches.length);
  }
  return result;
}
