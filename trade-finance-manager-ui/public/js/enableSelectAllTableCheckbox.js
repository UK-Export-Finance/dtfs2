var DTFS_TFM;
!(function () {
  var e = document.querySelector('table.govuk-table input[type="checkbox"]#select-all-checkbox'),
    c = document.querySelectorAll('table.govuk-table input[type="checkbox"]:not(#select-all-checkbox)'),
    t = function () {
      return Array.prototype.every.call(c, function (e) {
        return e.checked;
      });
    },
    n = function () {
      t()
        ? (e.checked = !0)
        : Array.prototype.some.call(c, function (e) {
            return !e.checked;
          }) && (e.checked = !1);
    };
  e &&
    (e.addEventListener('change', function (e) {
      e.target.checked
        ? c.forEach(function (e) {
            e.checked = !0;
          })
        : c.forEach(function (e) {
            e.checked = !1;
          });
    }),
    t() && (e.checked = !0),
    c.forEach(function (e) {
      e.addEventListener('change', function () {
        n();
      });
    })),
    ((DTFS_TFM = void 0 === DTFS_TFM ? {} : DTFS_TFM).enableSelectAllTableCheckbox = {});
})();
//# sourceMappingURL=enableSelectAllTableCheckbox.js.map
