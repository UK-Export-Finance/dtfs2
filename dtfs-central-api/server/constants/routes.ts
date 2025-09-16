import { SWAGGER } from '@ukef/dtfs2-common';

export const ROUTES = {
  BANK_ROUTE: 'bank',
  PORTAL_ROUTE: 'portal',
  TFM_ROUTE: 'tfm',
  USER_ROUTE: 'user',
  UTILISATION_REPORTS_ROUTE: 'utilisation-reports',
  SWAGGER_ROUTE: SWAGGER.ENDPOINTS.UI,
} as const;
