var DTFS_TFM;
!(function () {
  var e,
    t,
    o = document.getElementById('acceptExternalSsoPostForm'),
    r = document.querySelector('script[data-sso-authority]').getAttribute('data-sso-authority');
  o &&
    ((e = window.location.hostname),
    (t = document.referrer),
    'localhost' === e || 0 === t.indexOf(r) || (console.error('sso auto submit - referrer check failed because referrer is %s', t), 0)) &&
    o.submit(),
    ((DTFS_TFM = void 0 === DTFS_TFM ? {} : DTFS_TFM).ssoAutoSubmit = {});
})();
//# sourceMappingURL=ssoAutoSubmit.js.map
