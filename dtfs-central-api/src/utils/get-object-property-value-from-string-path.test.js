const getObjectPropertyValueFromStringPath = require('./getObjectPropertyValueFromStringPath');

describe('getObjectPropertyValueFromStringPath', () => {
  it('should return a property in object from the given string path', () => {
    const obj = {
      test: {
        testing: {
          hello: 'world',
        },
      },
    };

    const str = 'test.testing.hello';
    const result = getObjectPropertyValueFromStringPath(obj, str);
    const expected = obj.test.testing.hello;

    expect(result).toEqual(expected);
  });
});
