import { APIM_GIFT_INTEGRATION } from '../../constants';
import { decreaseAmount } from '.';

const { AMENDMENT_TYPE } = APIM_GIFT_INTEGRATION;

describe('decreaseAmount', () => {
  it(`should return a payload for an "${AMENDMENT_TYPE.DECREASE_AMOUNT}" amendment`, () => {
    // Arrange
    const params = {
      amount: 10000,
      date: '2024-07-01',
    };

    // Act
    const result = decreaseAmount(params);

    // Assert
    const expected = {
      amendmentType: AMENDMENT_TYPE.DECREASE_AMOUNT,
      amendmentData: {
        amount: 10000,
        date: '2024-07-01',
      },
    };

    expect(result).toEqual(expected);
  });
});
