/* eslint-disable no-new */
/* eslint-disable no-undef */
if (typeof MOJFrontend.MultiFileUpload !== 'undefined') {
  new MOJFrontend.MultiFileUpload({
    container: $('.moj-multi-file-upload'),
    uploadUrl: `${window.location.href}/upload`,
    deleteUrl: `${window.location.href}/delete`,
  });
}
