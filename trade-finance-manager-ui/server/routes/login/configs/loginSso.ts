import express from 'express';
import { LoginController } from '../../../controllers/login/loginSso/login.controller';
import { getRouter } from '../../../types/get-router';
import { EntraIdService } from '../../../services/entra-id.service';
import { EntraIdConfig } from '../../../configs/entra-id.config';
import { EntraIdApi } from '../../../apis/entra-id.api';

export const getLoginSsoRouter: getRouter = () => {
  const entraIdConfig = new EntraIdConfig();
  const entraIdApi = new EntraIdApi({ entraIdConfig });
  const entraIdService = new EntraIdService({ entraIdConfig, entraIdApi });
  const loginController = new LoginController({ entraIdService });

  const loginSsoRouter = express.Router();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  loginSsoRouter.get('/', (res, req) => loginController.getLogin(res, req));

  return loginSsoRouter;
};
