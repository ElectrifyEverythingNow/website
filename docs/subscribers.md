# Subscribers — Storage & Forwarding

## Where submissions go

Both the homepage "Notify Me" form and the Panel Checker post-report email
capture POST to the same Pages Function: **`POST /api/subscribe`**
(`functions/api/subscribe.js`).

The function:

1. Validates the email and a small source tag.
2. Reads the existing record from the **`SUBSCRIBERS`** KV namespace (if any).
3. Writes a merged record:
   ```json
   {
     "email": "you@example.com",
     "source": "panel-checker",       // most recent submission
     "sources": ["homepage", "panel-checker"],
     "subscribedAt": "2026-04-29T18:01:00.000Z",  // FIRST seen
     "lastSeenAt":   "2026-04-30T22:14:00.000Z"   // most recent
   }
   ```
4. (Optional) Forwards the email to **Resend** as a contact in your audience,
   if `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` are configured. Failures here
   are logged but never break the user's request.

## Allowed `source` values

Anything matching `/^[a-z0-9-]{1,32}$/`. Known tags currently used:

- `homepage` — the main `/` "Notify Me" form
- `panel-checker` — post-report Email Capture on `/panel-checker`
- `website` — legacy default for any submission without a source

## Reading the list

`GET /api/subscribers?token=<ADMIN_TOKEN>` — requires `ADMIN_TOKEN` Pages secret.
Returns:

```json
{
  "count": 142,
  "subscribers": [
    { "email": "...", "source": "panel-checker", "sources": ["panel-checker"],
      "subscribedAt": "...", "lastSeenAt": "..." },
    ...
  ]
}
```

You can also browse the **`SUBSCRIBERS` KV namespace** directly in the
Cloudflare dashboard (Workers & Pages → KV → `SUBSCRIBERS`) and export.

## Resend forwarding (optional)

To pipe new submissions into a Resend audience so launch emails work without
exporting the KV manually:

1. Create or use an existing Resend audience at https://resend.com/audiences
   and copy its **Audience ID** (UUID).
2. Create a Resend API key with **Full access** to that audience at
   https://resend.com/api-keys.
3. Set both as Cloudflare Pages secrets (Production *and* Preview if you want
   the preview URLs to forward too):
   ```bash
   npx wrangler pages secret put RESEND_API_KEY
   npx wrangler pages secret put RESEND_AUDIENCE_ID
   ```
4. Trigger a redeploy of `main` (push any commit, or use the dashboard
   **Retry deployment** action).

The forwarder sends:

```http
POST https://api.resend.com/audiences/{audienceId}/contacts
Authorization: Bearer {api_key}
Content-Type: application/json

{ "email": "...", "unsubscribed": false }
```

Duplicate-contact errors (422 / "already exists") are silently ignored so
re-submissions don't surface as failures. Other 4xx/5xx responses are
logged to the Pages Function console.

## Notes

- Both `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` must be set; if either is
  missing the function still writes to KV and returns success — the forward
  is simply skipped.
- KV is the source of truth. Resend is an optional convenience target.
- To switch to a different ESP (Loops, Buttondown, ConvertKit, Mailchimp,
  etc.), replace the `forwardToResend` helper in
  `functions/api/subscribe.js` and rename the env vars accordingly. The KV
  schema doesn't need to change.
