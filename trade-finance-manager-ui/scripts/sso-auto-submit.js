// TFM UI - SSO support to work around SameSite=Strict
const ssoForm = document.getElementById('acceptExternalSsoPostForm');

// Referer can be empty on localhost, because of policy no-referrer-when-downgrade.
const { referrer } = document;
const { hostname } = window.location;
if (ssoForm
  && (hostname === 'localhost' || referrer.indexOf('https://login.microsoftonline.com') === 0)) {
  ssoForm.submit();
}
