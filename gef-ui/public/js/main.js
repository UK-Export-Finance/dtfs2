let DTFS_GEF;
!(function () {
  const t = {};
  (t.g = (function () {
    if (typeof globalThis === 'object') return globalThis;
    try {
      return this || new Function('return this')();
    } catch (t) {
      if (typeof window === 'object') return window;
    }
  })()),
    (t.r = function (t) {
      typeof Symbol !== 'undefined' && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(t, '__esModule', { value: !0 });
    }),
    (function () {
      let r;
      t.g.importScripts && (r = `${t.g.location}`);
      const e = t.g.document;
      if (!r && e && (e.currentScript && (r = e.currentScript.src), !r)) {
        const i = e.getElementsByTagName('script');
        if (i.length) for (let o = i.length - 1; o > -1 && !r; ) r = i[o--].src;
      }
      if (!r) throw new Error('Automatic publicPath is not supported in this browser');
      (r = r
        .replace(/#.*$/, '')
        .replace(/\?.*$/, '')
        .replace(/\/[^\/]+$/, '/')),
        (t.p = r);
    })();
  const r = {};
  t.r(r);
  t.p;
  (DTFS_GEF = void 0 === DTFS_GEF ? {} : DTFS_GEF).main = r;
})();
// # sourceMappingURL=main.js.map
