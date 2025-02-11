import express from 'express';
import { GetAuthCodeUrlApiRequest, GetAuthCodeUrlApiResponse } from '@ukef/dtfs2-common';
import { SsoController } from '../controllers/sso.controller';
import { EntraIdService } from '../services/entra-id.service';
import { EntraIdApi } from '../third-party-apis/entra-id.api';
import { EntraIdConfig } from '../configs/entra-id.config';

export const ssoOpenRouter = express.Router();

const entraIdConfig = new EntraIdConfig();
const entraIdApi = new EntraIdApi({ entraIdConfig });
const entraIdService = new EntraIdService({ entraIdConfig, entraIdApi });
const ssoController = new SsoController({ entraIdService });

ssoOpenRouter.route('/auth-code-url').get((req: GetAuthCodeUrlApiRequest, res: GetAuthCodeUrlApiResponse, next) => {
  ssoController.getAuthCodeUrl(req, res).catch(next);
});
