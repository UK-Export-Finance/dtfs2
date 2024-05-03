import { ProblemWithServiceViewModel } from './problem-with-service-view-model';
import { UtilisationReportReconciliationForReportViewModel } from './utilisation-report-reconciliation-for-report-view-model';

export type NunjucksTemplateName =
  | '_partials/problem-with-service.njk'
  | 'utilisation-reports/utilisation-report-reconciliation-for-report.njk';

export type NunjucksTemplateViewModel<View extends NunjucksTemplateName> =
  View extends '_partials/problem-with-service.njk'
    ? ProblemWithServiceViewModel
    : View extends 'utilisation-reports/utilisation-report-reconciliation-for-report.njk'
    ? UtilisationReportReconciliationForReportViewModel
    : object;
