import { TfmFacility } from '@ukef/dtfs2-common';
import { hasGiftFacilityId, mapFacilitiesToSendToGift } from '.';
import { mockGiftFacility, mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockTfmIssuedFacility3 } from '../test-mocks';

const MOCK_DEAL_ID = '61f7a4edcf809301e78fbe41';

describe('hasGiftFacilityId', () => {
  describe('when object has facilityId property', () => {
    it('should return true', () => {
      // Act
      const result = hasGiftFacilityId(mockGiftFacility);

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('when object does not have facilityId property', () => {
    it('should return false', () => {
      // Arrange
      const obj = { someOtherProperty: 'value' };

      // Act
      const result = hasGiftFacilityId(obj);

      // Assert
      expect(result).toEqual(false);
    });
  });

  describe('when object has facilityId property with non-string value', () => {
    it('should return true', () => {
      // Arrange
      const obj = { facilityId: 12345 };

      // Act
      const result = hasGiftFacilityId(obj);

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('when object is empty', () => {
    it('should return false', () => {
      // Arrange
      const obj = {};

      // Act
      const result = hasGiftFacilityId(obj);

      // Assert
      expect(result).toEqual(false);
    });
  });
});

describe('mapFacilitiesToSendToGift', () => {
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when GIFT facility lookup fails', () => {
    it('should return no facilities to send and log both mapping and failure messages', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2];
      const giftFacilitiesResponse = false;

      // Act
      const result = mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      const expected = {
        facilitiesToSendToApimGift: [],
        facilityIds: [],
      };

      expect(result).toEqual(expected);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(1, 'Mapping issued facilities for deal %s to determine if any should be sent to APIM GIFT', MOCK_DEAL_ID);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(
        2,
        'Failed to retrieve existing GIFT facilities for deal %s - no issued facilities will be submitted to APIM GIFT',
        MOCK_DEAL_ID,
      );
    });

    describe('when no issued facilities provided', () => {
      it('should return empty array and log when no issued facilities provided', () => {
        // Arrange
        const issuedFacilities: TfmFacility[] = [];
        const giftFacilitiesResponse = false;

        // Act
        const result = mapFacilitiesToSendToGift({
          dealId: MOCK_DEAL_ID,
          giftFacilities: giftFacilitiesResponse,
          issuedTfmFacilities: issuedFacilities,
        });

        // Assert
        expect(result.facilitiesToSendToApimGift).toEqual([]);
        expect(consoleInfoSpy).toHaveBeenNthCalledWith(
          1,
          'Mapping issued facilities for deal %s to determine if any should be sent to APIM GIFT',
          MOCK_DEAL_ID,
        );
        expect(consoleInfoSpy).toHaveBeenNthCalledWith(
          2,
          'Failed to retrieve existing GIFT facilities for deal %s - no issued facilities will be submitted to APIM GIFT',
          MOCK_DEAL_ID,
        );
      });
    });
  });

  describe('when no facilities exist in GIFT', () => {
    it('should return all issued TFM facilities and log mapping and all-can-submit messages', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2];
      const giftFacilitiesResponse: object[] = [];

      // Act
      const result = mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(result.facilitiesToSendToApimGift).toEqual(issuedFacilities);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(1, 'Mapping issued facilities for deal %s to determine if any should be sent to APIM GIFT', MOCK_DEAL_ID);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(
        2,
        'No facilities found in APIM GIFT for deal %s - all issued facilities can be submitted to APIM GIFT',
        MOCK_DEAL_ID,
      );
    });
  });

  describe('when all issued facilities exist in GIFT', () => {
    it('should return an empty array and log mapping and all-exist messages', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2];
      const giftFacilitiesResponse = [
        { ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId) },
        { ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId) },
      ];

      // Act
      const result = mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(result.facilitiesToSendToApimGift).toEqual([]);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(1, 'Mapping issued facilities for deal %s to determine if any should be sent to APIM GIFT', MOCK_DEAL_ID);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(2, 'All issued facilities for deal %s already exist in GIFT: %o', MOCK_DEAL_ID, [
        mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId,
        mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId,
      ]);
    });
  });

  describe('when some issued facilities exist in GIFT', () => {
    it('should return only the facilities that do not exist in GIFT and log mapping, some-exist, and some-not-exist messages', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockTfmIssuedFacility3];
      const giftFacilitiesResponse = [{ ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId) }];

      // Act
      const result = mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      const expected = [mockTfmIssuedFacility2, mockTfmIssuedFacility3];

      expect(result.facilitiesToSendToApimGift).toEqual(expected);
      expect(result.facilityIds).toEqual([
        String(mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId),
        String(mockTfmIssuedFacility3.facilitySnapshot.ukefFacilityId),
      ]);

      expect(consoleInfoSpy).toHaveBeenNthCalledWith(1, 'Mapping issued facilities for deal %s to determine if any should be sent to APIM GIFT', MOCK_DEAL_ID);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(2, 'Some issued facilities for deal %s already exist in GIFT: %o', MOCK_DEAL_ID, [
        mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId,
      ]);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(3, 'Some issued facilities for deal %s do not exist in GIFT: %o', MOCK_DEAL_ID, [
        mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId,
        mockTfmIssuedFacility3.facilitySnapshot.ukefFacilityId,
      ]);
    });

    // (Redundant with above, merged into one test)

    it('should return correct facilities when multiple exist in GIFT', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockTfmIssuedFacility3];
      const giftFacilitiesResponse = [
        { ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId) },
        { ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility3.facilitySnapshot.ukefFacilityId) },
      ];

      // Act
      const result = mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      const expected = [mockTfmIssuedFacility2];

      expect(result.facilitiesToSendToApimGift).toEqual(expected);
    });
  });

  describe('when giftFacilities response has no facilityId property', () => {
    it('should treat facilities without facilityId as not present and log mapping and all-can-submit messages', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2];
      const giftFacilitiesResponse = [{ someOtherProperty: '0000000002' }, { anotherProperty: '0000000002' }];

      // Act
      const result = mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(result.facilitiesToSendToApimGift).toEqual(issuedFacilities);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(1, 'Mapping issued facilities for deal %s to determine if any should be sent to APIM GIFT', MOCK_DEAL_ID);
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(
        2,
        'No facilities found in APIM GIFT for deal %s - all issued facilities can be submitted to APIM GIFT',
        MOCK_DEAL_ID,
      );
    });
  });

  describe('logging behavior', () => {
    it('should always log the initial mapping message, even for empty input', () => {
      // Act
      mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: [],
        issuedTfmFacilities: [],
      });

      // Assert
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(1, 'Mapping issued facilities for deal %s to determine if any should be sent to APIM GIFT', MOCK_DEAL_ID);
    });
  });
});
