let DTFS_TFM;
(() => {
  const t = (() => {
    const t = document.querySelectorAll('form');
    if (!t.length) return null;
    const e = t[t.length - 1];
    return e || null;
  })();
  if (!t) return;
  let e = null;
  let n = null;
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
    let r;
    ((t) => {
      t instanceof HTMLElement && (t.setAttribute('disabled', ''), t.setAttribute('aria-disabled', 'true'));
    })(i);
    const u = ((t) => {
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
    (e = i), (n = u);
  });
})(),
  ((DTFS_TFM = void 0 === DTFS_TFM ? {} : DTFS_TFM).disableFormSubmitOnSubmission = {});
// # sourceMappingURL=disableFormSubmitOnSubmission.js.map
