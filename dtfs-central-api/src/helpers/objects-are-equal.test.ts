import objectsAreEqual from './objects-are-equal';

describe('objectsAreEqual', () => {
  const object = {
    a: 'a',
    b: 'b',
    c: 'c',
  };

  describe('when objects are equal', () => {
    it('should return true', () => {
      const result = objectsAreEqual(object, object);

      expect(result).toEqual(true);
    });
  });

  describe('when objects are not equal', () => {
    const object2 = {
      a: 'a',
      b: 'b',
      c: 'd',
    };

    it('should return false', () => {
      const result = objectsAreEqual(object, object2);

      expect(result).toEqual(false);
    });
  });
});
