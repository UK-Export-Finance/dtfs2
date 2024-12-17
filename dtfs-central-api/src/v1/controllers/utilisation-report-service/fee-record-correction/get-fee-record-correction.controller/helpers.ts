import { FeeRecordCorrectionEntity } from '@ukef/dtfs2-common';
import { GetFeeRecordCorrectionBody } from '.';
import { mapFeeRecordEntityToReportedFees } from '../../../../../mapping/fee-record-mapper';

/**
 * Maps a FeeRecordCorrectionEntity to a GetFeeRecordCorrectionBody response object.
 * @param feeRecordCorrectionEntity - The fee record correction entity to map.
 * @returns The mapped fee record correction response.
 */
// TODO FN-3668: Add unit tests
export const mapFeeRecordCorrectionEntityToResponse = (feeRecordCorrectionEntity: FeeRecordCorrectionEntity): GetFeeRecordCorrectionBody => {
  const { id, feeRecord: feeRecordEntity, reasons, additionalInfo } = feeRecordCorrectionEntity;
  const { facilityId, exporter } = feeRecordEntity;

  return {
    id,
    facilityId,
    exporter,
    reportedFees: mapFeeRecordEntityToReportedFees(feeRecordEntity),
    reasons,
    additionalInfo,
  };
};
