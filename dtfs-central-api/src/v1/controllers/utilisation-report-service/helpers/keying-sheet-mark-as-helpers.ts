import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../../../errors';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

export const getUtilisationReportAndSelectedFeeRecordsForKeyingSheetDataMarkAs = async (
  reportId: number,
  selectedFeeRecordIds: number[],
): Promise<{ utilisationReport: UtilisationReportEntity; selectedFeeRecords: FeeRecordEntity[] }> => {
  const utilisationReport = await UtilisationReportRepo.findOne({
    where: { id: Number(reportId) },
    relations: {
      feeRecords: true,
    },
  });

  if (!utilisationReport) {
    throw new NotFoundError(`Could not find report with id ${reportId} and with fee records with ids ${selectedFeeRecordIds.join(', ')}`);
  }

  const selectedFeeRecords = utilisationReport.feeRecords.filter((report) => selectedFeeRecordIds.includes(report.id));
  if (selectedFeeRecords.length !== selectedFeeRecordIds.length) {
    throw new NotFoundError(`Could not find report with id ${reportId} and with fee records with ids ${selectedFeeRecordIds.join(', ')}`);
  }

  return { utilisationReport, selectedFeeRecords };
};
