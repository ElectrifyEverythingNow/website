# Panel Checker — Deployment Notes

Live route: `/panel-checker`
API route: `POST /api/analyze-panel` (Cloudflare Pages Function)

## Required secret

The vision API call lives in `functions/api/analyze-panel.ts` and reads the
OpenAI key from the Cloudflare Pages environment. The key is **never** sent to
the browser.

Set the secret via Wrangler:

```bash
# Production
npx wrangler pages secret put OPENAI_API_KEY

# (Optional) override the default model
npx wrangler pages secret put OPENAI_VISION_MODEL
```

You'll be prompted to paste the secret value. Wrangler will ask which Pages
project to attach it to — pick this site.

If you also run a Preview environment in Cloudflare, repeat with
`--env preview` (Wrangler v3+: `npx wrangler pages secret put OPENAI_API_KEY`,
then choose the preview environment when prompted).

Default model when `OPENAI_VISION_MODEL` is unset: `gpt-4o-mini`.

## Local development

`next dev` does **not** run Cloudflare Pages Functions. To test the analyze
endpoint locally:

```bash
npm install --legacy-peer-deps
npx wrangler pages dev -- npm run dev
```

Set `OPENAI_API_KEY` in `.dev.vars` (gitignored — see `.gitignore`) for local
runs:

```bash
echo "OPENAI_API_KEY=sk-..." > .dev.vars
```

Never commit `.dev.vars` or any file containing the key.

## Temporary password gate

`/panel-checker` is gated behind a client-side test password (`timber`). It is
stored in `sessionStorage` after a correct entry and only used to keep the
private-testing UI hidden — it does **not** protect the API key, which lives
server-side.

**TODO before public launch:** remove `PasswordGate` from
`src/app/panel-checker/page.tsx` and delete
`src/components/panel-checker/PasswordGate.tsx`.

## Notes

- Maximum upload size enforced server-side: 12 MB.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`.
- The Pages Function does not store uploaded images.
- Recommendation logic is deterministic and runs server-side after the model
  returns its facts. The model is asked only to extract visible facts.
