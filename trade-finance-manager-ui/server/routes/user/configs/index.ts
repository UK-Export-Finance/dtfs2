import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { GetRouter } from '@tfm-ui/types/get-router';
import { getUserNonSsoRouter } from './user-non-sso';
import { getUserSsoRouter } from './user-sso';

export const getUserRouter: GetRouter = () => (isTfmSsoFeatureFlagEnabled() ? getUserSsoRouter() : getUserNonSsoRouter());
