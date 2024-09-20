import objectsAreEqual from './objects-are-equal';

describe('objectsAreEqual', () => {
  const mockObject = {
    a: 'a',
    b: 'b',
    c: 'c',
  };

  describe('when objects are equal', () => {
    it('should return true', () => {
      const result = objectsAreEqual(mockObject, mockObject);

      expect(result).toEqual(true);
    });
  });

  describe('when objects are not equal', () => {
    const mockObject2 = {
      ...mockObject,
      c: 'd',
    };

    it('should return false', () => {
      const result = objectsAreEqual(mockObject, mockObject2);

      expect(result).toEqual(false);
    });
  });
});
