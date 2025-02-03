import { Prettify, ValuesOf } from './types-helper';
import { MonthAndYear } from './date';
import { UTILISATION_REPORT_STATUS, UTILISATION_REPORT_HEADERS, FEE_RECORD_STATUS } from '../constants';
import { Currency } from './currency';

export type UtilisationReportStatus = ValuesOf<typeof UTILISATION_REPORT_STATUS>;

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};

type UtilisationReportHeader = ValuesOf<typeof UTILISATION_REPORT_HEADERS>;

type OptionalUtilisationReportHeader = Extract<
  UtilisationReportHeader,
  'payment currency' | 'accrual currency' | 'accrual exchange rate' | 'payment exchange rate'
>;

type RequiredUtilisationReportHeader = Exclude<UtilisationReportHeader, OptionalUtilisationReportHeader>;

type RequiredUtilisationReportRawCsvData = {
  [HeaderKey in RequiredUtilisationReportHeader]: HeaderKey extends `${string}currency` ? Currency : string;
};

type OptionalUtilisationReportRawCsvData = {
  [HeaderKey in OptionalUtilisationReportHeader]?: (HeaderKey extends `${string}currency` ? Currency | '' : string) | null;
};

export type UtilisationReportRawCsvData = Prettify<RequiredUtilisationReportRawCsvData & OptionalUtilisationReportRawCsvData>;

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

export type ValidatedPaymentDetailsFilters = {
  facilityId?: string;
  paymentCurrency?: Currency;
  paymentReference?: string;
};

export type UtilisationReportFacilityData = {
  baseCurrency: string;
  facilityUtilisation: string;
};

export interface CalculateFixedFeeBaseParams {
  ukefShareOfUtilisation: number;
  interestPercentage: number;
  dayCountBasis: number;
}

export interface CalculateFixedFeeParams extends CalculateFixedFeeBaseParams {
  coverEndDate: Date;
  reportPeriod: ReportPeriod;
}

export interface CalculateFixedFeeUtilisationReportParams extends CalculateFixedFeeBaseParams {
  coverStartDate: Date;
  coverEndDate: Date;
}

export interface CalculateFixedFeeFromDaysRemainingParams extends CalculateFixedFeeBaseParams {
  numberOfDaysRemainingInCoverPeriod: number;
}
