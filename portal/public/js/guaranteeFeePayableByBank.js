let DTFS_PORTAL;
!(function () {
  const e = document.getElementById('riskMarginFee');
  const n = document.getElementById('interestMarginFee');
  const t = document.getElementById('guaranteeFeePayableByBank');
  const a = e || n;
  a &&
    a.addEventListener('blur', function () {
      let e;
      (e = (0.9 * a.value).toLocaleString('en', { minimumFractionDigits: 4 })), (t.value = e);
    }),
    ((DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).guaranteeFeePayableByBank = {});
})();
// # sourceMappingURL=guaranteeFeePayableByBank.js.map
