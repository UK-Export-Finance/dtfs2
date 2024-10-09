import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getLoginSsoRouter } from './login-sso';
import { getLoginNonSsoRouter } from './login-non-sso';
import { GetRouter } from '../../../types/get-router';

export const getLoginRouter: GetRouter = () => (isTfmSsoFeatureFlagEnabled() ? getLoginSsoRouter() : getLoginNonSsoRouter());
