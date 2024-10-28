import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getUserNonSsoRouter } from './user-non-sso';
import { getUserSsoRouter } from './user-sso';
import { GetRouter } from '../../../types/get-router';

export const getUserRouter: GetRouter = () => (isTfmSsoFeatureFlagEnabled() ? getUserSsoRouter() : getUserNonSsoRouter());
