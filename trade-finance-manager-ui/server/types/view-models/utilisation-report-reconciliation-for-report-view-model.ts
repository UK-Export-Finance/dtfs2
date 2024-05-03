import { SessionBank } from '@ukef/dtfs2-common';
import { PrimaryNavigationKey } from '../primary-navigation-key';
import { TfmSessionUser } from '../tfm-session-user';

export type UtilisationReportReconciliationForReportViewModel = {
  user: TfmSessionUser;
  activePrimaryNavigation: PrimaryNavigationKey;
  bank: SessionBank;
  formattedReportPeriod: string;
};
