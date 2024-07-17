import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../../../errors';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

export const getSelectedFeeRecordsAndUtilisationReportForKeyingDataMarkAs = async (
  reportId: number,
  selectedFeeRecordIds: number[],
): Promise<{ selectedFeeRecords: FeeRecordEntity[]; utilisationReport: UtilisationReportEntity }> => {
  const selectedFeeRecords = await FeeRecordRepo.findByIdAndReportIdWithReport(selectedFeeRecordIds, reportId);

  if (selectedFeeRecords.length !== selectedFeeRecordIds.length) {
    throw new NotFoundError(`Could not find report with id ${reportId} and with fee records with ids ${selectedFeeRecordIds.join(', ')}`);
  }

  const utilisationReport = selectedFeeRecords[0]?.report;

  if (!utilisationReport) {
    throw new NotFoundError(`Could not find report with id ${reportId} and with fee records with ids ${selectedFeeRecordIds.join(', ')}`);
  }

  return { selectedFeeRecords, utilisationReport };
};
