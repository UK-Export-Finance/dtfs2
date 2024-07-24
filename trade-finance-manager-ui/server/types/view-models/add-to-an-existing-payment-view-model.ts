import { SelectedReportedFeesDetailsViewModel } from './add-payment-view-model';
import { BaseViewModel } from './base-view-model';

export type AddToAnExistingPaymentViewModel = BaseViewModel & {
  reportId: string;
  bank: { name: string };
  formattedReportPeriod: string;
  reportedFeeDetails: SelectedReportedFeesDetailsViewModel;
};
