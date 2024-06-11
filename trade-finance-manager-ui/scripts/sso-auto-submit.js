// TFM UI - SSO support to work around SameSite=Strict
const ssoForm = document.getElementById('acceptExternalSsoPostForm');
const ssoAuthority = document.querySelector('script[data-sso-authority]').getAttribute('data-sso-authority');

/**
 * safeReferrer
 * Verify referrer, allow empty referrer for localhost.
 * 1) If host is localhost then referrer will be missing, no need to check it
 * 2) Return error message if referrer is missing or it is not from SSO authority
 * @param {string} hostname: website domain
 * @param {string} referrer: from where user is comming from
 * @returns {Boolean} True if form should auto submit.
 */
const safeReferrer = (hostname, referrer) => {
  // Referer can be empty on localhost, because of policy no-referrer-when-downgrade.
  if (hostname === 'localhost') {
    return true;
  }

  if (referrer.indexOf(ssoAuthority) === 0) {
    return true;
  }

  console.error('sso auto submit - referrer check failed because referrer is %s', referrer);
  return false;
};

if (ssoForm && safeReferrer(window.location.hostname, document.referrer)) {
  ssoForm.submit();
}
