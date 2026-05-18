import { TfmFacility } from '@ukef/dtfs2-common';
import { hasId, mapFacilitiesToSendToGift } from '.';
import { mockGiftFacility, mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockTfmIssuedFacility3 } from '../test-mocks';

const MOCK_DEAL_ID = '61f7a4edcf809301e78fbe41';

describe('hasId', () => {
  describe('when object has facilityId property', () => {
    it('should return true', () => {
      // Act
      const result = hasId(mockGiftFacility);

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('when object does not have facilityId property', () => {
    it('should return false', () => {
      // Arrange
      const obj = { someOtherProperty: 'value' };

      // Act
      const result = hasId(obj);

      // Assert
      expect(result).toEqual(false);
    });
  });

  describe('when object has facilityId property with non-string value', () => {
    it('should return true', () => {
      // Arrange
      const obj = { facilityId: 12345 };

      // Act
      const result = hasId(obj);

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('when object is empty', () => {
    it('should return false', () => {
      // Arrange
      const obj = {};

      // Act
      const result = hasId(obj);

      // Assert
      expect(result).toEqual(false);
    });
  });
});

describe('mapFacilitiesToSendToGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when GIFT facility lookup fails', () => {
    it('should return all issued TFM facilities', () => {
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
      expect(result.facilitiesToSendToApimGift).toEqual([]);
    });

    it('should log that facilities will not be submitted', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2];
      const giftFacilitiesResponse = false;
      const consoleInfoSpy = jest.spyOn(console, 'info');

      // Act
      mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(
        2,
        'Failed to retrieve existing GIFT facilities for deal %s - no issued facilities will be submitted to APIM GIFT',
        MOCK_DEAL_ID,
      );
    });

    it('should return empty array when no issued facilities provided', () => {
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
    });
  });

  describe('when no facilities exist in GIFT', () => {
    it('should return all issued TFM facilities', () => {
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
    });
  });

  describe('when all issued facilities exist in GIFT', () => {
    it('should return an empty array', () => {
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
    });

    it('should log that all facilities already exist in GIFT', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2];
      const giftFacilitiesResponse = [
        { ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId) },
        { ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId) },
      ];
      const consoleInfoSpy = jest.spyOn(console, 'info');

      // Act
      mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(2, 'All issued facilities for deal %s already exist in GIFT: %o', MOCK_DEAL_ID, [
        mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId,
        mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId,
      ]);
    });
  });

  describe('when some issued facilities exist in GIFT', () => {
    it('should return only the facilities that do not exist in GIFT', () => {
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
    });

    it('should log facilities that exist in GIFT', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockTfmIssuedFacility3];
      const giftFacilitiesResponse = [{ ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId) }];
      const consoleInfoSpy = jest.spyOn(console, 'info');

      // Act
      mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(2, 'Some issued facilities for deal %s already exist in GIFT: %o', MOCK_DEAL_ID, [
        mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId,
      ]);
    });

    it('should log facilities that do not exist in GIFT', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockTfmIssuedFacility3];
      const giftFacilitiesResponse = [{ ...mockGiftFacility, facilityId: String(mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId) }];
      const consoleInfoSpy = jest.spyOn(console, 'info');

      // Act
      mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(3, 'Some issued facilities for deal %s do not exist in GIFT: %o', MOCK_DEAL_ID, [
        mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId,
        mockTfmIssuedFacility3.facilitySnapshot.ukefFacilityId,
      ]);
    });

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

  describe('when giftFacilities is an empty array', () => {
    it('should return all issued facilities', () => {
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
    });

    it('should log that all facilities can be submitted', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2];
      const giftFacilitiesResponse: object[] = [];
      const consoleInfoSpy = jest.spyOn(console, 'info');

      // Act
      mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(consoleInfoSpy).toHaveBeenNthCalledWith(
        2,
        'No facilities found in APIM GIFT for deal %s - all issued facilities can be submitted to APIM GIFT',
        MOCK_DEAL_ID,
      );
    });
  });

  describe('when giftFacilities response has no facilityId property', () => {
    it('should treat facilities without facilityId as not present', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2];
      const giftFacilitiesResponse = [{ someOtherProperty: 'FACILITY-001' }, { anotherProperty: 'FACILITY-002' }];

      // Act
      const result = mapFacilitiesToSendToGift({
        dealId: MOCK_DEAL_ID,
        giftFacilities: giftFacilitiesResponse,
        issuedTfmFacilities: issuedFacilities,
      });

      // Assert
      expect(result.facilitiesToSendToApimGift).toEqual(issuedFacilities);
    });
  });

  describe('logging behavior', () => {
    it('should always log the initial mapping message', () => {
      // Arrange
      const consoleInfoSpy = jest.spyOn(console, 'info');

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
