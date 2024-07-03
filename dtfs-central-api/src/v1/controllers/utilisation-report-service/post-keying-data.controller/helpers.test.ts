import { when } from 'jest-when';
import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { getGenerateKeyingDataDetails } from './helpers';

describe('post-keying-data.controller helpers', () => {
  describe('getGenerateKeyingDataDetails', () => {
    const findByStatusesSpy = jest.spyOn(FeeRecordRepo, 'findByStatuses');

    const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

    const aFeeRecordWhichCanBeKeyed = (facilityId: string) =>
      FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('MATCH').withFacilityId(facilityId).build();

    const aToDoFeeRecord = (facilityId: string) =>
      FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('TO_DO').withFacilityId(facilityId).build();

    beforeEach(() => {
      findByStatusesSpy.mockRejectedValue(new Error('Some error'));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns each supplied fee record with isFacilityReadyToKey set to true when there are no facility ids which cannot be keyed', async () => {
      // Arrange
      const feeRecordEntitiesToKey = [aFeeRecordWhichCanBeKeyed('11111111'), aFeeRecordWhichCanBeKeyed('22222222'), aFeeRecordWhichCanBeKeyed('33333333')];

      when(findByStatusesSpy).calledWith(['TO_DO', 'DOES_NOT_MATCH']).mockResolvedValue([]);

      // Act
      const result = await getGenerateKeyingDataDetails(feeRecordEntitiesToKey);

      // Assert
      expect(result).toHaveLength(feeRecordEntitiesToKey.length);
      result.forEach(({ feeRecord, isFacilityReadyToKey }, index) => {
        expect(feeRecord).toEqual(feeRecordEntitiesToKey[index]);
        expect(isFacilityReadyToKey).toBe(true);
      });
    });

    it('returns each supplied fee record with isFacilityReadyToKey set to false when all the fee records have a facility id which cannot be keyed', async () => {
      // Arrange
      const facilityId = '41343453';

      const feeRecordEntitiesToKey = [aFeeRecordWhichCanBeKeyed(facilityId), aFeeRecordWhichCanBeKeyed(facilityId), aFeeRecordWhichCanBeKeyed(facilityId)];

      when(findByStatusesSpy)
        .calledWith(['TO_DO', 'DOES_NOT_MATCH'])
        .mockResolvedValue([aToDoFeeRecord(facilityId)]);

      // Act
      const result = await getGenerateKeyingDataDetails(feeRecordEntitiesToKey);

      // Assert
      expect(result).toHaveLength(feeRecordEntitiesToKey.length);
      result.forEach(({ feeRecord, isFacilityReadyToKey }, index) => {
        expect(feeRecord).toEqual(feeRecordEntitiesToKey[index]);
        expect(isFacilityReadyToKey).toBe(false);
      });
    });

    it('sets the isFacilityReadyToKey to true or false depending on whether or not a fee record with the same facility id is not ready to key', async () => {
      // Arrange
      const firstFacilityId = '12345678';
      const secondFacilityId = '87654321';
      const thirdFacilityId = '11223344';
      const fourthFacilityId = '55667788';

      const feeRecordEntitiesToKey = [
        aFeeRecordWhichCanBeKeyed(firstFacilityId),
        aFeeRecordWhichCanBeKeyed(secondFacilityId),
        aFeeRecordWhichCanBeKeyed(thirdFacilityId),
        aFeeRecordWhichCanBeKeyed(fourthFacilityId),
      ];

      const feeRecordEntitiesNotReadyToKey = [aToDoFeeRecord(firstFacilityId), aToDoFeeRecord(secondFacilityId)];

      when(findByStatusesSpy).calledWith(['TO_DO', 'DOES_NOT_MATCH']).mockResolvedValue(feeRecordEntitiesNotReadyToKey);

      // Act
      const result = await getGenerateKeyingDataDetails(feeRecordEntitiesToKey);

      // Assert
      expect(result).toHaveLength(feeRecordEntitiesToKey.length);
      result.forEach(({ feeRecord, isFacilityReadyToKey }, index) => {
        expect(feeRecord).toEqual(feeRecordEntitiesToKey[index]);
        switch (feeRecord.facilityId) {
          case firstFacilityId:
          case secondFacilityId:
            expect(isFacilityReadyToKey).toBe(false);
            return;
          default:
            expect(isFacilityReadyToKey).toBe(true);
        }
      });
    });
  });
});
