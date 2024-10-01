import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getUserNonSsoRouter } from './userNonSso';
import { getUserSsoRouter } from './userSso';
import { GetRouter } from '../../../types/get-router';

export const getUserRouter: GetRouter = () => (isTfmSsoFeatureFlagEnabled() ? getUserSsoRouter() : getUserNonSsoRouter());
