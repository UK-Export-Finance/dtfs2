import { Request, Response } from 'express';
import orderBy from 'lodash/orderBy';
import { getFormattedReportPeriodWithLongMonth, FeeRecordStatus, CurrencyAndAmountString, getCurrencyAndAmountString } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';

type FeeRecordItem = UtilisationReportReconciliationDetailsResponseBody['feeRecords'][number];

type AmountWithDataSortValue = {
  amount: CurrencyAndAmountString | undefined;
  dataSortValue: number;
};

type FeeRecordViewModel = {
  facilityId: string;
  exporter: string;
  status: FeeRecordStatus;
  displayStatus: string;
  reportedFees: AmountWithDataSortValue;
  reportedPayments: AmountWithDataSortValue;
  totalReportedPayments: AmountWithDataSortValue;
  paymentsReceived: AmountWithDataSortValue;
  totalPaymentsReceived: AmountWithDataSortValue;
};

const feeRecordStatusToDisplayStatus: Record<FeeRecordStatus, string> = {
  TO_DO: 'TO DO',
};

const sortFeeRecordItemAmountProperty = <
  Property extends 'reportedFees' | 'reportedPayments' | 'totalReportedPayments' | 'paymentsReceived' | 'totalPaymentsReceived',
>(
  feeRecords: FeeRecordItem[],
  property: Property,
): AmountWithDataSortValue[] => {
  const unsortedList = feeRecords.map((feeRecord, index) => ({ ...feeRecord[property], index }));
  const sortedList = orderBy(unsortedList, ['currency', 'amount'], ['asc']);

  return feeRecords.map((feeRecord, feeRecordIndex) => {
    const feeRecordPropertyValue = feeRecord[property];
    return {
      amount: feeRecordPropertyValue ? getCurrencyAndAmountString(feeRecordPropertyValue) : undefined,
      dataSortValue: sortedList.findIndex(({ index }) => index === feeRecordIndex),
    };
  });
};

const mapFeeRecordItemsToFeeRecordViewModel = (feeRecords: FeeRecordItem[]): FeeRecordViewModel[] => {
  const sortedReportedFees = sortFeeRecordItemAmountProperty(feeRecords, 'reportedFees');
  const sortedReportedPayments = sortFeeRecordItemAmountProperty(feeRecords, 'reportedPayments');
  const sortedTotalReportedPayments = sortFeeRecordItemAmountProperty(feeRecords, 'totalReportedPayments');
  const sortedPaymentsReceived = sortFeeRecordItemAmountProperty(feeRecords, 'paymentsReceived');
  const sortedTotalPaymentsReceived = sortFeeRecordItemAmountProperty(feeRecords, 'totalPaymentsReceived');

  return feeRecords.map((feeRecord, feeRecordIndex) => ({
    facilityId: feeRecord.facilityId,
    exporter: feeRecord.exporter,
    status: feeRecord.status,
    displayStatus: feeRecordStatusToDisplayStatus[feeRecord.status],
    reportedFees: sortedReportedFees[feeRecordIndex],
    reportedPayments: sortedReportedPayments[feeRecordIndex],
    totalReportedPayments: sortedTotalReportedPayments[feeRecordIndex],
    paymentsReceived: sortedPaymentsReceived[feeRecordIndex],
    totalPaymentsReceived: sortedTotalPaymentsReceived[feeRecordIndex],
  }));
};

export const getUtilisationReportReconciliationByReportId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const utilisationReportReconciliationDetails = await api.getUtilisationReportReconciliationDetailsById(reportId, userToken);

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(utilisationReportReconciliationDetails.reportPeriod);

    const feeRecordViewModel = mapFeeRecordItemsToFeeRecordViewModel(utilisationReportReconciliation.feeRecords);

    return res.render('utilisation-reports/utilisation-report-reconciliation-for-report.njk', {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank: utilisationReportReconciliationDetails.bank,
      formattedReportPeriod,
      feeRecords: feeRecordViewModel,
    });
  } catch (error) {
    console.error(`Failed to render utilisation report with id ${reportId}`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
