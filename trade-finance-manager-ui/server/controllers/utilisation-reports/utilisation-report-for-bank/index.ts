import { Request, Response } from 'express';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';

// Disabling typescript lint before actual implementation
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */

// const getReportIdAndBank = async (bankId: string, submissionMonth: string, userToken: string) => {
const getReportIdAndBank = (bankId: string, submissionMonth: string) => {
  // const utilisationReport = await api.getUtilisationReportByBankIdAndSubmissionMonth(bankId, submissionMonth, userToken);
  const utilisationReport = api.getUtilisationReportByBankIdAndSubmissionMonth(bankId, submissionMonth);
  if (!utilisationReport) {
    throw new Error(`No report found for bank with id ${bankId} in submission month '${submissionMonth}'`);
  }
  return {
    bank: utilisationReport.bank,
    reportId: utilisationReport._id,
    reportPeriod: utilisationReport.reportPeriod,
  };
};

export const getUtilisationReportByBankId = async (req: Request, res: Response) => {
  const { userToken, user } = asUserSession(req.session);
  const { bankId, submissionMonth } = req.params;

  try {
    // New flow
    // - get report for given submission month and bank, throw error if not
    // - get bank object and report id from report (gets all needed information)
    // -
    // const { bank, reportId } = await getReportIdAndBank(bankId, submissionMonth, userToken);
    const { bank, reportId, reportPeriod } = getReportIdAndBank(bankId, submissionMonth);
    const formattedReportPeriod = `${submissionMonth}`;

    return res.render('utilisation-reports/utilisation-report-for-bank.njk', {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank,
      formattedReportPeriod,
    });
  } catch (error) {
    console.error(`Error rendering utilisation reports for bank with id ${bankId} in submission month ${submissionMonth}:`, error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
