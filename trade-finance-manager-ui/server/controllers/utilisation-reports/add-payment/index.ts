import { Response } from 'express';
import { SelectedFeeRecordsDetails, getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { AddPaymentViewModel } from '../../../types/view-models';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import {
  getFeeRecordIdFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../helpers/premium-payments-table-checkbox-id-helper';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { getKeyToCurrencyAndAmountSortValueMap } from '../helpers';

export type AddPaymentRequest = CustomExpressRequest<{
  reqBody: Record<PremiumPaymentsTableCheckboxId, 'on'>;
}>;

const renderAddPaymentPage = (res: Response, context: AddPaymentViewModel) => res.render('utilisation-reports/add-payment.njk', context);

const mapToAddPaymentViewModel = (data: SelectedFeeRecordsDetails): AddPaymentViewModel => {
  const reportedFeeDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(data.feeRecords.map((record) => ({ ...record.reportedFee, key: record.id })));
  const reportedPaymentsDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    data.feeRecords.map((record) => ({ ...record.reportedPayments, key: record.id })),
  );
  return {
    bank: data.bank,
    formattedReportPeriod: getFormattedReportPeriodWithLongMonth(data.reportPeriod),
    reportedFeeDetails: {
      totalReportedPayments: getFormattedCurrencyAndAmount(data.totalReportedPayments),
      feeRecords: data.feeRecords.map((record) => ({
        feeRecordId: record.id,
        facilityId: record.facilityId,
        exporter: record.exporter,
        reportedFee: { value: getFormattedCurrencyAndAmount(record.reportedFee), dataSortValue: reportedFeeDataSortValueMap[record.id] },
        reportedPayments: { value: getFormattedCurrencyAndAmount(record.reportedPayments), dataSortValue: reportedPaymentsDataSortValueMap[record.id] },
      })),
    },
  };
};

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
