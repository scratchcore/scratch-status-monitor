// // Admin endpoints
// RootPage.get("/admin/cache", (c) => {
//   const now = Date.now();
//   const age = cached.ts ? Math.floor((now - cached.ts) / 1000) : null;
//   return c.json({
//     cacheMinutes,
//     lastUpdated: cached.ts || null,
//     ageSeconds: age,
//   });
// });

// RootPage.post("/admin/cache", async (c) => {
//   try {
//     const body = await c.req.json();
//     const m = Number(body.minutes);
//     if (!Number.isFinite(m) || m < 0)
//       return c.json(
//         createBadRequestError({
//           title: "Invalid minutes",
//         }),
//         400
//       );
//     cacheMinutes = Math.floor(m);
//     return c.json({ ok: true, cacheMinutes });
//   } catch (e) {
//     return c.json(
//       createBadRequestError({
//         title: "Invalid body",
//       }),
//       400
//     );
//   }
// });
