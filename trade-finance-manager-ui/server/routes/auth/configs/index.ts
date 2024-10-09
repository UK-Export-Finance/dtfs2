import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getUnauthenticatedAuthSsoRouter } from './unauthenticated-auth-sso';

export const getUnauthenticatedAuthRouter = () => (isTfmSsoFeatureFlagEnabled() ? getUnauthenticatedAuthSsoRouter() : undefined);
