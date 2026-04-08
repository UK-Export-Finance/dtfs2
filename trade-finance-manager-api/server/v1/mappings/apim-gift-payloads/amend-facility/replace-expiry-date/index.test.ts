import { APIM_GIFT_INTEGRATION } from '../../constants';
import { replaceExpiryDate } from '.';

const { AMENDMENT_TYPE } = APIM_GIFT_INTEGRATION;

describe('replaceExpiryDate', () => {
  it(`should return a payload for an "${AMENDMENT_TYPE.REPLACE_EXPIRY_DATE}" amendment`, () => {
    // Arrange
    const params = {
      expiryDate: '2024-07-01',
    };

    // Act
    const result = replaceExpiryDate(params);

    // Assert
    const expected = {
      amendmentType: AMENDMENT_TYPE.REPLACE_EXPIRY_DATE,
      amendmentData: params,
    };

    expect(result).toEqual(expected);
  });
});
