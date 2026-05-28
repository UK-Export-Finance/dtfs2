import { getFormattedUTCDateString } from '@ukef/dtfs2-common';
import { TfmFacilityAmendmentData } from '../../types';
import { getAmendmentFields } from '.';

describe('getAmendmentFields', () => {
  it('should extract and format amendment fields from TFM amendment data', () => {
    // Arrange
    const amendment: TfmFacilityAmendmentData = {
      currentValue: 100,
      value: 130,
      effectiveDate: '1704067200',
      tfm: {
        coverEndDate: 1706745600000,
      },
    };

    // Act
    const result = getAmendmentFields(amendment);

    // Assert
    const expected = {
      newAmount: amendment.value,
      previousAmount: amendment.currentValue,
      coverEndDate: getFormattedUTCDateString(Number(amendment?.tfm?.coverEndDate)),
      effectiveDate: getFormattedUTCDateString(Number(amendment.effectiveDate)),
    };

    expect(result).toEqual(expected);
  });
});
