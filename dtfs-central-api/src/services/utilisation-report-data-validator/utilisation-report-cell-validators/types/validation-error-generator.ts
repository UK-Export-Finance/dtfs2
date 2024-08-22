import { UtilisationReportDataValidationError, UtilisationReportCsvCellData, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';

export type UtilisationReportCellValidationErrorGenerator = (
  cellData: UtilisationReportCsvCellData | undefined,
  exporterName?: string | null,
) => UtilisationReportDataValidationError | null;

export type UtilisationReportRowValidationErrorGenerator = (rowData: UtilisationReportCsvRowData) => UtilisationReportDataValidationError | null;
