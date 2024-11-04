import { REQUEST_PLATFORM_TYPE } from '../../constants';
import { FacilityUtilisationDataEntityMockBuilder } from '../../test-helpers';

describe('FacilityUtilisationDataEntity', () => {
  describe('updateWithCurrentReportPeriodDetails', () => {
    it("sets the fixed fee, utilisation and report period and updates the 'lastUpdatedBy...' fields", () => {
      // Arrange
      const facilityUtilisationDataEntity = FacilityUtilisationDataEntityMockBuilder.forId('12345678')
        .withUtilisation(123456.78)
        .withFixedFee(123.45)
        .withReportPeriod({
          start: { month: 1, year: 2021 },
          end: { month: 2, year: 2022 },
        })
        .build();

      const userId = 'abc123';

      // Act
      facilityUtilisationDataEntity.updateWithCurrentReportPeriodDetails({
        fixedFee: 543.21,
        utilisation: 876543.21,
        reportPeriod: {
          start: { month: 3, year: 2023 },
          end: { month: 4, year: 2024 },
        },
        requestSource: { platform: REQUEST_PLATFORM_TYPE.TFM, userId },
      });

      // Assert
      expect(facilityUtilisationDataEntity.fixedFee).toEqual(543.21);
      expect(facilityUtilisationDataEntity.utilisation).toEqual(876543.21);
      expect(facilityUtilisationDataEntity.reportPeriod).toEqual({
        start: { month: 3, year: 2023 },
        end: { month: 4, year: 2024 },
      });
      expect(facilityUtilisationDataEntity.lastUpdatedByIsSystemUser).toEqual(false);
      expect(facilityUtilisationDataEntity.lastUpdatedByPortalUserId).toBeNull();
      expect(facilityUtilisationDataEntity.lastUpdatedByTfmUserId).toEqual(userId);
    });
  });
});
