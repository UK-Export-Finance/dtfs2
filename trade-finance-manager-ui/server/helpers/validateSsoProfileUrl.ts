export const DEFAULT_MS_SSO_PROFILE_URL = 'https://myaccount.microsoft.com/';

export const ALLOWED_SSO_PROFILE_HOSTNAMES: readonly string[] = ['myaccount.microsoft.com'];

/**
 * Validates a configured MS SSO profile URL before it is exposed to the view layer.
 *
 * Nunjucks HTML-escaping does not neutralise dangerous URL schemes such as `javascript:`,
 * so the value is parsed and required to use the `https:` scheme, target a hostname on an
 * allowlist, and carry no `user:pass@` userinfo (which can be used to disguise the true
 * destination). Any invalid or unexpected value falls back to a safe default. Surrounding
 * whitespace (e.g. a trailing newline in an env var) is trimmed before parsing.
 */
export const validateSsoProfileUrl = (value: string | undefined): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return DEFAULT_MS_SSO_PROFILE_URL;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:') {
      return DEFAULT_MS_SSO_PROFILE_URL;
    }

    if (!ALLOWED_SSO_PROFILE_HOSTNAMES.includes(parsed.hostname)) {
      return DEFAULT_MS_SSO_PROFILE_URL;
    }

    if (parsed.username !== '' || parsed.password !== '') {
      return DEFAULT_MS_SSO_PROFILE_URL;
    }

    return parsed.toString();
  } catch {
    return DEFAULT_MS_SSO_PROFILE_URL;
  }
};
