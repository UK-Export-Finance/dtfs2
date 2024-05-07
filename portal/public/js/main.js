let DTFS_PORTAL;
!(function () {
  var e = {
    d(t, n) {
      for (const r in n) e.o(n, r) && !e.o(t, r) && Object.defineProperty(t, r, { enumerable: !0, get: n[r] });
    },
  };
  (e.g = (function () {
    if (typeof globalThis === 'object') return globalThis;
    try {
      return this || new Function('return this')();
    } catch (e) {
      if (typeof window === 'object') return window;
    }
  })()),
    (e.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (e.r = function (e) {
      typeof Symbol !== 'undefined' &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    }),
    (function () {
      let t;
      e.g.importScripts && (t = `${e.g.location}`);
      const n = e.g.document;
      if (!t && n && (n.currentScript && (t = n.currentScript.src), !t)) {
        const r = n.getElementsByTagName('script');
        if (r.length) for (let c = r.length - 1; c > -1 && (!t || !/^http(s?):/.test(t)); ) t = r[c--].src;
      }
      if (!t) throw new Error('Automatic publicPath is not supported in this browser');
      (t = t
        .replace(/#.*$/, '')
        .replace(/\?.*$/, '')
        .replace(/\/[^\/]+$/, '/')),
        (e.p = t);
    })();
  const t = {};
  e.r(t),
    e.d(t, {
      default() {
        return f;
      },
    });
  e.p;
  const n = function (e) {
    return document.getElementById(e);
  };
  const r = function (e, t) {
    const r = n(e);
    r.className = t ? '' : 'display-none';
  };
  const c = function (e, t) {
    const r = n(e);
    t ? r.removeAttribute('hidden') : r.setAttribute('hidden', !0);
  };
  function i(e) {
    const t = document.getElementById('additional-form-fields');
    t.className = e ? '' : 'govuk-visually-hidden';
  }
  let a = document.querySelector('[data-cy="currency-same-as-supply-contract-currency-yes"]');
  a &&
    a.addEventListener('click', function () {
      i(!1);
    }),
    (a = document.querySelector('[data-cy="currency-same-as-supply-contract-currency-no"]')) &&
      a.addEventListener('click', function () {
        i(!0);
      }),
    (a = document.querySelector('[data-cy="autoCreatePassword-true"]')) &&
      document.querySelector('[data-cy="autoCreatePassword-true"]').addEventListener('click', function () {
        r('manuallyCreatePassword', !1);
      }),
    (a = document.querySelector('[data-cy="autoCreatePassword-false"]')) &&
      a.addEventListener('click', function () {
        r('manuallyCreatePassword', !0);
      }),
    (a = document.querySelector('[data-cy="supplyContractCurrency"]')) &&
      a.addEventListener('change', function (e) {
        r('supply-contract-currency-conversion-fields', e.target.value !== 'GBP');
      }),
    (a = document.querySelector('[data-id="criteria-11-true')) &&
      a.addEventListener('click', function () {
        c('criterion-group-additional-11', !1);
      }),
    (a = document.querySelector('[data-id="criteria-11-false"]')) &&
      a.addEventListener('click', function () {
        c('criterion-group-additional-11', !0);
      }),
    (a = document.querySelector('[data-cy="legallyDistinct-true"]')) &&
      a.addEventListener('click', function () {
        r('additional-form-fields-indemnifier', !0);
      }),
    (a = document.querySelector('[data-cy="legallyDistinct-false"]')) &&
      a.addEventListener('click', function () {
        r('additional-form-fields-indemnifier', !1);
      }),
    (a = document.querySelector('[data-cy="indemnifierCorrespondenceAddressDifferent-true"]')) &&
      a.addEventListener('click', function () {
        r('additional-form-fields-indemnifier-correspondence-address', !0);
      }),
    (a = document.querySelector('[data-cy="indemnifierCorrespondenceAddressDifferent-false"]')) &&
      a.addEventListener('click', function () {
        r('additional-form-fields-indemnifier-correspondence-address', !1);
      }),
    (a = document.querySelector('[data-cy="supplier-correspondence-address-is-different-true"]')) &&
      a.addEventListener('click', function () {
        r('additional-form-fields-supplier-correspondence', !0);
      }),
    (a = document.querySelector('[data-cy="supplier-correspondence-address-is-different-false"]')) &&
      a.addEventListener('click', function () {
        r('additional-form-fields-supplier-correspondence', !1);
      });
  const o = document.querySelectorAll("input[type='file'][data-tag='govuk-file-upload']");
  o &&
    o.forEach(function (e) {
      e.addEventListener('change', function (e) {
        const t = e.target;
        const n = t.id.concat('-file-upload-button-container');
        r(n, Boolean(t.value));
      });
    });
  const d = function (e, t) {
    const n = document.createElement('option');
    (n.value = t.value), (n.textContent = t.name), t.code === t.selectedValue && (n.selected = !0), e.appendChild(n);
  };
  const u = function (e, t, n) {
    if (e) {
      const r = e.target.value;
      const c = document.getElementById('industry-class');
      const i = (function (e, t) {
        return e.find(function (e) {
          return e.code === t;
        }).classes;
      })(t, r);
      (c.innerHTML = ''),
        d(c, { value: '', name: 'Select value' }),
        i.forEach(function (e) {
          d(c, { value: e.code, name: e.name, selectedValue: n });
        }),
        (c.selectedIndex = '0');
    }
  };
  const l = document.querySelector('#industry-sector');
  if (l) {
    const s = l.getAttribute('data-industry-sectors');
    l.addEventListener('change', function (e) {
      u(e, JSON.parse(s));
    });
  }
  var f = {
    showHideElement: c,
    changeScreenVisibilityOfElement: r,
    isNumeric(e) {
      return !(typeof e !== 'number' || e !== Number(e) || !Number.isFinite(e));
    },
    decimalsCount(e) {
      const t = e.toString().split('.')[1];
      return t ? t.length : 0;
    },
    roundNumber(e, t) {
      let n = e;
      let r = t;
      return t || (r = 2), (n *= 10 ** r), (n = Math.round(n)), (n /= 10 ** r);
    },
    changeIndustryClasses: u,
  };
  (DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).main = t;
})();
// # sourceMappingURL=main.js.map
