import { Request, Response } from 'express';
import { getFormattedReportPeriodWithLongMonth, FeeRecordStatus, CurrencyAndAmountString, getCurrencyAndAmountString } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';

type FeeRecordItem = UtilisationReportReconciliationDetailsResponseBody['feeRecords'][number];

type FeeRecordViewModel = {
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmountString;
  reportedPayments: CurrencyAndAmountString;
  totalReportedPayments: CurrencyAndAmountString;
  paymentsReceived: CurrencyAndAmountString | undefined;
  totalPaymentsReceived: CurrencyAndAmountString | undefined;
  status: FeeRecordStatus;
  displayStatus: string;
};

const feeRecordStatusToDisplayStatus: Record<FeeRecordStatus, string> = {
  TO_DO: 'TO DO',
};

const mapFeeRecordItemToFeeRecordViewModel = (feeRecord: FeeRecordItem): FeeRecordViewModel => ({
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFees: getCurrencyAndAmountString(feeRecord.reportedFees),
  reportedPayments: getCurrencyAndAmountString(feeRecord.reportedPayments),
  totalReportedPayments: getCurrencyAndAmountString(feeRecord.totalReportedPayments),
  paymentsReceived: feeRecord.paymentsReceived ? getCurrencyAndAmountString(feeRecord.paymentsReceived) : undefined,
  totalPaymentsReceived: feeRecord.totalPaymentsReceived ? getCurrencyAndAmountString(feeRecord.totalPaymentsReceived) : undefined,
  status: feeRecord.status,
  displayStatus: feeRecordStatusToDisplayStatus[feeRecord.status],
});

export const getUtilisationReportReconciliationByReportId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const utilisationReportReconciliationDetails = await api.getUtilisationReportReconciliationDetailsById(reportId, userToken);

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(utilisationReportReconciliationDetails.reportPeriod);

    const feeRecordViewModel = utilisationReportReconciliation.feeRecords.map(mapFeeRecordItemToFeeRecordViewModel);

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
