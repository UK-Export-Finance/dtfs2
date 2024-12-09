/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { SsoController } from '../controllers/sso.controller';
import { EntraIdService } from '../services/entra-id.service';
import { EntraIdApi } from '../third-party-apis/entra-id.api';
import { EntraIdConfig } from '../configs/entra-id.config';
import { UserService } from '../services/user.service';

export const ssoOpenRouter = express.Router();

const entraIdConfig = new EntraIdConfig();
const entraIdApi = new EntraIdApi({ entraIdConfig });
const entraIdService = new EntraIdService({ entraIdConfig, entraIdApi });
const userService = new UserService();
const ssoController = new SsoController({ entraIdService, userService });

ssoOpenRouter.route('/auth-code-url').get(ssoController.getAuthCodeUrl.bind(ssoController));
ssoOpenRouter.route('/handle-sso-redirect-form').post(ssoController.handleSsoRedirectForm.bind(ssoController));
