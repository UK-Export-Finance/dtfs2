import { FeeRecordCorrectionEntity } from '@ukef/dtfs2-common';
import { GetFeeRecordCorrectionResponseBody } from '.';
import { mapFeeRecordEntityToReportedFees } from '../../../../../mapping/fee-record-mapper';

/**
 * Maps a FeeRecordCorrectionEntity to a GetFeeRecordCorrectionResponseBody
 * response object.
 * @param feeRecordCorrectionEntity - The fee record correction entity to map.
 * @returns The mapped fee record correction response.
 */
export const mapFeeRecordCorrectionEntityToResponse = (feeRecordCorrectionEntity: FeeRecordCorrectionEntity): GetFeeRecordCorrectionResponseBody => {
  const { id, feeRecord: feeRecordEntity, reasons, additionalInfo } = feeRecordCorrectionEntity;
  const { facilityId, exporter, report } = feeRecordEntity;
  const { bankId } = report;

  return {
    id,
    bankId,
    facilityId,
    exporter,
    reportedFees: mapFeeRecordEntityToReportedFees(feeRecordEntity),
    reasons,
    additionalInfo,
  };
};
