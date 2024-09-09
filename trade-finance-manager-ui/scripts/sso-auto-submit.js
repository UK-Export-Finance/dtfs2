/**
 * safeReferrer
 * Verify referrer, allow empty referrer for localhost.
 * 1) If host is localhost then referrer will be missing, no need to check it
 * 2) Return error message if referrer is missing or it is not from SSO authority
 * @param {string} hostname website domain
 * @param {string} referrer from where user is comming from
 * @returns {boolean} True if form should auto submit.
 */
export const isSafeReferrer = (hostname, referrer) => {
  // TFM UI - SSO support to work around SameSite=Strict
  const ssoAuthority = document.querySelector('script[data-sso-authority]').getAttribute('data-sso-authority');

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

/**
 * submitSsoFormIfSafe
 * Submit SSO form if referrer is safe and the SSO form exists.
 * @returns {void}
 */
export const submitSsoFormIfSafe = () => {
  const ssoForm = document.getElementById('acceptExternalSsoPostForm');

  if (ssoForm && isSafeReferrer(window.location.hostname, document.referrer)) {
    ssoForm.submit();
  }
};

submitSsoFormIfSafe();
