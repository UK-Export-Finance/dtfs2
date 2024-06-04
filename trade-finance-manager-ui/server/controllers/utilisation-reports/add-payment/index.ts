import { Response } from 'express';
import { SelectedFeeRecordDetails, SelectedFeeRecordsDetails, getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { AddPaymentViewModel, SelectedReportedFeeViewModel } from '../../../types/view-models';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import {
  getFeeRecordIdFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';

export type AddPaymentRequest = CustomExpressRequest<{
  reqBody: Record<PremiumPaymentsTableCheckboxId, 'on'>;
}>;

const renderAddPaymentPage = (res: Response, context: AddPaymentViewModel) => res.render('utilisation-reports/add-payment.njk', context);

const mapToSelectedReportedFeeViewModel = (feeRecord: SelectedFeeRecordDetails): SelectedReportedFeeViewModel => ({
  feeRecordId: feeRecord.id,
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFee: getFormattedCurrencyAndAmount(feeRecord.reportedFee),
  reportedPayments: getFormattedCurrencyAndAmount(feeRecord.reportedPayments),
});

const mapToAddPaymentViewModel = (data: SelectedFeeRecordsDetails): AddPaymentViewModel => ({
  bank: data.bank,
  formattedReportPeriod: getFormattedReportPeriodWithLongMonth(data.reportPeriod),
  reportedFeeDetails: {
    totalReportedPayments: getFormattedCurrencyAndAmount(data.totalReportedPayments),
    feeRecords: data.feeRecords.map((record) => mapToSelectedReportedFeeViewModel(record)),
  },
});

export const addPayment = async (req: AddPaymentRequest, res: Response) => {
  try {
    const { userToken } = asUserSession(req.session);
    const { reportId } = req.params;
    const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(req.body);
    const feeRecordIds = checkedCheckboxIds.map((checkboxId) => getFeeRecordIdFromPremiumPaymentsCheckboxId(checkboxId));

    const data = await api.getSelectedFeeRecordsDetails(Number(reportId), feeRecordIds, userToken);

    return renderAddPaymentPage(res, mapToAddPaymentViewModel(data));
  } catch (error) {
    console.error('Failed to add payment', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
