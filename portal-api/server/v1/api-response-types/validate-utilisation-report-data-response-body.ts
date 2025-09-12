import { UtilisationReportDataValidationError } from '@ukef/dtfs2-common';

export type ValidateUtilisationReportDataResponseBody = {
  csvValidationErrors: UtilisationReportDataValidationError[];
};
