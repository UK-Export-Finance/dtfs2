import { PortalUser } from '@ukef/dtfs2-common';

export const doesUserHaveSignInTokens = (user: PortalUser): boolean => user.signInTokens !== undefined && user.signInTokens.length > 0;
