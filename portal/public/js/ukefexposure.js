let DTFS_PORTAL;
!(function () {
  const e = {
    r(e) {
      typeof Symbol !== 'undefined' &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    },
  };
  const t = {};
  e.r(t);
  const n = document.getElementById('facilityValue');
  const r = document.getElementById('coveredPercentage');
  const o = document.getElementById('ukefExposure');
  function u() {
    let e;
    const t = n.value.replace(/,/g, '') * (r.value / 100);
    if (
      (function (e) {
        return !(typeof e !== 'number' || e !== Number(e) || !Number.isFinite(e));
      })(t)
    ) {
      let u;
      u =
        ((e = t.toString().split('.')[1]) ? e.length : 0) > 2
          ? (function (e, t) {
              let n = e;
              let r = t;
              return t || (r = 2), (n *= 10 ** r), (n = Math.round(n)), n / 10 ** r;
            })(t, 2)
          : t;
      const i = u.toLocaleString('en', { minimumFractionDigits: 2 });
      o.value = i;
    }
  }
  n &&
    r &&
    [n, r].forEach(function (e) {
      e.addEventListener('blur', function () {
        u();
      });
    }),
    ((DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).ukefexposure = t);
})();
// # sourceMappingURL=ukefexposure.js.map
