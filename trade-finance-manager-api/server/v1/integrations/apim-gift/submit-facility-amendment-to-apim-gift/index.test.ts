import apiModule from '../../../api';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import { TfmFacilityAmendmentData } from '../../../mappings/apim-gift-payloads/types';
import { submitFacilityAmendmentToApimGift } from '.';

jest.mock('../../../api', () => ({
  __esModule: true,
  default: {
    amendGiftFacility: jest.fn(),
  },
}));

jest.mock('../../../mappings/apim-gift-payloads', () => ({
  APIM_GIFT_PAYLOADS: {
    amendFacility: jest.fn(),
  },
}));

const amendFacilityPayloadSpy = APIM_GIFT_PAYLOADS.amendFacility as jest.MockedFunction<typeof APIM_GIFT_PAYLOADS.amendFacility>;
const amendGiftFacilitySpy = apiModule.amendGiftFacility as jest.MockedFunction<typeof apiModule.amendGiftFacility>;

const mockAmendment: TfmFacilityAmendmentData = {
  changeFacilityValue: true,
  currentValue: 100,
  value: 120,
  effectiveDate: '1704067200',
  tfm: {
    coverEndDate: 1706745600000,
  },
};

const mockUkefFacilityId = '0030537688';

const mockPayload = {
  amendmentType: 'INCREASE_AMOUNT',
  amendmentData: {
    amount: 20,
    date: '2024-01-01',
  },
};

const mockApiResponse = { status: 'ok' };

describe('submitFacilityAmendmentToApimGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the amendment can be mapped to an APIM GIFT payload', () => {
    beforeEach(() => {
      // Arrange
      amendFacilityPayloadSpy.mockReturnValueOnce(mockPayload as never);
      amendGiftFacilitySpy.mockResolvedValueOnce(mockApiResponse as never);
    });

    it('should call APIM_GIFT_PAYLOADS.amendFacility with the amendment', async () => {
      // Act
      await submitFacilityAmendmentToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendFacilityPayloadSpy).toHaveBeenNthCalledWith(1, mockAmendment);
    });

    it('should call api.amendGiftFacility with the mapped payload and UKEF facility id', async () => {
      // Act
      await submitFacilityAmendmentToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockPayload, mockUkefFacilityId);
    });

    it('should return the response from api.amendGiftFacility', async () => {
      // Act
      const result = await submitFacilityAmendmentToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('when the amendment cannot be mapped to an APIM GIFT payload', () => {
    beforeEach(() => {
      // Arrange
      amendFacilityPayloadSpy.mockReturnValueOnce(null);
    });

    it('should return false', async () => {
      // Act
      const result = await submitFacilityAmendmentToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual(false);
    });

    it('should not call api.amendGiftFacility', async () => {
      // Act
      await submitFacilityAmendmentToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).not.toHaveBeenCalled();
    });
  });
});
