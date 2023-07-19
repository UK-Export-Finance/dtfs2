/* eslint-disable no-new */
/* eslint-disable no-undef */
if (typeof MOJFrontend.MultiFileUpload !== 'undefined') {
  const onFileDelete = (mojFileUpload, response) => {
    if (response.error) {
      const errorRow = `<div class="govuk-summary-list__row moj-multi-file-upload__row moj-multi-file-upload__error-row"><div class="govuk-summary-list__value moj-multi-file-upload__message">${mojFileUpload.getErrorHtml(response.error)}</div></div>`;
      $('.moj-multi-file-upload__list').append(errorRow);
    } else {
      $('.moj-multi-file-upload__error-row').remove();
    }
  };

  const uploadCsrf = $('#multi-file-upload').attr('uploadCsrf');

  new MOJFrontend.MultiFileUpload({
    container: $('.moj-multi-file-upload'),
    uploadUrl: `${window.location.href}/upload?uploadCsrf=${uploadCsrf}`,
    deleteUrl: `${window.location.href}/delete?uploadCsrf=${uploadCsrf}`,
    fileDeleteHook: onFileDelete,
  });
}
