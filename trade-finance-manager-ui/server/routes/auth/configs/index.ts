import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getUnauthenticatedAuthSsoRouter } from './unauthenticatedAuthSso';

export const getUnauthenticatedAuthRouter = () => (isTfmSsoFeatureFlagEnabled() ? getUnauthenticatedAuthSsoRouter() : undefined);
