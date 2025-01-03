import { PortalSessionUser, UtilisationReportStatus } from '@ukef/dtfs2-common';
import { PrimaryNavKey } from '../primary-nav-key';

export type PreviousReportNavItemViewModel = {
  text: string | number;
  href: string;
  attributes: Record<string, string>;
  active: boolean;
};

export type PreviousReportViewModel = {
  status: UtilisationReportStatus;
  displayStatus: string;
  month: string;
  linkText: string;
  downloadPath: string;
};

export type PreviousReportsViewModel = {
  year: string | number | undefined;
  user: PortalSessionUser;
  primaryNav: PrimaryNavKey;
  navItems: PreviousReportNavItemViewModel[];
  reports: PreviousReportViewModel[];
};
