import { amendFacility } from '.';

describe('amendFacility', () => {
  it('should be an object with amendment methods', () => {
    // Assert
    expect(typeof amendFacility.decreaseAmount).toEqual('function');
    expect(typeof amendFacility.increaseAmount).toEqual('function');
    expect(typeof amendFacility.replaceExpiryDate).toEqual('function');
  });

  it('should have the correct amount of amendment methods', () => {
    // Act
    const methods = Object.keys(amendFacility);

    // Assert
    expect(methods.length).toEqual(3);
  });
});
