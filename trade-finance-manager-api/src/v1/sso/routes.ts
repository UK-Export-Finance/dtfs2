/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { GetAuthCodeUrlApiRequest, GetAuthCodeUrlApiResponse, isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { SsoController } from '../controllers/sso.controller';
import { EntraIdService } from '../services/entra-id.service';
import { EntraIdApi } from '../third-party-apis/entra-id.api';
import { EntraIdConfig } from '../configs/entra-id.config';
import { UserService } from '../services/user.service';
import { validateGetAuthCodePayloadUrl } from '../middleware/validate-get-auth-code-url-payload';

export const ssoOpenRouter = express.Router();

if (isTfmSsoFeatureFlagEnabled()) {
  const entraIdConfig = new EntraIdConfig();
  const entraIdApi = new EntraIdApi({ entraIdConfig });
  const entraIdService = new EntraIdService({ entraIdConfig, entraIdApi });
  const userService = new UserService();
  const ssoController = new SsoController({ entraIdService, userService });

  ssoOpenRouter
    .route('/auth-code-url')
    .all(validateGetAuthCodePayloadUrl)
    .get((req: GetAuthCodeUrlApiRequest, res: GetAuthCodeUrlApiResponse, next) => {
      ssoController.getAuthCodeUrl(req, res).catch(next);
    });

  ssoOpenRouter.route('/handle-sso-redirect-form').post((req, res) => ssoController.handleSsoRedirectForm(req, res));
}
