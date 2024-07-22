const CONSTANTS = require('../../constants');
const { escapeOperators } = require('./escapeOperators');

describe('escapeOperators function', () => {
  // Tests that the function returns null when the input is null
  it('should null input', () => {
    const result = escapeOperators(null);
    expect(result).toBeNull();
  });

  // Tests that the function returns the original input when the input is not an object
  it('should non object input', () => {
    const result = escapeOperators('not an object');
    expect(result).toEqual('not an object');
  });

  // Tests that the function returns the original input when the input is an empty object
  it('should empty object input', () => {
    const result = escapeOperators({});
    expect(result).toEqual({});
  });

  // Tests that the function returns the original input wrapped with $eq when the input has no operators
  it('should no operators', () => {
    const filter = { name: 'ABC' };
    const expected = { name: { $eq: 'ABC' } };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that the function escapes the AND operator correctly
  it('should AND operator', () => {
    const filter = { AND: [{ name: 'ABC' }, { age: 30 }] };
    const expected = { $and: [{ name: { $eq: 'ABC' } }, { age: { $eq: 30 } }] };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that the function handles cases where the input filter has multiple operators
  it('should multiple operators', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
        {
          OR: [{ age: 30 }, { city: 'London' }, { name: { KEYWORD: '.*ABC.*' } }],
        },
      ],
    };
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
        {
          $or: [{ age: { $eq: 30 } }, { city: { $eq: 'London' } }, { name: { $regex: '\\.\\*ABC\\.\\*' } }],
        },
      ],
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that the function handles mixed string KEYWORD
  it('should handle mixed string keyword', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
        {
          OR: [{ age: 30 }, { city: 'London' }, { name: { KEYWORD: 'ABC!"£123' } }],
        },
      ],
    };
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
        {
          $or: [{ age: { $eq: 30 } }, { city: { $eq: 'London' } }, { name: { $regex: 'ABC!"£123' } }],
        },
      ],
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that the function handles cases where the multiple keywords exist
  it('should multiple keywords be transformed', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
        {
          OR: [{ name: { KEYWORD: '.*ABC.*' } }, { exporter: { KEYWORD: 'Test' } }, { deal: { KEYWORD: 'AIN' } }],
        },
      ],
    };
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
        {
          $or: [{ name: { $regex: '\\.\\*ABC\\.\\*' } }, { exporter: { $regex: 'Test' } }, { deal: { $regex: 'AIN' } }],
        },
      ],
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that the function correctly escapes the OR operator when it is nested inside an AND operator
  it('should test filter object with nested or operator inside and operator', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
        {
          OR: [
            {
              status: CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL,
            },
          ],
        },
      ],
    };
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
        {
          $or: [
            {
              status: { $eq: CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL },
            },
          ],
        },
      ],
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
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

  // Tests that a filter object with no AND operator returns the same object wrapped with $eq
  it('should test no and operator', () => {
    const filter = {
      'bank.id': '9',
    };
    const expected = {
      'bank.id': { $eq: '9' },
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that a filter object with an invalid operator key returns the same object wrapped with $eq
  it('should test invalid operator key', () => {
    const filter = {
      INVALID: [
        {
          'bank.id': '9',
        },
      ],
    };
    const expected = {
      INVALID: [
        {
          'bank.id': { $eq: '9' },
        },
      ],
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that a filter object with only AND operator is correctly escaped
  it('should test filter object with only and operator', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
      ],
    };
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
      ],
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that a filter object with nested OR operator inside AND operator is correctly escaped
  it('should test filter object with nested or operator inside and operator', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
        {
          OR: [
            {
              status: CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL,
            },
          ],
        },
      ],
    };
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
        {
          $or: [
            {
              status: { $eq: CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL },
            },
          ],
        },
      ],
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
          'bank.id': '9',
        },
        {
          OR: [],
        },
      ],
    };
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
        {
          $or: [],
        },
      ],
    };
    const result = escapeOperators(filter);
    expect(result).toEqual(expected);
  });

  // Tests that the AND operator key is deleted after escaping
  it('should test delete and operator key after escaping', () => {
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
      ],
    };
    const result = escapeOperators(filter);
    expect(result).not.toHaveProperty('AND');
  });
});
