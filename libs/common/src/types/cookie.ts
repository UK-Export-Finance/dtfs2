/**
 * Specifies the SameSite attribute value for cookies.
 *
 * When set to `'strict'`, cookies are only sent in a first-party context and not with requests initiated by third party websites.
 * This helps mitigate the risk of cross-site request forgery (CSRF) attacks.
 */
export const COOKIE_SAME_SITE = 'strict' as const;
