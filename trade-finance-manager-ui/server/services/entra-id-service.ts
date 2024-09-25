import { ENTRA_ID_CONFIG } from '../configs/entra-id.config';

export const getLoginUrl = () => {
  return ENTRA_ID_CONFIG.REDIRECT_URL;
};
