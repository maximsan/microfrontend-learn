# Lab 13 · From tokens in localStorage to a BFF

**Book:** *Auth architecture*, *Sessions, CSRF and authorization*, and Path C in *Migration paths*  
**Time:** 60–90 minutes; the longest lab  
**You need:** Node 20+, and Chrome or Firefox for the browser parts. No `npm install`; everything is Node built-ins.

Three services run locally, each on its own origin:

| Port | Service | Notes |
| --- | --- | --- |
| 5120 | Authorization server | A tiny mock: Authorization Code + PKCE, refresh-token rotation, revocation. It auto-approves user *max*. |
| 5121 | Resource server (API) | The only place authorization is enforced. |
| 5122 | The app | Serves the browser code, and the BFF routes you will write. |

```sh
cd labs/13-bff-session
npm start                     # starter
npm run solution              # reference BFF
LAB_VARIANT=starter npm test  # your progress: 9 failing tests to turn green
npm test                      # the reference passes all 9
```

## 1 · See the problem

Start the starter and open <http://localhost:5122>.

1. **Sign in.** The browser runs the whole OAuth flow itself (RFC 10017 pattern 3) and stores both tokens in `localStorage`.
2. **Load orders.** The browser calls the API on port 5121 directly with `Authorization: Bearer …`.
3. **Run the injected script.** Both tokens appear in the red box. Any script on the origin can read them, including every team's code and every dependency. With the refresh token, an attacker can mint access tokens from anywhere, long after the tab is closed.
4. **Sign out**, then consider what happened: `localStorage.clear()`. The refresh token is still valid at the authorization server.

## 2 · Build the BFF, test first

Open `starter/bff.mjs`. It lists six requirements, taken from RFC 10017 §6.1 and the OWASP CSRF and Session Management cheat sheets, and stubs every route with `501`. Work through them with the tests:

```sh
LAB_VARIANT=starter npm test
```

Do it in the order *Migration paths* prescribes for Path C, so every step is safe to ship:

1. **One origin first.** The BFF routes live on the app's origin (5122), so a host-only cookie reaches them. You never need `Domain`.
2. **Stand the BFF up beside the old flow.** Implement `/bff/login` and `/bff/callback` as the confidential client `bff`. The browser flow still works; nothing has improved yet.
3. **Move the callers.** Implement `/bff/me` and `/bff/api/*`, then change `public/app.js` to call `/bff/api/orders` with a CSRF header instead of the API with a bearer token. Move **refresh** into the BFF in the same step, never alongside a browser refresh loop.
4. **Cut the browser off.** Delete the token handling from `public/app.js` and `callback.html`. Only now is the vulnerability closed.
5. **Logout and timeouts.** Revoke, destroy, expire, and run both idle and absolute timeouts.

<details>
<summary>Hint: why is there a second, <code>SameSite=Lax</code> cookie?</summary>

The RFC asks for `SameSite=Strict` on the **session** cookie. But the callback is a top-level navigation that arrives *from the authorization server*; in production that is another site, and a `Strict` cookie is not sent on it. So the short-lived cookie that carries the login `state` and PKCE verifier across the redirect is `Lax`, lives five minutes, and is deleted at the callback. The session cookie created *after* the callback is `Strict`, with a brand-new id: that is the session-fixation defence the tests check.
</details>

## 3 · Verify in the browser

Run the solution (or yours) and repeat part 1:

- **Run the injected script** now finds nothing: `localStorage` is empty and `document.cookie` is empty because the cookie is `HttpOnly`. But the box also shows `GET /bff/api/orders → 200`: script in your origin can still *drive* the session. This is the narrower protection that *When this guide is wrong* discusses. You have stopped token theft and replay elsewhere, not XSS.
- Open two tabs and **Sign out** in one. The other says *Signed out in another tab* (`BroadcastChannel`), instead of showing a signed-in UI over a dead session.

`__Host-` cookies require `Secure`. Chrome and Firefox treat `http://localhost` as a secure context for this; Safari may refuse the cookie. Use Chrome or Firefox, or put the app behind HTTPS.

## Check your understanding

- The logout test replays a cookie captured *before* logout. Why would a logout that only sends `Set-Cookie: …; Max-Age=0` fail it?
- The BFF rejects a state-changing request that has neither `Origin` nor `Referer`, as OWASP recommends. Why is blocking safer than letting it through to the CSRF-token check?
- Your estate grows to four micro-frontends on sibling subdomains. Why does `SameSite=Strict` on the session cookie no longer protect you from any of them?
