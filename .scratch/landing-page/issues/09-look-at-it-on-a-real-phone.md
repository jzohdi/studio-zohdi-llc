# Look at it on a real phone

Type: task
Status: open
Blocked by: —

## Question

Watch the landing page's entrance and the landing → /work → landing round trip on an actual phone, and decide whether anything needs to give.

HITL — only Jake can do this; the agent cannot. Everything so far was judged in headless Chromium and the in-app browser at phone *dimensions*, which says nothing about a phone *GPU*. The specific things to watch for:

- The entrance blurs three large display-type elements for about a second (`filter: blur` on `.statement__beat`). On a low-power phone this is the one effect that could stutter.
- The pink-led page transition (two full-viewport sweeps of six panels each) immediately followed by the `/work` preview carousel starting.
- The wordmark tap target on `/work` — it's small text; is it comfortably tappable?

How to do it: run `pnpm dev --host` and open the Network URL on the phone, or deploy the branch to a Vercel preview. Try it once in light and once in dark.

The answer is one of: "fine, nothing to change"; or a short list of what stuttered and where, which becomes the next ticket. Either closes the map.
