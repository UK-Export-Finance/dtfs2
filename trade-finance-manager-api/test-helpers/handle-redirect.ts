import { anEntraIdUser } from '@ukef/dtfs2-common';
import { HandleRedirectResponse } from '../src/v1/services/entra-id.service';

export const aHandleRedirectResponse = (): HandleRedirectResponse => {
  return {
    entraIdUser: anEntraIdUser(),
    successRedirect: 'a-success-redirect-url',
  };
};
