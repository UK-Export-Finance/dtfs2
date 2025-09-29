/* eslint-disable no-new */
/* eslint-disable no-undef */
if (typeof MOJFrontend.MultiFileUpload !== 'undefined') {
  /**
   * Handles the deletion of a file in the multi-file upload component.
   * If an error occurs during deletion, displays an error message in the file list.
   * Otherwise, removes the entire file list from the DOM.
   *
   * @param {Object} mojFileUpload - The file upload component instance, expected to have a getErrorHtml method.
   * @param {Object} response - The response object containing the result of the delete operation.
   * @param {boolean} [response.error] - Indicates if there was an error during deletion.
   */
  const fileDeleteHook = (mojFileUpload, response) => {
    if (response.error) {
      const errorRow = `<div class="govuk-summary-list__row moj-multi-file-upload__row moj-multi-file-upload__error-row">
      <div class="govuk-summary-list__value moj-multi-file-upload__message">${mojFileUpload.getErrorHtml(response.error)}</div></div>`;

      document.querySelector('.moj-multi-file-upload__list').append(errorRow);
    } else {
      document.querySelectorAll('.moj-multi-file-upload__error-row').forEach((file) => file.remove());
    }
  };

  const container = document.querySelector('.moj-multi-file-upload');
  const csrf = document.querySelector("input[name='_csrf']")?.value;

  new MOJFrontend.MultiFileUpload({
    container,
    uploadUrl: `${window.location.href}/upload?_csrf=${csrf}`,
    deleteUrl: `${window.location.href}/delete?_csrf=${csrf}`,
    fileDeleteHook,
  });
}
