import { Request, Response } from 'express';
import { getFormattedCurrencyAndAmount, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { FeeRecordToKey } from '../../../api-response-types';
import { asUserSession } from '../../../helpers/express-session';
import api from '../../../api';
import { CheckKeyingDataViewModel, FeeRecordToKeyViewModelItem } from '../../../types/view-models';
import { getFeeRecordDisplayStatus, getKeyToCurrencyAndAmountSortValueMap } from '../helpers';
import { GENERATE_KEYING_DATA_ERROR_KEY } from '../../../constants/premium-payment-tab-error-keys';

const getFeeRecordsToKeyViewModel = (feeRecords: FeeRecordToKey[]): FeeRecordToKeyViewModelItem[] => {
  const reportedFeesDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(feeRecords.map(({ reportedFees }, index) => ({ ...reportedFees, key: index })));
  const reportedPaymentsDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    feeRecords.map(({ reportedPayments }, index) => ({ ...reportedPayments, key: index })),
  );

  return feeRecords.map((feeRecord, index) => ({
    id: feeRecord.id,
    facilityId: feeRecord.facilityId,
    exporter: feeRecord.exporter,
    reportedFees: {
      formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecord.reportedFees),
      dataSortValue: reportedFeesDataSortValueMap[index],
    },
    reportedPayments: {
      formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecord.reportedPayments),
      dataSortValue: reportedPaymentsDataSortValueMap[index],
    },
    paymentsReceived: feeRecord.paymentsReceived.map(getFormattedCurrencyAndAmount),
    status: feeRecord.status,
    displayStatus: getFeeRecordDisplayStatus(feeRecord.status),
  }));
};

export const postCheckKeyingData = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const { reportPeriod, bank, feeRecords } = await api.getUtilisationReportWithFeeRecordsToKey(reportId, userToken);

    const numberOfMatchingFacilities = feeRecords.length;

    if (numberOfMatchingFacilities === 0) {
      req.session.generateKeyingDataErrorKey = GENERATE_KEYING_DATA_ERROR_KEY.NO_MATCHING_FEE_RECORDS;
      return res.redirect(`/utilisation-reports/${reportId}`);
    }

    const feeRecordsToKeyViewModel = getFeeRecordsToKeyViewModel(feeRecords);

    const viewModel: CheckKeyingDataViewModel = {
      reportId,
      bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
      feeRecords: feeRecordsToKeyViewModel,
      numberOfMatchingFacilities,
    };

    return res.render('utilisation-reports/check-keying-data.njk', viewModel);
  } catch (error) {
    console.error('Failed to add payment: %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
