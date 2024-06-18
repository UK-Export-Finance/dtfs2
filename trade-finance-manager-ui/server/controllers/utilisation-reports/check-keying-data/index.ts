import { Request, Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { FeeRecordPaymentGroup } from '../../../api-response-types';
import { asUserSession } from '../../../helpers/express-session';
import api from '../../../api';
import { CheckKeyingDataViewModel } from '../../../types/view-models';
import { mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems } from '../helpers';

const renderCheckKeyingDataPage = (res: Response, viewModel: CheckKeyingDataViewModel) => res.render('utilisation-reports/check-keying-data.njk', viewModel);

const getNumberOfFacilities = (feeRecordPaymentGroups: FeeRecordPaymentGroup[]): number =>
  feeRecordPaymentGroups.reduce((total, { feeRecords }) => feeRecords.length + total, 0);

export const postCheckKeyingData = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const { bank, reportPeriod, feeRecordPaymentGroups } = await api.getUtilisationReportReconciliationDetailsById(reportId, userToken);
    const matchingFeeRecordPaymentGroups = feeRecordPaymentGroups.filter(({ status }) => status === 'MATCH');

    const numberOfMatchingFacilities = getNumberOfFacilities(matchingFeeRecordPaymentGroups);

    if (numberOfMatchingFacilities === 0) {
      req.session.generateKeyingDataErrorKey = 'no-matching-fee-records';
      return res.redirect(`/utilisation-reports/${reportId}`);
    }

    const feeRecordPaymentGroupsViewModelItems = mapFeeRecordPaymentGroupsToFeeRecordPaymentGroupViewModelItems(matchingFeeRecordPaymentGroups);

    return renderCheckKeyingDataPage(res, {
      reportId,
      bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
      feeRecordPaymentGroups: feeRecordPaymentGroupsViewModelItems.map(({ feeRecords, paymentsReceived, status, displayStatus }) => ({
        feeRecords,
        paymentsReceived,
        status,
        displayStatus,
      })),
      numberOfMatchingFacilities,
    });
  } catch (error) {
    console.error('Failed to add payment', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
