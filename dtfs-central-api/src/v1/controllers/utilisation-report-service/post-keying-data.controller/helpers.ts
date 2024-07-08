import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

export type GenerateKeyingDataDetails = {
  feeRecord: FeeRecordEntity;
  generateKeyingData: boolean;
}[];

const getFeeRecordFacilityIdsWhichCannotBeKeyed = async (): Promise<Set<string>> => {
  const feeRecordsWhichCannotBeKeyed = await FeeRecordRepo.findByStatuses(['TO_DO', 'DOES_NOT_MATCH']);
  return feeRecordsWhichCannotBeKeyed.reduce((facilityIds, { facilityId }) => facilityIds.add(facilityId), new Set<string>());
};

/**
 * Gets the generate keying data details
 * @param feeRecordsWhichCanBeKeyed - The fee records which can be keyed
 * @returns The generate keying data details
 */
export const getGenerateKeyingDataDetails = async (feeRecordsWhichCanBeKeyed: FeeRecordEntity[]): Promise<GenerateKeyingDataDetails> => {
  const facilityIdsWhichCannotBeKeyed = await getFeeRecordFacilityIdsWhichCannotBeKeyed();
  const facilityIdsWhichHaveBeenProcessed = new Set<string>();
  return feeRecordsWhichCanBeKeyed.map((feeRecord) => {
    const { facilityId } = feeRecord;
    if (facilityIdsWhichHaveBeenProcessed.has(facilityId)) {
      return { feeRecord, generateKeyingData: false };
    }

    facilityIdsWhichHaveBeenProcessed.add(facilityId);
    return {
      feeRecord,
      generateKeyingData: !facilityIdsWhichCannotBeKeyed.has(facilityId),
    };
  });
};
