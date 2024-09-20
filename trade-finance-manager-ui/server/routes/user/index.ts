import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getUserSsoRouter } from './configs/userSso';
import { getUserNonSsoRouter } from './configs/userNonSso';

/**
 * As the implimentation for SSO vs standard login is so different, it is not possible to simply
 * have a shared interface between SSO and standard login.
 *
 * Therefore, we handle what routes are avaliable at the routes level.
 */

export const userRoutes = isTfmSsoFeatureFlagEnabled() ? getUserSsoRouter() : getUserNonSsoRouter();
