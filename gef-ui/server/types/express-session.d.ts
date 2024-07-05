import { ReportPeriod } from '@ukef/dtfs2-common';
import { PortalSessionUser } from './portal-session-user';

export type UserSessionData = {
  userToken: string;
  loginStatus: 'Valid 2FA';
  user: PortalSessionUser;
  dashboardFilters?: unknown;
  utilisationReport?: {
    formattedReportPeriod: string;
    reportPeriod: ReportPeriod;
  };
};

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData extends UserSessionData {}
}
