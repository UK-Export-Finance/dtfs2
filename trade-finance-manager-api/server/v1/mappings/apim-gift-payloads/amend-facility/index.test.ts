import { APIM_GIFT_INTEGRATION } from '../constants';
import { amendFacility } from '.';

const {
  AMENDMENT_TYPE: { DECREASE_AMOUNT, INCREASE_AMOUNT, REPLACE_EXPIRY_DATE },
} = APIM_GIFT_INTEGRATION;

describe('amendFacility', () => {
  it('should be an object with amendment methods', () => {
    // Assert
    expect(typeof amendFacility[DECREASE_AMOUNT]).toEqual('function');
    expect(typeof amendFacility[INCREASE_AMOUNT]).toEqual('function');
    expect(typeof amendFacility[REPLACE_EXPIRY_DATE]).toEqual('function');
  });

  it('should have the correct amount of amendment methods', () => {
    // Act
    const methods = Object.keys(amendFacility);

    // Assert
    expect(methods.length).toEqual(3);
  });
});
