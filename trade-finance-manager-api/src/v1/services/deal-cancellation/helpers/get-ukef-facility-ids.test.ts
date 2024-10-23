import { TfmFacility } from '@ukef/dtfs2-common';
import { UKEF_ID } from '../../../../constants/deals';
import { MOCK_FACILITY_SNAPSHOT } from '../../../__mocks__/mock-facility-snapshot';
import { getUkefFacilityIds } from './get-ukef-facility-ids';

const aFacility = ({ ukefFacilityId }: { ukefFacilityId: unknown }): TfmFacility =>
  ({
    facilitySnapshot: {
      ...MOCK_FACILITY_SNAPSHOT,
      ukefFacilityId,
    },
  }) as TfmFacility;

describe('getUkefFacilityIds', () => {
  it('maps and filters the facilities', () => {
    // Arrange
    const validUkefId1 = 'validUkefId1';
    const validUkefId2 = 'validUkefId2';

    const facilities: TfmFacility[] = [
      aFacility({ ukefFacilityId: null }),
      aFacility({ ukefFacilityId: UKEF_ID.PENDING }),
      aFacility({ ukefFacilityId: validUkefId1 }),
      aFacility({ ukefFacilityId: UKEF_ID.TEST }),
      aFacility({ ukefFacilityId: validUkefId2 }),
    ];

    // Act
    const result = getUkefFacilityIds(facilities);

    // Assert
    expect(result).toEqual([validUkefId1, validUkefId2]);
  });

  it('returns an empty array when input is an empty array', () => {
    // Arrange
    const facilities: TfmFacility[] = [];

    // Act
    const result = getUkefFacilityIds(facilities);

    // Assert
    expect(result).toEqual([]);
  });

  it('returns an empty array when all the facilities are invalid', () => {
    // Arrange
    const facilities: TfmFacility[] = [
      aFacility({ ukefFacilityId: null }),
      aFacility({ ukefFacilityId: UKEF_ID.PENDING }),
      aFacility({ ukefFacilityId: UKEF_ID.TEST }),
    ];

    // Act
    const result = getUkefFacilityIds(facilities);

    // Assert
    expect(result).toEqual([]);
  });
});
