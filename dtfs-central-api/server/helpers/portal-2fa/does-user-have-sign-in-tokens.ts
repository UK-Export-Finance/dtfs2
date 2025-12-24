import { PortalUser } from '@ukef/dtfs2-common';

/**
 * checks if user has sign in tokens array with at least one token
 * @param user - the poertal user object
 * @returns boolean indicating if user has sign in tokens
 */
export const doesUserHaveSignInTokens = (user: PortalUser): boolean => user.signInTokens !== undefined && user.signInTokens.length > 0;
