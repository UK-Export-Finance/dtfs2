import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import { TfmFacilityAmendmentData } from '../../../mappings/apim-gift-payloads/types';
import { canSendAmendmentsToApimGift } from '.';

jest.mock('../../../mappings/apim-gift-payloads', () => ({
  APIM_GIFT_PAYLOADS: {
    amendFacility: jest.fn(),
  },
}));

const amendFacilityPayloadSpy = APIM_GIFT_PAYLOADS.amendFacility as jest.MockedFunction<typeof APIM_GIFT_PAYLOADS.amendFacility>;

const mockAmendment = {
  changeFacilityValue: true,
  currentValue: 100,
  value: 120,
  effectiveDate: 1704067200,
  tfm: {
    coverEndDate: 1706745600000,
  },
} as TfmFacilityAmendmentData;

const mockPayload = {
  amendmentType: 'INCREASE_AMOUNT',
  amendmentData: {
    amount: 20,
    date: '2024-01-01',
  },
} as never;

describe('canSendAmendmentsToApimGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the amendment maps to one or more APIM GIFT payloads', () => {
    beforeEach(() => {
      amendFacilityPayloadSpy.mockReturnValueOnce([mockPayload]);
    });

    it('calls APIM_GIFT_PAYLOADS.amendFacility with the amendment', () => {
      // Act
      canSendAmendmentsToApimGift(mockAmendment);

      // Assert
      expect(amendFacilityPayloadSpy).toHaveBeenNthCalledWith(1, mockAmendment);
    });

    it('returns true with mapped payloads', () => {
      // Act
      const result = canSendAmendmentsToApimGift(mockAmendment);

      // Assert
      expect(result).toEqual({
        canSendAmendmentsToApimGift: true,
        amendmentPayloads: [mockPayload],
      });
    });
  });

  describe('when the amendment cannot be mapped to APIM GIFT payloads', () => {
    beforeEach(() => {
      amendFacilityPayloadSpy.mockReturnValueOnce([]);
    });

    it('returns false with an empty payload array', () => {
      // Act
      const result = canSendAmendmentsToApimGift(mockAmendment);

      // Assert
      expect(result).toEqual({
        canSendAmendmentsToApimGift: false,
        amendmentPayloads: [],
      });
    });
  });
});
