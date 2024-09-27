import express from 'express';
import { LoginController } from '../../../controllers/login/loginSso/login.controller';
import { getRouter } from '../../../types/get-router';
import { EntraIdService } from '../../../services/entra-id.service';
import { EntraIdConfig } from '../../../configs/entra-id.config';

const entraIdConfig = new EntraIdConfig();
const entraIdService = new EntraIdService(entraIdConfig);
const loginController = new LoginController(entraIdService);

export const getLoginSsoRouter: getRouter = () => {
  const loginSsoRouter = express.Router();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  loginSsoRouter.get('/', (res, req) => loginController.getLogin(res, req));

  return loginSsoRouter;
};
