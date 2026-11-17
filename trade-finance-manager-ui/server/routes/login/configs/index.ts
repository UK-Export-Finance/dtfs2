import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { Router } from 'express';
import { GetRouter } from '@tfm-ui/types/get-router';
import { getLoginSsoRouter } from './login-sso';
import { getLoginNonSsoRouter } from './login-non-sso';
import { getUnauthenticatedLoginSsoRouter } from './unauthenticated-login-sso';

export const getLoginRouter: GetRouter = () => (isTfmSsoFeatureFlagEnabled() ? getLoginSsoRouter() : getLoginNonSsoRouter());

export const getUnauthenticatedLoginRouter: () => Router | undefined = () => (isTfmSsoFeatureFlagEnabled() ? getUnauthenticatedLoginSsoRouter() : undefined);
