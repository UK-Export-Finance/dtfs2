import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapToFeeRecordDetails } from './helpers';

describe('get-fee-record-details-by-id.controller helpers', () => {
  describe('mapToFeeRecordDetails', () => {
    it('returns an object containing the mapped fee record', () => {
      // Arrange
      const id = 123;
      const facilityId = '0012345678';
      const exporter = 'A sample exporter';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withId(id)
        .withFacilityId(facilityId)
        .withExporter(exporter)
        .build();

      const mappedFeeRecord = {
        id,
        facilityId,
        exporter,
      };

      // Act
      const feeRecordDetails = mapToFeeRecordDetails(feeRecord);

      // Assert
      expect(feeRecordDetails).toEqual(mappedFeeRecord);
    });
  });
});
