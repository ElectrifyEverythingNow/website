// Cloudflare Pages Function: POST /api/analyze-panel
//
// Accepts multipart/form-data with:
//   image:    File (required)
//   upgrades: JSON-encoded string array of upgrade IDs (required)
//
// Returns JSON: { analysis, recommendations }
//
// OPENAI_API_KEY must be set as a Cloudflare Pages secret. Never exposed to
// client code.

interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_VISION_MODEL?: string;
}

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_UPGRADE_IDS = 12;

const ALLOWED_UPGRADE_IDS = new Set([
  "heat-pump",
  "backup-resistance",
  "hpwh",
  "ev",
  "induction",
  "dryer",
]);

interface UpgradeMeta {
  amps: number;
  spaces: number;
  shortLabel: string;
  flexibleLoad: boolean;
}

const UPGRADE_META: Record<string, UpgradeMeta> = {
  "heat-pump": { amps: 40, spaces: 2, shortLabel: "Heat pump", flexibleLoad: false },
  "backup-resistance": { amps: 40, spaces: 2, shortLabel: "Backup heat kit", flexibleLoad: false },
  hpwh: { amps: 30, spaces: 2, shortLabel: "HPWH", flexibleLoad: true },
  ev: { amps: 50, spaces: 2, shortLabel: "EV charger", flexibleLoad: true },
  induction: { amps: 50, spaces: 2, shortLabel: "Induction stove", flexibleLoad: false },
  dryer: { amps: 30, spaces: 2, shortLabel: "Dryer", flexibleLoad: true },
};

type Confidence = "low" | "medium" | "high";
type TandemQuad = "likely yes" | "likely no" | "unknown";
type LabelReadable = "yes" | "partial" | "no" | "unknown";

interface DetectedPanel {
  brand: string;
  modelOrSeries: string;
  mainBreakerAmps: number;
  busRatingAmps: number;
  totalSpaces: number;
  openFullSpaces: number;
  openTwoPoleSpaces: number;
  tandemQuadCompatibility: TandemQuad;
  existingLargeLoads: string[];
  conditionFlags: string[];
  labelReadable: LabelReadable;
  notes: string;
}

interface PanelAnalysis {
  detected: DetectedPanel;
  overallConfidence: Confidence;
  limitations: string[];
}

interface SolutionCard {
  title: string;
  cost: string;
  confidence: Confidence;
  why: string;
}

interface Recommendations {
  spacesNeeded: number;
  largestBreaker: number;
  spacesShort: number;
  conditionConcern: boolean;
  options: SolutionCard[];
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { headers: CORS_HEADERS });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Top-level catch — guarantees we always return a JSON body the client can
  // parse, instead of letting Cloudflare wrap an unhandled throw as a 502
  // HTML page.
  try {
    return await handlePost(context);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze-panel] unhandled error:", message);
    return jsonResponse(
      {
        error:
          "The analysis service hit an unexpected error. Please try again with a clearer photo.",
      },
      500,
    );
  }
};

async function handlePost(
  context: Parameters<PagesFunction<Env>>[0],
): Promise<Response> {
  const { request, env } = context;

  if (!env.OPENAI_API_KEY) {
    return jsonResponse(
      {
        error:
          "Server is missing OPENAI_API_KEY. Set it with `wrangler pages secret put OPENAI_API_KEY`.",
      },
      500,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: "Invalid form data" }, 400);
  }

  const image = formData.get("image");
  const upgradesRaw = formData.get("upgrades");

  if (!(image instanceof File)) {
    return jsonResponse({ error: "Missing image upload." }, 400);
  }
  if (image.size === 0) {
    return jsonResponse({ error: "Uploaded image is empty." }, 400);
  }
  if (image.size > MAX_BYTES) {
    return jsonResponse(
      { error: "Image is too large. Please upload an image under 12 MB." },
      413,
    );
  }
  const mimeType = (image.type || "").toLowerCase();
  if (mimeType && !ALLOWED_MIME.includes(mimeType)) {
    return jsonResponse(
      { error: "Unsupported file type. Please upload a JPEG, PNG, or WEBP." },
      415,
    );
  }

  let upgradeIds: string[] = [];
  if (typeof upgradesRaw === "string" && upgradesRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(upgradesRaw);
      if (Array.isArray(parsed)) {
        upgradeIds = parsed
          .filter((x): x is string => typeof x === "string")
          .filter((id) => ALLOWED_UPGRADE_IDS.has(id))
          .slice(0, MAX_UPGRADE_IDS);
      }
    } catch {
      return jsonResponse({ error: "Invalid 'upgrades' JSON." }, 400);
    }
  }

  let dataUrl: string;
  try {
    dataUrl = await fileToDataUrl(image);
  } catch {
    return jsonResponse({ error: "Could not read uploaded image." }, 400);
  }

  const upgradesSummary =
    upgradeIds.length === 0
      ? "no upgrades selected"
      : upgradeIds
          .map((id) => UPGRADE_META[id]?.shortLabel.toLowerCase() ?? id)
          .join(", ");

  const model = env.OPENAI_VISION_MODEL || DEFAULT_MODEL;

  let analysis: PanelAnalysis;
  try {
    const raw = await callOpenAIVision({
      apiKey: env.OPENAI_API_KEY,
      model,
      dataUrl,
      upgradesSummary,
    });
    analysis = normalizeAnalysis(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze-panel] OpenAI call failed:", message);
    const fb = fallbackAnalysis(`Vision call failed: ${message}`);
    // Return 200 with a fallback so the frontend can still render the
    // editable detected-panel form and the user can fill values manually.
    return jsonResponse({
      warning:
        "We couldn't read the panel automatically. Fill in the details below or try a clearer photo.",
      analysis: fb,
      recommendations: computeRecommendations(fb, upgradeIds),
    });
  }

  const recommendations = computeRecommendations(analysis, upgradeIds);
  return jsonResponse({ analysis, recommendations });
}

async function fileToDataUrl(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${base64}`;
}

interface OpenAICallArgs {
  apiKey: string;
  model: string;
  dataUrl: string;
  upgradesSummary: string;
}

async function callOpenAIVision(args: OpenAICallArgs): Promise<unknown> {
  const { apiKey, model, dataUrl, upgradesSummary } = args;

  const systemPrompt =
    "You are reading a homeowner electrical panel photo for a planning tool. " +
    "Extract only facts visible in the image. If uncertain, use Unknown, 0, " +
    "or lower confidence. Do not provide electrical advice. Do not say that " +
    "work is safe or code-compliant. Return strict JSON only — no prose, no " +
    "markdown fences.";

  const userInstruction = `The homeowner may add these upgrades: ${upgradesSummary}.

Return strict JSON only with this shape:
{
  "detected": {
    "brand": "Square D|Siemens|Eaton|GE|Leviton|Federal Pacific|Zinsco|Unknown",
    "modelOrSeries": "string or Unknown",
    "mainBreakerAmps": 0,
    "busRatingAmps": 0,
    "totalSpaces": 0,
    "openFullSpaces": 0,
    "openTwoPoleSpaces": 0,
    "tandemQuadCompatibility": "likely yes|likely no|unknown",
    "existingLargeLoads": ["dryer", "range", "AC", "heat pump", "EV", "water heater", "hot tub"],
    "conditionFlags": ["rust", "burn marks", "water damage", "obsolete-looking equipment", "double taps suspected", "missing cover", "none"],
    "labelReadable": "yes|partial|no|unknown",
    "notes": "one concise sentence"
  },
  "overallConfidence": "low|medium|high",
  "limitations": ["concise limitation"]
}

Identify visible facts only. Do not invent panel model or compatibility if the
label is not readable. If brand/model is uncertain, return Unknown or a
cautious phrase like "Square D — not confirmed". If the image is poor, return
low confidence. Condition flags should be cautious; e.g. "obsolete-looking
equipment" is not definitive unless visible.`;

  const body = {
    model,
    response_format: { type: "json_object" },
    temperature: 0,
    max_tokens: 800,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userInstruction },
          { type: "image_url", image_url: { url: dataUrl, detail: "auto" } },
        ],
      },
    ],
  };

  // Time-bound the upstream call so Cloudflare doesn't wrap a stalled fetch
  // as a 502 — we'd rather return our own JSON fallback.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45_000);

  let res: Response;
  try {
    res = await fetchWithRetry(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
      2,
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("OpenAI request timed out after 45s");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 200)}`);
  }

  let json: { choices?: Array<{ message?: { content?: string } }> };
  try {
    json = (await res.json()) as typeof json;
  } catch {
    throw new Error("OpenAI returned a non-JSON response");
  }
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content from model");

  try {
    return JSON.parse(content);
  } catch {
    // Try to recover a JSON object from any wrapping prose
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Model did not return valid JSON");
  }
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxAttempts: number,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      // Retry on transient upstream errors
      if (res.status >= 500 && res.status < 600 && attempt < maxAttempts) {
        await sleep(400 * attempt);
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      // Don't retry aborts (timeout) — surface immediately
      if (err instanceof Error && err.name === "AbortError") throw err;
      if (attempt < maxAttempts) {
        await sleep(400 * attempt);
        continue;
      }
    }
  }
  throw lastErr ?? new Error("fetchWithRetry: unknown error");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const ALLOWED_TANDEM: TandemQuad[] = ["likely yes", "likely no", "unknown"];
const ALLOWED_LABEL: LabelReadable[] = ["yes", "partial", "no", "unknown"];
const ALLOWED_CONFIDENCE: Confidence[] = ["low", "medium", "high"];

function asString(v: unknown, fallback = "Unknown"): string {
  if (typeof v !== "string") return fallback;
  const t = v.trim();
  return t.length ? t : fallback;
}
function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, v);
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return fallback;
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}
function asEnum<T extends string>(v: unknown, allowed: T[], fallback: T): T {
  if (typeof v !== "string") return fallback;
  const lower = v.trim().toLowerCase();
  for (const a of allowed) if (a.toLowerCase() === lower) return a;
  return fallback;
}

function normalizeAnalysis(raw: unknown): PanelAnalysis {
  const r = (raw && typeof raw === "object" ? raw : {}) as {
    detected?: Record<string, unknown>;
    overallConfidence?: unknown;
    limitations?: unknown;
  };
  const d = (r.detected && typeof r.detected === "object" ? r.detected : {}) as Record<
    string,
    unknown
  >;

  const detected: DetectedPanel = {
    brand: asString(d.brand, "Unknown"),
    modelOrSeries: asString(d.modelOrSeries, "Unknown"),
    mainBreakerAmps: asNumber(d.mainBreakerAmps, 0),
    busRatingAmps: asNumber(d.busRatingAmps, 0),
    totalSpaces: asNumber(d.totalSpaces, 0),
    openFullSpaces: asNumber(d.openFullSpaces, 0),
    openTwoPoleSpaces: asNumber(d.openTwoPoleSpaces, 0),
    tandemQuadCompatibility: asEnum<TandemQuad>(
      d.tandemQuadCompatibility,
      ALLOWED_TANDEM,
      "unknown",
    ),
    existingLargeLoads: asStringArray(d.existingLargeLoads),
    conditionFlags: asStringArray(d.conditionFlags),
    labelReadable: asEnum<LabelReadable>(d.labelReadable, ALLOWED_LABEL, "unknown"),
    notes: asString(d.notes, ""),
  };

  return {
    detected,
    overallConfidence: asEnum<Confidence>(
      r.overallConfidence,
      ALLOWED_CONFIDENCE,
      "low",
    ),
    limitations: asStringArray(r.limitations),
  };
}

function fallbackAnalysis(reason: string): PanelAnalysis {
  return {
    detected: {
      brand: "Unknown",
      modelOrSeries: "Unknown",
      mainBreakerAmps: 0,
      busRatingAmps: 0,
      totalSpaces: 0,
      openFullSpaces: 0,
      openTwoPoleSpaces: 0,
      tandemQuadCompatibility: "unknown",
      existingLargeLoads: [],
      conditionFlags: [],
      labelReadable: "unknown",
      notes: "",
    },
    overallConfidence: "low",
    limitations: [reason],
  };
}

const OBSOLETE_BRANDS = ["federal pacific", "fpe", "zinsco", "stab-lok"];
const CONDITION_KEYWORDS = [
  "rust",
  "burn",
  "scorch",
  "water",
  "obsolete",
  "double tap",
  "double-tap",
  "missing cover",
];

function isConditionConcern(brand: string, conditionFlags: string[]): boolean {
  const b = (brand || "").toLowerCase();
  if (OBSOLETE_BRANDS.some((x) => b.includes(x))) return true;
  return conditionFlags.some((flag) => {
    const lower = flag.toLowerCase();
    if (lower === "none") return false;
    return CONDITION_KEYWORDS.some((kw) => lower.includes(kw));
  });
}

function computeRecommendations(
  analysis: PanelAnalysis,
  upgradeIds: string[],
): Recommendations {
  const selected = upgradeIds
    .map((id) => UPGRADE_META[id])
    .filter((u): u is UpgradeMeta => Boolean(u));
  const selectedTagged = upgradeIds
    .map((id) => ({ id, meta: UPGRADE_META[id] }))
    .filter((x): x is { id: string; meta: UpgradeMeta } => Boolean(x.meta));

  const spacesNeeded = selected.reduce((s, u) => s + u.spaces, 0);
  const largestBreaker = selected.reduce(
    (m, u) => (u.amps > m ? u.amps : m),
    0,
  );

  const detected = analysis.detected;
  const openFullSpaces = Math.max(0, detected.openFullSpaces || 0);
  const spacesShort = Math.max(0, spacesNeeded - openFullSpaces);
  const conditionConcern = isConditionConcern(
    detected.brand,
    detected.conditionFlags || [],
  );

  const mainAmps = detected.mainBreakerAmps || 0;
  const smallService = mainAmps > 0 && mainAmps <= 125;
  const unknownService = mainAmps === 0;
  const largeService = mainAmps >= 150;

  const flexibleLoadsSelected = selected.some((u) => u.flexibleLoad);
  const evSelected = selectedTagged.some((u) => u.id === "ev");
  const hpwhOrDryer = selectedTagged.some(
    (u) => u.id === "hpwh" || u.id === "dryer",
  );
  const heatOnly =
    selectedTagged.length > 0 &&
    selectedTagged.every(
      (u) => u.id === "heat-pump" || u.id === "backup-resistance",
    );

  const imageConfidence = analysis.overallConfidence;
  const options: SolutionCard[] = [];

  if (!conditionConcern && openFullSpaces >= spacesNeeded && spacesNeeded > 0) {
    options.push({
      title: "Add the breakers (direct install)",
      cost: "$500–$2,500+",
      confidence: imageConfidence === "low" ? "low" : "high",
      why: "Detected open spaces may cover the selected upgrades. Electrician still needs load calculation and equipment specs.",
    });
  }

  if (
    !conditionConcern &&
    spacesShort > 0 &&
    detected.tandemQuadCompatibility === "likely yes"
  ) {
    let confidence: Confidence;
    if (spacesShort <= 4 && imageConfidence !== "low") confidence = "high";
    else if (imageConfidence === "low") confidence = "low";
    else confidence = "medium";
    options.push({
      title: "Use tandem or quad breakers",
      cost: "$300–$1,500",
      confidence,
      why: "May free needed spaces without replacing the panel.",
    });
  }

  if (
    !conditionConcern &&
    spacesShort > 0 &&
    (detected.tandemQuadCompatibility === "unknown" ||
      detected.tandemQuadCompatibility === "likely no")
  ) {
    const confidence: Confidence =
      detected.tandemQuadCompatibility === "likely no" ? "low" : "medium";
    options.push({
      title: "Check tandem/quad compatibility",
      cost: "$0–$300 diagnosis; $300–$1,500 if compatible",
      confidence,
      why: "A full panel may be a space problem, not a service-capacity problem. The panel label/model decides.",
    });
  }

  const wantsLoadShare =
    flexibleLoadsSelected ||
    smallService ||
    (detected.existingLargeLoads || []).length > 0;
  if (!conditionConcern && wantsLoadShare) {
    let confidence: Confidence;
    if (evSelected) confidence = "high";
    else if (hpwhOrDryer) confidence = "medium";
    else if (heatOnly) confidence = "low";
    else confidence = "medium";
    options.push({
      title: "Simple switch / load sharing",
      cost: "$700–$2,500",
      confidence,
      why: "Best for flexible loads like EV charging, and sometimes HPWH/laundry. Lets two large loads avoid running together.",
    });
  }

  if (!conditionConcern && spacesShort > 0 && largeService) {
    options.push({
      title: "Add a small subpanel",
      cost: "$1,500–$4,000+",
      confidence: "medium",
      why: "Adds breaker spaces when service has headroom. Does not add service amperage.",
    });
  }

  const wantsMeasured =
    smallService ||
    unknownService ||
    selected.length >= 3 ||
    largestBreaker >= 50;
  if (!conditionConcern && wantsMeasured) {
    options.push({
      title: "Measured load / smart load management",
      cost: "$500–$4,000+",
      confidence: imageConfidence === "low" ? "low" : "medium",
      why: "Multiple upgrades may still fit if actual peak demand is low or flexible loads are managed.",
    });
  }

  options.push({
    title: "Full panel or service upgrade",
    cost: "$5,000–$15,000+",
    confidence: conditionConcern ? "medium" : "low",
    why: conditionConcern
      ? "May be justified if the panel is unsafe, damaged, obsolete, or parts are unavailable."
      : "Treat as last resort after spaces, tandems/quads, load sharing, subpanel, and measured load are checked.",
  });

  return { spacesNeeded, largestBreaker, spacesShort, conditionConcern, options };
}
