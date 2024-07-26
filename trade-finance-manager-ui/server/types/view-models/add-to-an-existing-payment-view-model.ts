import { SelectedReportedFeesDetailsViewModel } from './selected-reported-fees-details-view-model';
import { BaseViewModel } from './base-view-model';

export type AddToAnExistingPaymentViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
};
