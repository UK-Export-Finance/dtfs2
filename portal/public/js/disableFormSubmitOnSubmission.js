var DTFS_PORTAL;
(() => {
  const t = (() => {
    const t = document.querySelectorAll('form');
    return (t.length && t[t.length - 1]) || null;
  })();
  if (!t) return;
  let e = null,
    n = null;
  t.addEventListener('submit', (t) => {
    const { submitter: i } = t;
    if (!(i instanceof HTMLElement)) return;
    if (e) {
      if (i === e) return void t.preventDefault();
      (r = n) instanceof HTMLElement && r.remove(),
        ((t) => {
          t instanceof HTMLElement && (t.removeAttribute('disabled'), t.removeAttribute('aria-disabled'));
        })(e);
    }
    var r;
    ((t) => {
      t instanceof HTMLElement && (t.setAttribute('disabled', ''), t.setAttribute('aria-disabled', 'true'));
    })(i);
    const s = ((t) => {
      const e = document.createElement('input');
      return (
        e.setAttribute('id', 'resubmit-prevention-hidden-input'),
        e.setAttribute('type', 'hidden'),
        ['name', 'value'].forEach((n) => {
          const i = t.getAttribute(n);
          i && e.setAttribute(n, i);
        }),
        e.classList.add('js-hidden-input'),
        t.after(e),
        e
      );
    })(i);
    (e = i), (n = s);
  });
})(),
  ((DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).disableFormSubmitOnSubmission = {});
//# sourceMappingURL=disableFormSubmitOnSubmission.js.map
