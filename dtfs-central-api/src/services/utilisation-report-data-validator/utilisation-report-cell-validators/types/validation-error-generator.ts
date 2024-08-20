import {
  UtilisationReportDataValidationError,
  UtilisationReportRawCsvCellDataWithLocation,
  UtilisationReportRawCsvRowDataWithLocations,
} from '@ukef/dtfs2-common';

export type UtilisationReportCellValidationErrorGenerator = (
  cellData: UtilisationReportRawCsvCellDataWithLocation | undefined,
  exporterName?: string | null,
) => UtilisationReportDataValidationError | null;

export type UtilisationReportRowValidationErrorGenerator = (
  rowData: UtilisationReportRawCsvRowDataWithLocations,
) => UtilisationReportDataValidationError | null;
