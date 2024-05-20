var DTFS_GEF;
!(function () {
  'use strict';
  var t = {};
  (t.g = (function () {
    if ('object' == typeof globalThis) return globalThis;
    try {
      return this || new Function('return this')();
    } catch (t) {
      if ('object' == typeof window) return window;
    }
  })()),
    (t.r = function (t) {
      'undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(t, '__esModule', { value: !0 });
    }),
    (function () {
      var r;
      t.g.importScripts && (r = t.g.location + '');
      var e = t.g.document;
      if (!r && e && (e.currentScript && (r = e.currentScript.src), !r)) {
        var i = e.getElementsByTagName('script');
        if (i.length) for (var o = i.length - 1; o > -1 && (!r || !/^http(s?):/.test(r)); ) r = i[o--].src;
      }
      if (!r) throw new Error('Automatic publicPath is not supported in this browser');
      (r = r
        .replace(/#.*$/, '')
        .replace(/\?.*$/, '')
        .replace(/\/[^\/]+$/, '/')),
        (t.p = r);
    })();
  var r = {};
  t.r(r);
  t.p;
  (DTFS_GEF = void 0 === DTFS_GEF ? {} : DTFS_GEF).main = r;
})();
//# sourceMappingURL=main.js.map
