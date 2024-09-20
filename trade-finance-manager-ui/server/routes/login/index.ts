import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getLoginSsoRouter } from './configs/loginSso';
import { getLoginNonSsoRouter } from './configs/loginNonSso';

/**
 * As the implimentation for SSO vs standard login is so different, it is not possible to simply
 * have a shared interface between SSO and standard login.
 *
 * Therefore, we handle what routes are avaliable at the routes level.
 */

export const loginRoutes = isTfmSsoFeatureFlagEnabled() ? getLoginSsoRouter() : getLoginNonSsoRouter();
