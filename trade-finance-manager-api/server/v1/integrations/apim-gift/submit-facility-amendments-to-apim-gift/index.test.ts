import { HttpStatusCode } from 'axios';
import apiModule from '../../../api';
import { APIM_GIFT_INTEGRATION } from '../../../mappings/apim-gift-payloads/constants';
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
const amendGiftFacilitySpy = apiModule.amendGiftFacility as jest.MockedFunction<typeof apiModule.amendGiftFacility>;

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

  describe('when there is a single amendment payload', () => {
    beforeEach(() => {
      // Arrange
      amendGiftFacilitySpy.mockResolvedValueOnce(mockAmountApiResponse as never);
    });

    it('should call api.amendGiftFacility with the payload and UKEF facility id', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [mockAmountPayload], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockAmountPayload, mockUkefFacilityId);
    });

    it('should return an array of responses from api.amendGiftFacility', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [mockAmountPayload], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual([mockAmountApiResponse]);
    });
  });

  describe('when there are multiple amendment payloads', () => {
    beforeEach(() => {
      // Arrange
      amendGiftFacilitySpy.mockResolvedValueOnce(mockAmountApiResponse as never).mockResolvedValueOnce(mockExpiryDateApiResponse as never);
    });

    it('should call api.amendGiftFacility multiple times', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [mockAmountPayload, mockExpiryDatePayload], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).toHaveBeenCalledTimes(2);
      expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockAmountPayload, mockUkefFacilityId);
      expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(2, mockExpiryDatePayload, mockUkefFacilityId);
    });

    it('should return an array of all responses', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({
        amendmentPayloads: [mockAmountPayload, mockExpiryDatePayload],
        ukefFacilityId: mockUkefFacilityId,
      });

      // Assert
      expect(result).toEqual([mockAmountApiResponse, mockExpiryDateApiResponse]);
    });

    describe('when an API response is not accepted', () => {
      it('should return false and stop processing', async () => {
        // Arrange
        amendGiftFacilitySpy.mockReset();

        amendGiftFacilitySpy.mockResolvedValueOnce(HttpStatusCode.BadGateway as never);

        // Act
        const result = await submitFacilityAmendmentsToApimGift({
          amendmentPayloads: [mockAmountPayload, mockExpiryDatePayload],
          ukefFacilityId: mockUkefFacilityId,
        });

        // Assert
        expect(result).toEqual(false);
        expect(amendGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockAmountPayload, mockUkefFacilityId);
        expect(amendGiftFacilitySpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when there are no amendment payloads', () => {
    it('should return an empty array', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual([]);
    });

    it('should not call api.amendGiftFacility', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).not.toHaveBeenCalled();
    });
  });
});
