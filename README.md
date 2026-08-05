# Deploying PitchGrade live

This has two pieces:
- `api/propline.js` — a serverless function that holds your PropLine key and proxies requests
- `pitchgrade.jsx` — the frontend, which calls `/api/propline` instead of PropLine directly

## 1. Rotate your key first

Any key that's ever been pasted somewhere outside your own private
notes should be treated as exposed — regenerate a fresh one from your
PropLine dashboard before going live:
https://prop-line.com/dashboard

## 2. Deploy on Vercel

1. Go to https://vercel.com, sign in, click "Add New Project"
2. Import this GitHub repo
3. Before deploying, open **Environment Variables** and add:
   - Key: `PROPLINE_API_KEY`
   - Value: your new (rotated) PropLine key
4. Click Deploy

Vercel will give you a live URL like `https://pitchgrade.vercel.app`. The
frontend and the `/api/propline` function both run under that same domain,
so no extra CORS setup is needed.

## 3. Verify it's working

Visit `https://your-app.vercel.app/api/propline?path=/sports/baseball_mlb/events`
directly in your browser — you should get back JSON, not an error. If you
get a 500, double check the environment variable name matches exactly
(`PROPLINE_API_KEY`) and redeploy.

## 4. Custom domain (optional)

In the Vercel project → Settings → Domains, you can attach your own domain
whenever you're ready — free on every plan.

---

Notes:
- Free tier PropLine gives 1,000 requests/day. The proxy caches each response
  for 60 seconds, so with normal traffic you shouldn't come close to that.
- If you add more PropLine endpoints later (props, pitcher markets, etc.),
  add their paths to the `ALLOWED_PATHS` set in `api/propline.js` — the proxy
  rejects any path not explicitly listed, on purpose.
