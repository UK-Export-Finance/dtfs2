import setObjectPropertyValueFromStringPath from './set-object-property-value-from-string-path';

describe('setObjectPropertyValueFromStringPath', () => {
  it('should update an existing property in an object from the given string path', () => {
    const before = {
      propertyA: {
        propertyB: {
          propertyC: 'before',
        },
      },
    };

    const after = {
      propertyA: {
        propertyB: {
          propertyC: 'after',
        },
      },
    };

    setObjectPropertyValueFromStringPath(before, 'propertyA.propertyB.propertyC', 'after');

    expect(before).toEqual(after);
  });

  it('should set a property if it does not exist in an object from the given string path', () => {
    const before = {
      propertyD: 'before',
    };

    const after = {
      propertyA: {
        propertyB: {
          propertyC: 'after',
        },
      },
      propertyD: 'before',
    };

    setObjectPropertyValueFromStringPath(before, 'propertyA.propertyB.propertyC', 'after');

    expect(before).toEqual(after);
  });
});
