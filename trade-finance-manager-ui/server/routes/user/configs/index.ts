import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getUserNonSsoRouter } from './userNonSso';
import { getUserSsoRouter } from './userSso';
import { getRouter } from '../../../types/get-router';

export const getUserRouter: getRouter = () => (isTfmSsoFeatureFlagEnabled() ? getUserSsoRouter() : getUserNonSsoRouter());
