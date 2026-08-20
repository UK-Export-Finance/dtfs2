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
    multipleGiftFacilityAmendments: jest.fn(),
  },
}));

type MockedApiModule = {
  amendGiftFacility: jest.MockedFunction<typeof apiModule.amendGiftFacility>;
  multipleGiftFacilityAmendments: jest.MockedFunction<(payload: unknown, ukefFacilityId: string) => Promise<number | false>>;
};

const { amendGiftFacility: amendGiftFacilitySpy, multipleGiftFacilityAmendments: multipleGiftFacilityAmendmentsSpy } = jest.mocked(
  apiModule,
) as unknown as MockedApiModule;

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

    it('should return the response status code from api.amendGiftFacility', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [mockAmountPayload], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual(mockAmountApiResponse);
    });

    it('should not call api.multipleGiftFacilityAmendments', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [mockAmountPayload], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(multipleGiftFacilityAmendmentsSpy).not.toHaveBeenCalled();
    });
  });

  describe('when there are multiple amendment payloads', () => {
    beforeEach(() => {
      // Arrange
      multipleGiftFacilityAmendmentsSpy.mockResolvedValueOnce(HttpStatusCode.Accepted as never);
    });

    it('should call api.multipleGiftFacilityAmendments with the wrapped payloads and UKEF facility id', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [mockAmountPayload, mockExpiryDatePayload], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(multipleGiftFacilityAmendmentsSpy).toHaveBeenNthCalledWith(
        1,
        {
          amendments: [mockAmountPayload, mockExpiryDatePayload],
        },
        mockUkefFacilityId,
      );
    });

    it('should return the response status code from api.multipleGiftFacilityAmendments', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({
        amendmentPayloads: [mockAmountPayload, mockExpiryDatePayload],
        ukefFacilityId: mockUkefFacilityId,
      });

      // Assert
      expect(result).toEqual(HttpStatusCode.Accepted);
    });

    it('should not call api.amendGiftFacility', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({
        amendmentPayloads: [mockAmountPayload, mockExpiryDatePayload],
        ukefFacilityId: mockUkefFacilityId,
      });

      // Assert
      expect(amendGiftFacilitySpy).not.toHaveBeenCalled();
    });

    describe('when the API response is not accepted', () => {
      it('should return false', async () => {
        // Arrange
        multipleGiftFacilityAmendmentsSpy.mockReset();
        multipleGiftFacilityAmendmentsSpy.mockResolvedValueOnce(HttpStatusCode.BadGateway as never);

        // Act
        const result = await submitFacilityAmendmentsToApimGift({
          amendmentPayloads: [mockAmountPayload, mockExpiryDatePayload],
          ukefFacilityId: mockUkefFacilityId,
        });

        // Assert
        expect(result).toEqual(false);
      });
    });
  });

  describe('when there are no amendment payloads', () => {
    it('should return false', async () => {
      // Act
      const result = await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(result).toEqual(false);
    });

    it('should not call any API methods', async () => {
      // Act
      await submitFacilityAmendmentsToApimGift({ amendmentPayloads: [], ukefFacilityId: mockUkefFacilityId });

      // Assert
      expect(amendGiftFacilitySpy).not.toHaveBeenCalled();
      expect(multipleGiftFacilityAmendmentsSpy).not.toHaveBeenCalled();
    });
  });
});
