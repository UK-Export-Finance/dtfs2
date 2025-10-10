import { hasEntries } from './object-has-entries';

describe('hasEntries', () => {
  it('should return false if the object is null', () => {
    // Arrange
    const mockInput = null;

    // Act
    const response = hasEntries(mockInput);

    // Assert
    expect(response).toBeFalsy();
  });

  it('should return false if the object is not typeof object', () => {
    // Arrange
    const mockInput = '';

    // Act
    const response = hasEntries(mockInput);

    // Assert
    expect(response).toBeFalsy();
  });

  it('should return false if the object is boolean false', () => {
    // Arrange
    const mockInput = false;

    // Act
    const response = hasEntries(mockInput);

    // Assert
    expect(response).toBeFalsy();
  });

  it('should return false if the object is empty', () => {
    // Arrange
    const mockInput = {};

    // Act
    const response = hasEntries(mockInput);

    // Assert
    expect(response).toBeFalsy();
  });

  it('should return true if the object has a property', () => {
    // Arrange
    const mockInput = {
      dealId: '123',
    };

    // Act
    const response = hasEntries(mockInput);

    // Assert
    expect(response).toBeTruthy();
  });

  it('should return true if the object has a multiple properties', () => {
    // Arrange
    const mockInput = {
      dealId: '123',
      details: {
        ukefDealId: '12345',
        created: 1759997406658,
      },
      additionalRefName: 'test',
      bankInternalRefName: 'test',
    };

    // Act
    const response = hasEntries(mockInput);

    // Assert
    expect(response).toBeTruthy();
  });
});
