import { TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS } from '../../../__mocks__/mock-credit-risk-ratings';
import { MOCK_FACILITY_CATEGORIES } from '../../../__mocks__/mock-facility-categories';
import * as createFacilityModule from '../create-facility';
import { ApimGiftFacilityCreationPayload } from '../types';
import { createFacilities } from '.';

jest.mock('../create-facility', () => ({
  createFacility: jest.fn(),
}));

const createFacilitySpy = createFacilityModule.createFacility as jest.MockedFunction<typeof createFacilityModule.createFacility>;

const mockDeal = { mockDeal: true } as unknown as TfmDeal;
const mockFacilityOne = { mockFacilityOne: true } as unknown as TfmFacility;
const mockFacilityTwo = { mockFacilityTwo: true } as unknown as TfmFacility;

const mockIsBssEwcsDeal = true;
const mockIsGefDeal = false;

const mockPayloadOne = { mockPayloadOne: true } as unknown as ApimGiftFacilityCreationPayload;
const mockPayloadTwo = { mockPayloadTwo: true } as unknown as ApimGiftFacilityCreationPayload;

const baseParams = {
  deal: mockDeal,
  isBssEwcsDeal: mockIsBssEwcsDeal,
  isGefDeal: mockIsGefDeal,
  creditRiskRatings: MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS,
  facilityCategories: MOCK_FACILITY_CATEGORIES,
};

describe('createFacilities', () => {
  beforeEach(() => {
    // Arrange
    jest.clearAllMocks();

    createFacilitySpy.mockResolvedValueOnce(mockPayloadOne).mockResolvedValueOnce(mockPayloadTwo);
  });

  it('should call createFacility for each provided facility', async () => {
    // Act
    await createFacilities({
      ...baseParams,
      facilities: [mockFacilityOne, mockFacilityTwo],
    });

    expect(createFacilitySpy).toHaveBeenCalledTimes(2);
    expect(createFacilitySpy).toHaveBeenNthCalledWith(1, {
      ...baseParams,
      facility: mockFacilityOne,
    });
    expect(createFacilitySpy).toHaveBeenNthCalledWith(2, {
      ...baseParams,
      facility: mockFacilityTwo,
    });
  });

  it('should return an array of APIM/GIFT facility creation payloads', async () => {
    // Act
    const result = await createFacilities({
      ...baseParams,
      facilities: [mockFacilityOne, mockFacilityTwo],
    });

    // Assert
    const expected = [mockPayloadOne, mockPayloadTwo];

    expect(result).toEqual(expected);
  });
});
