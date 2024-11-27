import express from 'express';
import { SsoController } from '../controllers/sso.controller';
import { EntraIdService } from '../services/entra-id.service';
import { EntraIdApi } from '../third-party-apis/entra-id.api';
import { EntraIdConfig } from '../configs/entra-id.config';

export const ssoOpenRouter = express.Router();

const entraIdConfig = new EntraIdConfig();
const entraIdApi = new EntraIdApi({ entraIdConfig });
const entraIdService = new EntraIdService({ entraIdConfig, entraIdApi });
const ssoController = new SsoController({ entraIdService });

// eslint-disable-next-line @typescript-eslint/no-misused-promises
ssoOpenRouter.route('/sso/auth-code-url').get(ssoController.getAuthCodeUrl.bind(ssoController));
