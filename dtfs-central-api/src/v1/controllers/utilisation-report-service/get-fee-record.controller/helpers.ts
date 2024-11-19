import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { GetFeeRecordResponseBody } from '.';
import { NotFoundError } from '../../../../errors';
import { getBankNameById } from '../../../../repositories/banks-repo';

/**
 * Maps the supplied fee record entity to the get fee record response body
 * @param feeRecordEntity - The fee record entity
 * @returns The get fee record response body
 */
export const mapFeeRecordEntityToResponse = async (feeRecordEntity: FeeRecordEntity): Promise<GetFeeRecordResponseBody> => {
  const {
    id,
    report: { bankId, reportPeriod },
    facilityId,
    exporter,
  } = feeRecordEntity;

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  return {
    id,
    bank: {
      id: bankId,
      name: bankName,
    },
    reportPeriod,
    facilityId,
    exporter,
  };
};
