# Self-hosting LearnLift (future path)

The published Claude artifact is the recommended way to run LearnLift — it's free to operate and needs no infrastructure. Use this guide only when you've outgrown it (custom domain, analytics, no Claude login for users).

## The rule that matters

**Never put your Anthropic API key in frontend code or in this repository.** On a public repo or website, anyone can extract it and spend your credits. The key must live server-side, behind a proxy you control.

## Architecture

```
Browser (LearnLift UI)  ──►  Your proxy (holds API key)  ──►  api.anthropic.com
```

## 1. Example proxy — Cloudflare Worker (free tier)

```js
// worker.js
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors() });
    }

    const body = await request.json();

    // Only allow what LearnLift actually needs
    const safeBody = {
      model: "claude-sonnet-4-6",
      max_tokens: Math.min(body.max_tokens ?? 1000, 1024),
      temperature: 0.3,
      messages: body.messages,
    };

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,   // set via `wrangler secret put`
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(safeBody),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors(), "Content-Type": "application/json" },
    });
  },
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "https://YOUR-SITE.example",  // lock to your domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
```

Deploy with [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npm create cloudflare@latest learnlift-proxy
# paste worker.js, then:
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

## 2. Frontend change

In `src/LearnLift.jsx`, change the endpoint inside `generateBatch`:

```diff
- const response = await fetch("https://api.anthropic.com/v1/messages", {
+ const response = await fetch("https://learnlift-proxy.YOUR-SUBDOMAIN.workers.dev", {
```

Everything else stays the same — the proxy accepts the identical request body.

## 3. Wrap it in a Vite app for GitHub Pages

```bash
npm create vite@latest learnlift-web -- --template react
cd learnlift-web
npm install mammoth
# copy src/LearnLift.jsx into src/ and render it from App.jsx
npm run build
```

Deploy the `dist/` folder with GitHub Pages (or Vercel/Netlify, which are simpler for SPAs).

## 4. Protect your wallet — required, not optional

Once the proxy is public, strangers can generate quizzes on your API key. Before sharing the URL:

- **Set a hard spend limit** on your Anthropic account (Console → Billing).
- **Rate-limit the Worker** (e.g., Cloudflare rate-limiting rules per IP, or a KV-based counter).
- **Restrict CORS** to your exact domain (already shown above).
- **Cap `max_tokens` server-side** (already shown above) so clients can't inflate costs.
- Consider requiring a simple access code for private classroom use.

## Cost reality check

A 30-question run = ~6 API calls, each re-sending the document. A busy classroom can generate hundreds of calls per day — on your key, that's your bill. This is exactly why the Claude artifact model (each user's generation counts against their own plan) is the better default for a free study tool.
