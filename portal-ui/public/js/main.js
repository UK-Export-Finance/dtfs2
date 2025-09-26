let DTFS_PORTAL;
!(function () {
  const e = {
    230(e, t, n) {
      const r =
        (this && this.__createBinding) ||
        (Object.create
          ? function (e, t, n, r) {
              void 0 === r && (r = n);
              let i = Object.getOwnPropertyDescriptor(t, n);
              (i && !('get' in i ? !t.__esModule : i.writable || i.configurable)) ||
                (i = {
                  enumerable: !0,
                  get() {
                    return t[n];
                  },
                }),
                Object.defineProperty(e, r, i);
            }
          : function (e, t, n, r) {
              void 0 === r && (r = n), (e[r] = t[n]);
            });
      const i =
        (this && this.__exportStar) ||
        function (e, t) {
          for (const n in e) n === 'default' || Object.prototype.hasOwnProperty.call(t, n) || r(t, e, n);
        };
      Object.defineProperty(t, '__esModule', { value: !0 }), i(n(682), t);
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
  function n(r) {
    const i = t[r];
    if (void 0 !== i) return i.exports;
    const o = (t[r] = { exports: {} });
    return e[r].call(o.exports, o, o.exports, n), o.exports;
  }
  (n.d = function (e, t) {
    for (const r in t) n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
  }),
    (n.g = (function () {
      if (typeof globalThis === 'object') return globalThis;
      try {
        return this || new Function('return this')();
      } catch (e) {
        if (typeof window === 'object') return window;
      }
    })()),
    (n.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (n.r = function (e) {
      typeof Symbol !== 'undefined' && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    }),
    (function () {
      let e;
      n.g.importScripts && (e = `${n.g.location}`);
      const t = n.g.document;
      if (!e && t && (t.currentScript && t.currentScript.tagName.toUpperCase() === 'SCRIPT' && (e = t.currentScript.src), !e)) {
        const r = t.getElementsByTagName('script');
        if (r.length) for (let i = r.length - 1; i > -1 && (!e || !/^http(s?):/.test(e)); ) e = r[i--].src;
      }
      if (!e) throw new Error('Automatic publicPath is not supported in this browser');
      (e = e
        .replace(/^blob:/, '')
        .replace(/#.*$/, '')
        .replace(/\?.*$/, '')
        .replace(/\/[^\/]+$/, '/')),
        (n.p = e);
    })();
  const r = {};
  n.r(r),
    n.d(r, {
      default() {
        return m;
      },
    });
  const i = n(230);
  const o = function (e) {
    return document.getElementById(e);
  };
  const c = function (e, t) {
    const n = o(e);
    n.className = t ? '' : 'display-none';
  };
  const a = function (e, t) {
    const n = o(e);
    t ? n.removeAttribute('hidden') : n.setAttribute('hidden', !0);
  };
  function d(e) {
    const t = document.getElementById('additional-form-fields');
    t.className = e ? '' : 'govuk-visually-hidden';
  }
  let u = document.querySelector('[data-cy="currency-same-as-supply-contract-currency-yes"]');
  u &&
    u.addEventListener('click', function () {
      d(!1);
    }),
    (u = document.querySelector('[data-cy="currency-same-as-supply-contract-currency-no"]')) &&
      u.addEventListener('click', function () {
        d(!0);
      }),
    (u = document.querySelector('[data-cy="autoCreatePassword-true"]')) &&
      document.querySelector('[data-cy="autoCreatePassword-true"]').addEventListener('click', function () {
        c('manuallyCreatePassword', !1);
      }),
    (u = document.querySelector('[data-cy="autoCreatePassword-false"]')) &&
      u.addEventListener('click', function () {
        c('manuallyCreatePassword', !0);
      }),
    (u = document.querySelector('[data-cy="supplyContractCurrency"]')) &&
      u.addEventListener('change', function (e) {
        c('supply-contract-currency-conversion-fields', e.target.value !== 'GBP');
      }),
    (u = document.querySelector('[data-id="criteria-11-true')) &&
      u.addEventListener('click', function () {
        a('criterion-group-additional-11', !1);
      }),
    (u = document.querySelector('[data-id="criteria-11-false"]')) &&
      u.addEventListener('click', function () {
        a('criterion-group-additional-11', !0);
      }),
    (u = document.querySelector('[data-cy="legallyDistinct-true"]')) &&
      u.addEventListener('click', function () {
        c('additional-form-fields-indemnifier', !0);
      }),
    (u = document.querySelector('[data-cy="legallyDistinct-false"]')) &&
      u.addEventListener('click', function () {
        c('additional-form-fields-indemnifier', !1);
      }),
    (u = document.querySelector('[data-cy="indemnifierCorrespondenceAddressDifferent-true"]')) &&
      u.addEventListener('click', function () {
        c('additional-form-fields-indemnifier-correspondence-address', !0);
      }),
    (u = document.querySelector('[data-cy="indemnifierCorrespondenceAddressDifferent-false"]')) &&
      u.addEventListener('click', function () {
        c('additional-form-fields-indemnifier-correspondence-address', !1);
      }),
    (u = document.querySelector('[data-cy="supplier-correspondence-address-is-different-true"]')) &&
      u.addEventListener('click', function () {
        c('additional-form-fields-supplier-correspondence', !0);
      }),
    (u = document.querySelector('[data-cy="supplier-correspondence-address-is-different-false"]')) &&
      u.addEventListener('click', function () {
        c('additional-form-fields-supplier-correspondence', !1);
      });
  const l = document.querySelectorAll("input[type='file'][data-tag='govuk-file-upload']");
  l &&
    l.forEach(function (e) {
      e.addEventListener('change', function (e) {
        const t = e.target;
        const n = t.id.concat('-file-upload-button-container');
        c(n, Boolean(t.value));
      });
    });
  const s = function (e, t) {
    const n = document.createElement('option');
    (n.value = t.value), (n.textContent = t.name), t.code === t.selectedValue && (n.selected = !0), e.appendChild(n);
  };
  const f = function (e, t, n) {
    if (e) {
      const r = e.target.value;
      const i = document.getElementById('industry-class');
      const o = (function (e, t) {
        return e.find(function (e) {
          return e.code === t;
        }).classes;
      })(t, r);
      (i.innerHTML = ''),
        s(i, { value: '', name: 'Select value' }),
        o.forEach(function (e) {
          s(i, { value: e.code, name: e.name, selectedValue: n });
        }),
        (i.selectedIndex = '0');
    }
  };
  const p = document.querySelector('#industry-sector');
  if (p) {
    const y = p.getAttribute('data-industry-sectors');
    p.addEventListener('change', function (e) {
      f(e, JSON.parse(y));
    });
  }
  n.p;
  var m = {
    showHideElement: a,
    changeScreenVisibilityOfElement: c,
    isNumeric(e) {
      return !(typeof e !== 'number' || e !== Number(e) || !Number.isFinite(e));
    },
    decimalsCount: i.decimalsCount,
    roundNumber(e, t) {
      let n = e;
      let r = t;
      return t || (r = 2), (n *= 10 ** r), (n = Math.round(n)), (n /= 10 ** r);
    },
    changeIndustryClasses: f,
  };
  (DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).main = r;
})();
// # sourceMappingURL=main.js.map
