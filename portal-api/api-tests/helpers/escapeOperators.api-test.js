const { escapeOperators } = require('../../src/v1/helpers/escapeOperators');

describe('escapeOperators function', () => {
  // Tests that the function returns an empty object when an empty filter object is passed
  it('should test empty filter object', () => {
    const filter = {};
    const result = escapeOperators(filter);
    expect(result).toEqual({});
  });

  // Tests that the function returns the same filter object when no AND operator is present
  it('should test no and operator', () => {
    const filter = { key: 'value' };
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that the function returns the same filter object when an invalid operator key is present
  it('should test invalid operator key', () => {
    const filter = { OR: [{ key: 'value' }] };
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that the function correctly escapes the AND operator when it is the only operator present
  it('should test filter object with only and operator', () => {
    const filter = { AND: [{ key: 'value' }] };
    const result = escapeOperators(filter);
    expect(result).toEqual({ $and: [{ key: 'value' }] });
  });

  // Tests that the function correctly escapes the OR operator when it is nested inside an AND operator
  it('should test filter object with nested or operator inside and operator', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9'
        },
        {
          OR: [
            {
              status: "Ready for Checker's approval"
            }
          ]
        }
      ]
    };
    const result = escapeOperators(filter);
    expect(result).toEqual({
      $and: [
        {
          'bank.id': '9'
        },
        {
          $or: [
            {
              status: "Ready for Checker's approval"
            }
          ]
        }
      ]
    });
  });

  // Tests that the function returns null when null input is passed
  it('should test null input', () => {
    const filter = null;
    const result = escapeOperators(filter);
    expect(result).toBeNull();
  });

  // Tests that the function returns undefined when undefined input is passed
  it('should test undefined input', () => {
    const result = escapeOperators(undefined);
    expect(result).toBeUndefined();
  });

  // Tests that the function returns the same input when non-object input is passed
  it('should test non object input', () => {
    const filter = 'string';
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that the function correctly handles an empty OR array inside an AND operator
  it('should test empty or array inside and operator', () => {
    const filter = { AND: [{ OR: [] }] };
    const result = escapeOperators(filter);
    expect(result).toEqual({ $and: [{ $or: [] }] });
  });

  // Tests that the function correctly deletes the AND operator key after escaping
  it('should test delete and operator key', () => {
    const filter = { AND: [{ key: 'value' }] };
    const result = escapeOperators(filter);
    expect(result).not.toHaveProperty('AND');
  });

  // Tests that an empty filter object returns the same object
  it('should test empty filter object', () => {
    const filter = {};
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that a filter object with no AND operator returns the same object
  it('should test no and operator', () => {
    const filter = {
      'bank.id': '9'
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that a filter object with an invalid operator key returns the same object
  it('should test invalid operator key', () => {
    const filter = {
      INVALID: [
        {
          'bank.id': '9'
        }
      ]
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that a filter object with only AND operator is correctly escaped
  it('should test filter object with only and operator', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9'
        }
      ]
    };
    const expected = {
      $and: [
        {
          'bank.id': '9'
        }
      ]
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that a filter object with nested OR operator inside AND operator is correctly escaped
  it('should test filter object with nested or operator inside and operator', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9'
        },
        {
          OR: [
            {
              status: "Ready for Checker's approval"
            }
          ]
        }
      ]
    };
    const expected = {
      $and: [
        {
          'bank.id': '9'
        },
        {
          $or: [
            {
              status: "Ready for Checker's approval"
            }
          ]
        }
      ]
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that null input returns null
  it('should test null input', () => {
    const filter = null;
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that undefined input returns undefined
  it('should test undefined input', () => {
    const filter = undefined;
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that non-object input returns the same input
  it('should test non object input', () => {
    const filter = 'not an object';
    const result = escapeOperators(filter);
    expect(result).toEqual(filter);
  });

  // Tests that empty OR array inside AND operator is correctly handled
  it('should test empty or array inside and operator', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9'
        },
        {
          OR: []
        }
      ]
    };
    const expected = {
      $and: [
        {
          'bank.id': '9'
        },
        {
          $or: []
        }
      ]
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that the AND operator key is deleted after escaping
  it('should test delete and operator key after escaping', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9'
        }
      ]
    };
    const result = escapeOperators(filter);
    expect(result).not.toHaveProperty('AND');
  });
});
