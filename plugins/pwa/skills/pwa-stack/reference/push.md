# Push, Badging, Background Sync

## Web Push in four parts

1. **VAPID keys** — generate once (`npx web-push generate-vapid-keys`). The public key goes to the client; the private key stays on the server, in a secret store.
2. **Subscribe** (from a user gesture, after explaining why):
   ```ts
   const reg = await navigator.serviceWorker.ready;    // an active worker, not just registered
   const permission = await Notification.requestPermission();
   if (permission !== 'granted') return;
   const sub = await reg.pushManager.subscribe({
     userVisibleOnly: true,
     applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
   });
   await saveSubscription(sub.toJSON());              // endpoint + keys, tied to the user
   ```
3. **Send** from the server with a Web Push library (signs with VAPID, encrypts the payload).
4. **Show** in the worker — every push must show a notification (`userVisibleOnly`):
   ```js
   self.addEventListener('push', (event) => {
     const data = safeParse(event.data);                // tolerate empty or non-JSON payloads
     event.waitUntil(self.registration.showNotification(data.title, {
       body: data.body, icon: '/icons/icon-192.png', tag: 'reminder', data: { url: data.url },
     }));
   });
   ```

## Server-side rules

- **Validate subscription endpoints before sending.** The endpoint is user-supplied: require `https:` and an allowlist of push services (`fcm.googleapis.com`, `*.push.services.mozilla.com`, `web.push.apple.com`, `*.notify.windows.com`, …), or the push sender becomes an SSRF proxy.
- On `404`/`410` from the push service, delete that subscription; on other errors, retry with backoff — don't delete.
- Cap subscriptions and scheduled pushes per user, and authenticate any cron/trigger endpoint with a secret compared in constant time.

## Clicks

```js
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = event.notification.data?.url ?? '/';
  const target = new URL(raw, self.location.origin);
  const url = target.origin === self.location.origin ? target.href : self.location.origin + '/';
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const win = wins.find((c) => 'focus' in c);
    if (win) { await win.navigate?.(url).catch(() => {}); return win.focus(); }
    return self.clients.openWindow(url);
  })());
});
```

Only navigate to same-origin URLs from a notification payload.

Handle `pushsubscriptionchange` (re-subscribe and tell the server) — subscriptions expire or rotate.

## Badging

`navigator.setAppBadge(n)` / `clearAppBadge()` from the page or the worker, wrapped in `try`/feature checks. Supported for installed apps on Chromium desktop and on iOS/iPadOS home-screen apps; not on Android Chrome (it shows a notification dot instead). Send the count in the push payload and set it in the `push` handler.

## Periodic Background Sync

`registration.periodicSync.register(tag, { minInterval })` — **Chromium only**, installed apps only, and the browser decides the actual interval from engagement. Treat it as a bonus: never the only way data refreshes or reminders fire.

## Platform notes

- **iOS/iPadOS 16.4+**: push works only for web apps added to the Home Screen, and the permission request must come from a user gesture inside the installed app. See ios-safari.md.
- Users can revoke permission at any time: check `Notification.permission` on launch and reconcile with the server.
