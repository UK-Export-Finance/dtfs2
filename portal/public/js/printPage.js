let DTFS_PORTAL;
!(function () {
  const n = document.getElementById('bss-print-button');
  n &&
    n.addEventListener('click', function () {
      window.print();
    }),
    ((DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).printPage = {});
})();
// # sourceMappingURL=printPage.js.map
