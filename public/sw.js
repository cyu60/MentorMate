if (!self.define) {
  let e,
    s = {};
  const a = (a, n) => (
    (a = new URL(a + ".js", n).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, c) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[t]) return;
    let i = {};
    const r = (e) => a(e, t),
      o = { module: { uri: t }, exports: i, require: r };
    s[t] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (c(...e), i));
  };
}
define(["./workbox-4754cb34"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "0daba983d2400404d4107dd03d20025e",
        },
        {
          url: "/_next/static/baZAo98_Sc7jnvaO4dsy1/_buildManifest.js",
          revision: "3c1589246aa0e8fd5443fa927412256a",
        },
        {
          url: "/_next/static/baZAo98_Sc7jnvaO4dsy1/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/1017-e3ff2af437c3df67.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/1181-f6ec003211356e7e.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/1517-e4d87e25def72b5b.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/155-484aee4c95eea769.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/2315.70e4818caa07a3cb.js",
          revision: "70e4818caa07a3cb",
        },
        {
          url: "/_next/static/chunks/248-775c4f783e4f19cc.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/2600-74e4e7b106905e53.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/2762-90d413937c9f6b09.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/3030-fa366c371890643c.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/3184-1121711fbde037c7.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/38-30ae63eb02642fa9.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/4186-37e349e862c08ad3.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/4254-037ee576084d6830.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/4785-71974aa0d413f5a8.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/4959.12274a1f2ee22477.js",
          revision: "12274a1f2ee22477",
        },
        {
          url: "/_next/static/chunks/4bd1b696-37eed522ec64aa7f.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/5096.5d72acee45d5af48.js",
          revision: "5d72acee45d5af48",
        },
        {
          url: "/_next/static/chunks/5578.479951817be1429a.js",
          revision: "479951817be1429a",
        },
        {
          url: "/_next/static/chunks/5934-f1dcc07a3e76057c.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/5974-6cb5791da7c245ef.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/6149-d43f30725f7b5f1f.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/6735.dce668de27a428b7.js",
          revision: "dce668de27a428b7",
        },
        {
          url: "/_next/static/chunks/7737-e8129fc2bf8017d8.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/8565-b775544ec034b37a.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/9403-0d415505438d21fc.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/9442-8ba7dd6a25f0870a.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/9657-a54504ff5f37b541.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/(static)/about/page-6a3108312ca4ad87.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/(static)/privacy/page-d84e577d25ad686c.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/(static)/teams/page-c985414f75ab48ae.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/(static)/terms/page-0625f3ce6c6ca5f1.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/(users)/admin/page-74a6874d2de56419.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/(users)/mentor/login/page-a6f498fa3c879c2a.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/(users)/mentor/page-b6a7c92ee47ac9f9.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/(users)/mentor/scan/page-6a832169548cce02.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-a385178cf64b1165.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/api/email/route-7c2e50e7d26e5652.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/api/feedback/synthesize/route-26c4d7fec0c54070.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/auth/auth-code-error/page-7ed1e78b98679da8.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/auth/callback/route-f7686028053e7a9d.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/dashboard/page-024dabdd895a3b5a.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/feed/page-c7e38e21766b21d4.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/gallery/page-b7cc150ff9e2c064.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/layout-2767398eda744b71.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/overview/page-293526b63a22d823.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/participants/page-acfa0dd20671c050.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/submit/page-019559cc158b0bb3.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/tools/brainstormer/page-259cf0f75454d79e.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/tools/page-09295524fd502929.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/tools/website-builder/page-3142082c236c31bb.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/%5Bid%5D/tools/whiteboard/page-eb0f8c6cae1ad312.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/events/page-98e94d8c6229e2e9.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/feedback/given/page-3461a5ffbef3c20b.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/layout-ab0d46c251d7a964.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/login/page-e4a27284ff33cd9f.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/my-project-gallery/%5BprojectId%5D/dashboard/page-ef4dc9b9174c5f19.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/my-project-gallery/%5BprojectId%5D/feedback/page-76472e5f0bc41692.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/my-project-gallery/%5BprojectId%5D/layout-07db531312adf01a.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/my-project-gallery/%5BprojectId%5D/page-5ba19b291392e6dd.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/my-project-gallery/layout-b3c931b65e16bb6a.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/my-project-gallery/page-41f5a9f04bc2c0f1.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/page-e397743cb1159034.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/public-project-details/%5Bid%5D/page-f1fc4e8c5b23cf8c.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/app/select-role/page-14731ff712e2881b.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/framework-1ec85e83ffeb8a74.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/main-app-d888fe4ed643e987.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/main-b906496afc3969b5.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/pages/_app-5f03510007f8ee45.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/pages/_error-8efa4fbf3acc0458.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-9a41d41d627af13f.js",
          revision: "baZAo98_Sc7jnvaO4dsy1",
        },
        {
          url: "/_next/static/css/bdcf9ccdc4082eaa.css",
          revision: "bdcf9ccdc4082eaa",
        },
        {
          url: "/_next/static/media/26a46d62cd723877-s.woff2",
          revision: "befd9c0fdfa3d8a645d5f95717ed6420",
        },
        {
          url: "/_next/static/media/55c55f0601d81cf3-s.woff2",
          revision: "43828e14271c77b87e3ed582dbff9f74",
        },
        {
          url: "/_next/static/media/581909926a08bbc8-s.woff2",
          revision: "f0b86e7c24f455280b8df606b89af891",
        },
        {
          url: "/_next/static/media/6d93bde91c0c2823-s.woff2",
          revision: "621a07228c8ccbfd647918f1021b4868",
        },
        {
          url: "/_next/static/media/97e0cb1ae144a2a9-s.woff2",
          revision: "e360c61c5bd8d90639fd4503c829c2dc",
        },
        {
          url: "/_next/static/media/a34f9d1faa5f3315-s.p.woff2",
          revision: "d4fe31e6a2aebc06b8d6e558c9141119",
        },
        {
          url: "/_next/static/media/df0a9ae256c0569c-s.woff2",
          revision: "d54db44de5ccb18886ece2fda72bdfe0",
        },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/img/Chinat.png",
          revision: "d009c2a5132ce034119c421b061a7b44",
        },
        { url: "/img/Glenn.png", revision: "82375ab40e4368831477b5c9dcf31cd0" },
        {
          url: "/img/Kristen.png",
          revision: "f5b2efa047aba086a2adc37bd06cc659",
        },
        { url: "/img/Lia.png", revision: "d6217cc05f4e0140fffce187d95ff616" },
        {
          url: "/img/Matthew.png",
          revision: "44e2fb6270b9f7d2ce47681737c9d1d3",
        },
        {
          url: "/img/mentormate.png",
          revision: "2b21ea4b96ad8af3b7b54e15f72d5bfe",
        },
        { url: "/manifest.json", revision: "719c896a6c5f9c2630263a815f7ca05b" },
        {
          url: "/mentormate.png",
          revision: "2b21ea4b96ad8af3b7b54e15f72d5bfe",
        },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: n,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
