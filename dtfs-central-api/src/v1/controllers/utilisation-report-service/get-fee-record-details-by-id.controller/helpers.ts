import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { GetFeeRecordDetailsResponseBody } from '.';
import { NotFoundError } from '../../../../errors';
import { getBankNameById } from '../../../../repositories/banks-repo';

/**
 * Maps the supplied fee record entity to the fee record details
 * @param feeRecord - The fee record entity
 * @returns The fee record details
 */
export const mapToFeeRecordDetails = async (feeRecord: FeeRecordEntity): Promise<GetFeeRecordDetailsResponseBody> => {
  const {
    id,
    report: { bankId, reportPeriod },
    facilityId,
    exporter,
  } = feeRecord;

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
