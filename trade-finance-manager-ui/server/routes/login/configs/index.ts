import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getLoginSsoRouter } from './loginSso';
import { getLoginNonSsoRouter } from './loginNonSso';
import { getRouter } from '../../../types/get-router';

export const getLoginRouter: getRouter = () => (isTfmSsoFeatureFlagEnabled() ? getLoginSsoRouter() : getLoginNonSsoRouter());
