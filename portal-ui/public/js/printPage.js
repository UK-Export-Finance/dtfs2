let DTFS_PORTAL;
!(function () {
  const t = document.getElementById('bss-print-button') || document.getElementById('gef-print-button');
  t &&
    t.addEventListener('click', function () {
      window.print();
    }),
    ((DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).printPage = {});
})();
// # sourceMappingURL=printPage.js.map
