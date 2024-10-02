import { ValuesOf } from './types-helper';
import { MonthAndYear } from './date';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, UTILISATION_REPORT_HEADERS, FEE_RECORD_STATUS } from '../constants';
import { Currency } from './currency';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  reportId: number;
};

type UtilisationReportHeader = ValuesOf<typeof UTILISATION_REPORT_HEADERS>;

export type UtilisationReportRawCsvData = {
  [HeaderKey in UtilisationReportHeader]: HeaderKey extends `${string}currency` ? Currency : string;
};

export type FeeRecordStatus = ValuesOf<typeof FEE_RECORD_STATUS>;

export type UploadedByUserDetails = {
  id: string;
  firstname: string;
  surname: string;
};

export type UtilisationReportCsvCellData = { value: string | null; column?: string; row?: string | number };

export type UtilisationReportCsvRowData = Record<string, UtilisationReportCsvCellData>;

export type UtilisationReportDataValidationError = {
  errorMessage: string;
  column?: string | null;
  row?: number | string | null;
  value?: string | null;
  exporter?: string | null;
};

export type PremiumPaymentsFilters = {
  facilityId?: string;
};

export type PaymentDetailsFilters = {
  facilityId?: string;
  paymentCurrency?: string;
  paymentReference?: string;
};

// TODO FN-2311: When PR 3573 (backend) is merged, pull the same type out from `dtfs-central-api/src/types/utilisation-reports.ts` and use this version.
export type ValidatedPaymentDetailsFilters = {
  facilityId?: string;
  paymentCurrency?: Currency;
  paymentReference?: string;
};

export type UtilisationReportFacilityData = {
  baseCurrency: string;
  facilityUtilisation: string;
};
