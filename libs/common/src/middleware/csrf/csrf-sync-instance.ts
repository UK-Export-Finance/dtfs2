import { Request } from 'express';
import { csrfSync, RequestMethod } from 'csrf-sync';
import { CSRF } from '../../constants';

const { CSRF_TOKEN_BODY_PROPERTY_NAME } = CSRF;

/**
 * Initialise a synchronised CSRF protection instance using the `csrf-sync` library.
 *
 * - The `ignoredMethods` option is set to allow safe HTTP methods (e.g., GET, HEAD, OPTIONS) to bypass CSRF verification.
 * - The `getTokenFromRequest` function extracts the CSRF token from either the request body or query parameters, supporting both standard form submissions and file uploads.
 *
 * The returned `generateToken` function can be used to create a new CSRF token for a session, while the `csrfSynchronisedProtection` function serves as middleware to verify incoming requests against the expected CSRF token.
 */
export const { generateToken, csrfSynchronisedProtection } = csrfSync({
  ignoredMethods: CSRF.VERIFY.SAFE.HTTP_METHODS as RequestMethod[],
  getTokenFromRequest: (req: Request) =>
    ((req.body as Record<string, unknown>)?.[CSRF_TOKEN_BODY_PROPERTY_NAME] as string | undefined) ??
    ((req.query as Record<string, unknown>)?.[CSRF_TOKEN_BODY_PROPERTY_NAME] as string | undefined),
});
