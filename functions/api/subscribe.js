// POST /api/subscribe
//
// Stores subscribers in the SUBSCRIBERS KV namespace and (optionally)
// forwards them to Resend if RESEND_API_KEY + RESEND_AUDIENCE_ID are set.
//
// Body: { email: string, source?: "homepage" | "panel-checker" | string }
//
// Stored value:
//   { email, source, subscribedAt, lastSeenAt, sources: string[] }
// - subscribedAt: ISO timestamp of FIRST submission (preserved across updates)
// - lastSeenAt:   ISO timestamp of MOST RECENT submission
// - sources:      every distinct source the email has come in from
// - source:       most recent source (kept for backwards compat)

const ALLOWED_SOURCES = new Set([
  "homepage",
  "panel-checker",
  "solar",
  "rates",
  "website", // legacy default
]);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function normalizeSource(raw) {
  if (typeof raw !== "string") return "website";
  const s = raw.trim().toLowerCase();
  if (!s) return "website";
  if (ALLOWED_SOURCES.has(s)) return s;
  // Accept any short alphanumeric tag for forward compat (avoid abuse).
  if (/^[a-z0-9-]{1,32}$/.test(s)) return s;
  return "website";
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const rawEmail = body && typeof body.email === "string" ? body.email : "";
  if (!rawEmail || !rawEmail.includes("@") || !rawEmail.includes(".")) {
    return jsonResponse({ error: "Invalid email" }, 400);
  }

  const email = rawEmail.trim().toLowerCase();
  const source = normalizeSource(body && body.source);
  const now = new Date().toISOString();

  // De-dupe: preserve subscribedAt; track all sources we've seen.
  let existing = null;
  try {
    const raw = await env.SUBSCRIBERS.get(email);
    if (raw) existing = JSON.parse(raw);
  } catch {
    // Treat as new on parse error
    existing = null;
  }

  const sources = new Set(
    (existing && Array.isArray(existing.sources) ? existing.sources : [])
      .filter((s) => typeof s === "string"),
  );
  if (existing && typeof existing.source === "string") sources.add(existing.source);
  sources.add(source);

  const record = {
    email,
    source, // most recent
    sources: Array.from(sources),
    subscribedAt: existing && existing.subscribedAt ? existing.subscribedAt : now,
    lastSeenAt: now,
  };

  try {
    await env.SUBSCRIBERS.put(email, JSON.stringify(record));
  } catch (err) {
    console.error("[subscribe] KV put failed:", err && err.message);
    return jsonResponse({ error: "Server error" }, 500);
  }

  // Best-effort forward to Resend. Failures don't break the user request.
  if (env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID) {
    try {
      await forwardToResend({
        apiKey: env.RESEND_API_KEY,
        audienceId: env.RESEND_AUDIENCE_ID,
        email,
      });
    } catch (err) {
      console.error("[subscribe] Resend forward failed:", err && err.message);
    }
  }

  return jsonResponse({
    success: true,
    isNew: !existing,
  });
}

async function forwardToResend({ apiKey, audienceId, email }) {
  const res = await fetch(
    `https://api.resend.com/audiences/${encodeURIComponent(audienceId)}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    },
  );

  // 200 on create, 422-ish on duplicate — both are fine. Throw for other 4xx/5xx.
  if (res.ok) return;
  const text = await res.text().catch(() => "");
  // Resend returns "already exists" / validation_error for dupes.
  if (/already|exists|duplicate/i.test(text)) return;
  if (res.status === 422) return;
  throw new Error(`Resend ${res.status}: ${text.slice(0, 200)}`);
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}
