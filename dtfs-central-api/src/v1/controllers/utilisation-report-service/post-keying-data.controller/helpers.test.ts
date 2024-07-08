import { when } from 'jest-when';
import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { getGenerateKeyingDataDetails } from './helpers';

describe('post-keying-data.controller helpers', () => {
  describe('getGenerateKeyingDataDetails', () => {
    const findByStatusesSpy = jest.spyOn(FeeRecordRepo, 'findByStatuses');

    const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

    const aMatchFeeRecord = (facilityId: string) =>
      FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('MATCH').withFacilityId(facilityId).build();

    const aToDoFeeRecord = (facilityId: string) =>
      FeeRecordEntityMockBuilder.forReport(RECONCILIATION_IN_PROGRESS_REPORT).withStatus('TO_DO').withFacilityId(facilityId).build();

    beforeEach(() => {
      findByStatusesSpy.mockRejectedValue(new Error('Some error'));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns each supplied fee record with generateKeyingData set to true when there are no facility ids which are not at the TO_DO or DOES_NOT_MATCH status', async () => {
      // Arrange
      const matchingFeeRecords = [aMatchFeeRecord('11111111'), aMatchFeeRecord('22222222'), aMatchFeeRecord('33333333')];

      when(findByStatusesSpy).calledWith(['TO_DO', 'DOES_NOT_MATCH']).mockResolvedValue([]);

      // Act
      const result = await getGenerateKeyingDataDetails(matchingFeeRecords);

      // Assert
      expect(result).toHaveLength(matchingFeeRecords.length);
      result.forEach(({ feeRecord, generateKeyingData }, index) => {
        expect(feeRecord).toEqual(matchingFeeRecords[index]);
        expect(generateKeyingData).toBe(true);
      });
    });

    it('returns each supplied fee record with generateKeyingData set to false when all the fee records have a facility id which is at the TO_DO or DOES_NOT_MATCH status', async () => {
      // Arrange
      const facilityId = '41343453';

      const matchingFeeRecords = [aMatchFeeRecord(facilityId), aMatchFeeRecord(facilityId), aMatchFeeRecord(facilityId)];

      when(findByStatusesSpy)
        .calledWith(['TO_DO', 'DOES_NOT_MATCH'])
        .mockResolvedValue([aToDoFeeRecord(facilityId)]);

      // Act
      const result = await getGenerateKeyingDataDetails(matchingFeeRecords);

      // Assert
      expect(result).toHaveLength(matchingFeeRecords.length);
      result.forEach(({ feeRecord, generateKeyingData }, index) => {
        expect(feeRecord).toEqual(matchingFeeRecords[index]);
        expect(generateKeyingData).toBe(false);
      });
    });

    it('sets the generateKeyingData to true or false depending on whether or not a fee record with the same facility id is at the TO_DO or DOES_NOT_MATCH status', async () => {
      // Arrange
      const firstFacilityId = '12345678';
      const secondFacilityId = '87654321';
      const thirdFacilityId = '11223344';
      const fourthFacilityId = '55667788';

      const matchingFeeRecords = [
        aMatchFeeRecord(firstFacilityId),
        aMatchFeeRecord(secondFacilityId),
        aMatchFeeRecord(thirdFacilityId),
        aMatchFeeRecord(fourthFacilityId),
      ];

      const toDoFeeRecords = [aToDoFeeRecord(firstFacilityId), aToDoFeeRecord(secondFacilityId)];

      when(findByStatusesSpy).calledWith(['TO_DO', 'DOES_NOT_MATCH']).mockResolvedValue(toDoFeeRecords);

      // Act
      const result = await getGenerateKeyingDataDetails(matchingFeeRecords);

      // Assert
      expect(result).toHaveLength(matchingFeeRecords.length);
      result.forEach(({ feeRecord, generateKeyingData }, index) => {
        expect(feeRecord).toEqual(matchingFeeRecords[index]);
        switch (feeRecord.facilityId) {
          case firstFacilityId:
          case secondFacilityId:
            expect(generateKeyingData).toBe(false);
            return;
          default:
            expect(generateKeyingData).toBe(true);
        }
      });
    });

    it('only sets generateKeyingData to true for one of the fee records at the MATCH status', async () => {
      // Arrange
      const facilityId = '12345678';
      const matchingFeeRecords = [aMatchFeeRecord(facilityId), aMatchFeeRecord(facilityId), aMatchFeeRecord(facilityId)];

      when(findByStatusesSpy).calledWith(['TO_DO', 'DOES_NOT_MATCH']).mockResolvedValue([]);

      // Act
      const result = await getGenerateKeyingDataDetails(matchingFeeRecords);

      // Assert
      expect(result).toHaveLength(matchingFeeRecords.length);
      expect(result.filter(({ generateKeyingData }) => generateKeyingData === true)).toHaveLength(1);
      expect(result.filter(({ generateKeyingData }) => generateKeyingData === false)).toHaveLength(2);
    });
  });
});
