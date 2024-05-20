var DTFS_PORTAL;
!(function () {
  if (void 0 !== MOJFrontend.MultiFileUpload) {
    var o = $('#multi-file-upload').attr('data-csrf');
    new MOJFrontend.MultiFileUpload({
      container: $('.moj-multi-file-upload'),
      uploadUrl: ''.concat(window.location.href, '/upload?uploadCsrf=').concat(o),
      deleteUrl: ''.concat(window.location.href, '/delete?uploadCsrf=').concat(o),
      fileDeleteHook: function (o, l) {
        if (l.error) {
          var e =
            '<div class="govuk-summary-list__row moj-multi-file-upload__row moj-multi-file-upload__error-row"><div class="govuk-summary-list__value moj-multi-file-upload__message">'.concat(
              o.getErrorHtml(l.error),
              '</div></div>',
            );
          $('.moj-multi-file-upload__list').append(e);
        } else $('.moj-multi-file-upload__error-row').remove();
      },
    });
  }
  (DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).multiFileUpload = {};
})();
//# sourceMappingURL=multiFileUpload.js.map
