import { Request, Response } from 'express';
import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { parseReportPeriod } from '../../../../utils/report-period';
import { mapUtilisationReportEntityToGetUtilisationReportResponse } from '../../../../mapping/mapUtilisationReport';
// import { mapReportToSummaryItem } from '../helper';
// import { getBankById } from '../../../../repositories/banks-repo';
// import { NotFoundError } from '../../../../errors';

export type GetUtilisationReportsByBankIdAndOptionsRequest = CustomExpressRequest<{
  params: {
    bankId: string;
  };
  query: {
    reportPeriod?: Request['query'];
    excludeNotReceived?: 'true' | 'false';
  };
}>;

/**
 * Gets utilisation reports from the database filtered by
 * bank id and optionally filtered by the report period and
 * status.
 * @param req - The request object
 * @param res - The response object
 */
export const getUtilisationReportsByBankIdAndOptions = async (req: GetUtilisationReportsByBankIdAndOptionsRequest, res: Response) => {
  try {
    const { bankId } = req.params;
    const { reportPeriod, excludeNotReceived } = req.query;

    const parsedReportPeriod = parseReportPeriod(reportPeriod);

    const utilisationReports: UtilisationReportEntity[] = await UtilisationReportRepo.findAllByBankId(bankId, {
      reportPeriod: parsedReportPeriod,
      excludeNotReceived: excludeNotReceived === 'true',
    });
    const mappedUtilisationReports = await Promise.all(utilisationReports.map(mapUtilisationReportEntityToGetUtilisationReportResponse));
    return res.status(200).send(mappedUtilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports:', error);
    return res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};

// export type GetUtilisationReportsByBankIdAndYearRequest = CustomExpressRequest<{
//   params: {
//     bankId: string;
//     year: string;
//   };
// }>;

// /**
//  * Gets utilisation reports from the database filtered by
//  * bank id, year and status
//  * @param req - The request object
//  * @param res - The response object
//  */
// export const getUtilisationReportSummariesByBankIdAndYear = async (req: GetUtilisationReportsByBankIdAndYearRequest, res: Response) => {
//   try {
//     const { bankId, year } = req.params;

//     const bank = await getBankById(bankId);
//     if (!bank) {
//       throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
//     }

//     const utilisationReports: UtilisationReportEntity[] = await UtilisationReportRepo.findSubmittedReportsForBankIdWithReportPeriodEndInYear(
//       bankId,
//       Number(year),
//     );

//     const mappedUtilisationReports = utilisationReports.map((utilisationReport) => mapReportToSummaryItem(bank, utilisationReport));

//     const utilisationReportsSummary = {
//       bankName: bank.name,
//       year,
//       reports: mappedUtilisationReports,
//     };
//     return res.status(200).send(utilisationReportsSummary);
//   } catch (error) {
//     console.error('Unable to get utilisation report summaries:', error);
//     return res.status(500).send({ status: 500, message: 'Failed to get utilisation report summaries' });
//   }
// };
