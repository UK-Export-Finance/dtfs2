let DTFS_PORTAL;
!(function () {
  const e = {
    230(e, t, n) {
      const r =
        (this && this.__createBinding) ||
        (Object.create
          ? function (e, t, n, r) {
              void 0 === r && (r = n);
              let o = Object.getOwnPropertyDescriptor(t, n);
              (o && !('get' in o ? !t.__esModule : o.writable || o.configurable)) ||
                (o = {
                  enumerable: !0,
                  get() {
                    return t[n];
                  },
                }),
                Object.defineProperty(e, r, o);
            }
          : function (e, t, n, r) {
              void 0 === r && (r = n), (e[r] = t[n]);
            });
      const o =
        (this && this.__exportStar) ||
        function (e, t) {
          for (const n in e) n === 'default' || Object.prototype.hasOwnProperty.call(t, n) || r(t, e, n);
        };
      Object.defineProperty(t, '__esModule', { value: !0 }), o(n(682), t);
    },
    682(e, t) {
      Object.defineProperty(t, '__esModule', { value: !0 }), (t.decimalsCount = void 0);
      t.decimalsCount = (e) => {
        let t;
        const n = e.toString().split('.')[1];
        return (t = n == null ? void 0 : n.length) !== null && void 0 !== t ? t : 0;
      };
    },
  };
  const t = {};
  const n = (function n(r) {
    const o = t[r];
    if (void 0 !== o) return o.exports;
    const i = (t[r] = { exports: {} });
    return e[r].call(i.exports, i, i.exports, n), i.exports;
  })(230);
  const r = document.getElementById('facilityValue');
  const o = document.getElementById('coveredPercentage');
  const i = document.getElementById('ukefExposure');
  function u() {
    const e = r.value.replace(/,/g, '') * (o.value / 100);
    if (
      (function (e) {
        return !(typeof e !== 'number' || e !== Number(e) || !Number.isFinite(e));
      })(e)
    ) {
      let t;
      t =
        (0, n.decimalsCount)(e) > 2
          ? (function (e, t) {
              let n = e;
              let r = t;
              return t || (r = 2), (n *= 10 ** r), (n = Math.round(n)), n / 10 ** r;
            })(e, 2)
          : e;
      const u = t.toLocaleString('en', { minimumFractionDigits: 2 });
      i.value = u;
    }
  }
  r &&
    o &&
    [r, o].forEach(function (e) {
      e.addEventListener('blur', function () {
        u();
      });
    }),
    ((DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).ukefexposure = {});
})();
// # sourceMappingURL=ukefexposure.js.map
