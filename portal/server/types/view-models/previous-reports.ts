import { UtilisationReportStatus } from '@ukef/dtfs2-common';
import { BaseViewModel } from './base-view-model';

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

export type PreviousReportsViewModel = BaseViewModel & {
  year: string | number | undefined;
  navItems: PreviousReportNavItemViewModel[];
  reports: PreviousReportViewModel[];
};
