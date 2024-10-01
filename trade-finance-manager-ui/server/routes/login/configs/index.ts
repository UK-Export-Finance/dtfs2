import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getLoginSsoRouter } from './loginSso';
import { getLoginNonSsoRouter } from './loginNonSso';
import { GetRouter } from '../../../types/get-router';

export const getLoginRouter: GetRouter = () => (isTfmSsoFeatureFlagEnabled() ? getLoginSsoRouter() : getLoginNonSsoRouter());
