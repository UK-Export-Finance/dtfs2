import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getAuthSsoRouter } from './auth-sso';
import { getUnauthenticatedAuthSsoRouter } from './unauthenticated-auth-sso';

export const getAuthRouter = () => (isTfmSsoFeatureFlagEnabled() ? getAuthSsoRouter() : undefined);

export const getUnauthenticatedAuthRouter = () => (isTfmSsoFeatureFlagEnabled() ? getUnauthenticatedAuthSsoRouter() : undefined);
