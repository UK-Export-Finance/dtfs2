import { TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
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

const mockPayloadOne = { mockPayloadOne: true } as unknown as ApimGiftFacilityCreationPayload;
const mockPayloadTwo = { mockPayloadTwo: true } as unknown as ApimGiftFacilityCreationPayload;

describe('createFacilities', () => {
  beforeEach(() => {
    // Arrange
    jest.clearAllMocks();

    createFacilitySpy.mockResolvedValueOnce(mockPayloadOne).mockResolvedValueOnce(mockPayloadTwo);
  });

  it('should call createFacility for each provided facility', async () => {
    // Act
    await createFacilities({ deal: mockDeal, facilities: [mockFacilityOne, mockFacilityTwo] });

    expect(createFacilitySpy).toHaveBeenCalledTimes(2);
    expect(createFacilitySpy).toHaveBeenNthCalledWith(1, { deal: mockDeal, facility: mockFacilityOne });
    expect(createFacilitySpy).toHaveBeenNthCalledWith(2, { deal: mockDeal, facility: mockFacilityTwo });
  });

  it('should return an array of APIM/GIFT facility creation payloads', async () => {
    // Act
    const result = await createFacilities({ deal: mockDeal, facilities: [mockFacilityOne, mockFacilityTwo] });

    // Assert
    const expected = [mockPayloadOne, mockPayloadTwo];

    expect(result).toEqual(expected);
  });
});
