import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapRepaymentProfiles } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapRepaymentProfiles', () => {
  it('should return an array with one repayment profile', () => {
    // Arrange
    const amount = 100;
    const dueDate = '2024-12-31';

    // Act
    const result = mapRepaymentProfiles({ amount, dueDate });

    // Assert
    const expected = [
      {
        name: DEFAULTS.REPAYMENT_PROFILE.NAME,
        allocations: [
          {
            amount,
            dueDate,
          },
        ],
      },
    ];

    expect(result).toEqual(expected);
  });
});
