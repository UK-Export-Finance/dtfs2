// TFM UI - SSO support to work around SameSite=Strict
const ssoForm = document.getElementById('acceptExternalSsoPostForm');

// TODO: add referer check
if (ssoForm) {
  ssoForm.submit();
}
