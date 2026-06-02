import { HttpStatusCode } from 'axios';
import apiModule from '../../../api';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import { APIM_GIFT_INTEGRATION } from '../../../mappings/apim-gift-payloads/constants';
import { TfmFacilityAmendmentData } from '../../../mappings/apim-gift-payloads/types';
import { submitFacilityAmendmentsToApimGift } from '.';

const {
  AMENDMENT_TYPE: { INCREASE_AMOUNT, REPLACE_EXPIRY_DATE },
} = APIM_GIFT_INTEGRATION;

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

const mockAmountPayload = {
  amendmentType: INCREASE_AMOUNT,
  amendmentData: {
    amount: 20,
    date: '2024-01-01',
  },
};

const mockExpiryDatePayload = {
  amendmentType: REPLACE_EXPIRY_DATE,
  amendmentData: {
    expiryDate: '2024-02-01',
  },
};

const mockAmountApiResponse = HttpStatusCode.Accepted;
const mockExpiryDateApiResponse = HttpStatusCode.Accepted;

describe('submitFacilityAmendmentsToApimGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the amendment maps to a single payload', () => {
    beforeEach(() => {
      // Arrange
      amendFacilityPayloadSpy.mockReturnValueOnce([mockAmountPayload] as never);
      amendGiftFacilitySpy.mockResolvedValueOnce(mockAmountApiResponse as never);
    });

    it('should call APIM_GIFT_PAYLOADS.amendFacility with the amendment', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendFacilityPayloadSpy).toHaveBeenNthCalledWith(1, mockAmendment);
    });

    it('should call api.amendGiftFacility with the mapped payload and UKEF facility id', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockAmountPayload, mockUkefFacilityId);
    });

    it('should return an array of responses from api.amendGiftFacility', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual([mockAmountApiResponse]);
    });
  });

  describe('when the amendment maps to multiple payloads', () => {
    beforeEach(() => {
      // Arrange
      amendFacilityPayloadSpy.mockReturnValueOnce([mockAmountPayload, mockExpiryDatePayload] as never);
      amendGiftFacilitySpy.mockResolvedValueOnce(mockAmountApiResponse as never).mockResolvedValueOnce(mockExpiryDateApiResponse as never);
    });

    it('should call APIM_GIFT_PAYLOADS.amendFacility once with the amendment', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendFacilityPayloadSpy).toHaveBeenNthCalledWith(1, mockAmendment);
    });

    it('should call api.amendGiftFacility multiple times', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).toHaveBeenCalledTimes(2);
      expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockAmountPayload, mockUkefFacilityId);
      expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(2, mockExpiryDatePayload, mockUkefFacilityId);
    });

    it('should return an array of all responses', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual([mockAmountApiResponse, mockExpiryDateApiResponse]);
    });

    describe('when an API response is not accepted', () => {
      it('should return false and stop processing', async () => {
        // Arrange
        amendFacilityPayloadSpy.mockReset();
        amendGiftFacilitySpy.mockReset();

        amendFacilityPayloadSpy.mockReturnValueOnce([mockAmountPayload, mockExpiryDatePayload] as never);
        amendGiftFacilitySpy.mockResolvedValueOnce(HttpStatusCode.BadGateway as never);

        // Act
        const result = await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

        // Assert
        expect(result).toEqual(false);
        expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockAmountPayload, mockUkefFacilityId);
      });
    });
  });

  describe('when the amendment cannot be mapped to any APIM GIFT payload', () => {
    beforeEach(() => {
      // Arrange
      amendFacilityPayloadSpy.mockReturnValueOnce([] as never);
    });

    it('should return false', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual(false);
    });

    it('should not call api.amendGiftFacility', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendment: mockAmendment, ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).not.toHaveBeenCalled();
    });
  });
});
