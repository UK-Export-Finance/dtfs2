import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { GetFeeRecordDetailsResponseBody } from '.';

/**
 * Maps the supplied fee record entity to the fee record details
 * @param feeRecord - The fee record entity
 * @returns The fee record details
 */
export const mapToFeeRecordDetails = (feeRecord: FeeRecordEntity): GetFeeRecordDetailsResponseBody => {
  const { id, facilityId, exporter } = feeRecord;

  return { id, facilityId, exporter };
};
