import { PortalSessionUser, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';

export type PreviousReportNavItemViewModel = {
  text: string | number;
  href: string;
  attributes: Record<string, string>;
  active: boolean;
};

export type PreviousReportViewModel = {
  status: UtilisationReportReconciliationStatus;
  displayStatus: string;
  month: string;
  linkText: string;
  downloadPath: string;
};

export type PreviousReportsViewModel = {
  year: string | number | undefined;
  user: PortalSessionUser;
  primaryNav: string;
  navItems: PreviousReportNavItemViewModel[];
  reports: PreviousReportViewModel[];
};
