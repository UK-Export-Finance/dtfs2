const { FACILITY_STAGE } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../constants');
const { escapeOperators } = require('./escapeOperators');

describe('escapeOperators function', () => {
  it('should return the original input when input is null', () => {
    // Arrange
    const input = null;

    // Act
    const result = escapeOperators(input);

    // Assert
    expect(result).toEqual(input);
  });

  it('should return the original input if it is not an object', () => {
    // Arrange
    const input = 'not an object';

    // Act
    const result = escapeOperators(input);

    // Assert
    expect(result).toEqual(input);
  });

  it('should return the original input if it is an empty object', () => {
    // Arrange
    const input = {};

    // Act
    const result = escapeOperators(input);

    // Assert
    expect(result).toEqual(input);
  });

  it('should return the original input, wrapped with `$eq`, if it is an object containing no operators', () => {
    // Arrange
    const filter = { name: 'ABC' };

    // Act
    const result = escapeOperators(filter);

    // Assert
    const expected = { name: { $eq: 'ABC' } };
    expect(result).toEqual(expected);
  });

  it('should escape the AND operator correctly', () => {
    // Arrange
    const filter = { AND: [{ name: 'ABC' }, { age: 30 }] };

    // Act
    const result = escapeOperators(filter);

    // Assert
    const expected = { $and: [{ name: { $eq: 'ABC' } }, { age: { $eq: 30 } }] };
    expect(result).toEqual(expected);
  });

  it('should handle cases with multiple operators', () => {
    // Arrange
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

    // Act
    const result = escapeOperators(filter);

    // Assert
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
    expect(result).toEqual(expected);
  });

  it('should handle mixed string KEYWORD', () => {
    // Arrange
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

    // Act
    const result = escapeOperators(filter);

    // Assert
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
    expect(result).toEqual(expected);
  });

  it('should handle `hasBeenIssued`, filtering out risk expired facilities', () => {
    // Arrange
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
        {
          OR: [{ hasBeenIssued: true }, { hasBeenIssued: false }],
        },
      ],
    };

    // Act
    const result = escapeOperators(filter);

    // Assert
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
        {
          $or: [
            { hasBeenIssued: { $eq: true }, facilityStage: { $ne: FACILITY_STAGE.RISK_EXPIRED } },
            { hasBeenIssued: { $eq: false }, facilityStage: { $ne: FACILITY_STAGE.RISK_EXPIRED } },
          ],
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  it('should transform multiple keywords correctly', () => {
    // Arrange
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

    // Act
    const result = escapeOperators(filter);

    // Assert
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
    expect(result).toEqual(expected);
  });

  it('should escape nested OR operator inside AND operator', () => {
    // Arrange
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

    // Act
    const result = escapeOperators(filter);

    // Assert
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
    expect(result).toEqual(expected);
  });

  it('should handle empty OR array inside AND operator', () => {
    // Arrange
    const filter = { AND: [{ OR: [] }] };

    // Act
    const result = escapeOperators(filter);

    // Assert
    const expected = { $and: [{ $or: [] }] };
    expect(result).toEqual(expected);
  });

  it('should delete the AND operator key after escaping', () => {
    // Arrange
    const filter = { AND: [{ key: 'value' }] };

    // Act
    const result = escapeOperators(filter);

    // Assert
    expect(result).not.toHaveProperty('AND');
  });

  it('should return the same object for an empty filter object', () => {
    // Arrange
    const filter = {};

    // Act
    const result = escapeOperators(filter);

    // Assert
    expect(result).toEqual(filter);
  });

  it('should return the same object wrapped with $eq if there is no AND operator', () => {
    // Arrange
    const filter = {
      'bank.id': '9',
    };

    // Act
    const result = escapeOperators(filter);

    // Assert
    const expected = {
      'bank.id': { $eq: '9' },
    };
    expect(result).toEqual(expected);
  });

  it('should return the same object wrapped with $eq for invalid operator key', () => {
    // Arrange
    const filter = {
      INVALID: [
        {
          'bank.id': '9',
        },
      ],
    };

    // Act
    const result = escapeOperators(filter);

    // Assert
    const expected = {
      INVALID: [
        {
          'bank.id': { $eq: '9' },
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  it('should escape filter object with only AND operator', () => {
    // Arrange
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
      ],
    };

    // Act
    const result = escapeOperators(filter);

    // Assert
    const expected = {
      $and: [
        {
          'bank.id': { $eq: '9' },
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  it('should escape nested OR operator inside AND operator', () => {
    // Arrange
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

    // Act
    const result = escapeOperators(filter);

    // Assert
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
    expect(result).toEqual(expected);
  });

  it('should return null for null input', () => {
    // Arrange
    const filter = null;

    // Act
    const result = escapeOperators(filter);

    // Assert
    expect(result).toEqual(filter);
  });

  it('should return undefined for undefined input', () => {
    // Arrange
    const filter = undefined;

    // Act
    const result = escapeOperators(filter);

    // Assert
    expect(result).toEqual(filter);
  });

  it('should return the same input for non-object input', () => {
    // Arrange
    const filter = 'not an object';

    // Act
    const result = escapeOperators(filter);

    // Assert
    expect(result).toEqual(filter);
  });

  it('should handle empty OR array inside AND operator', () => {
    // Arrange
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

    // Act
    const result = escapeOperators(filter);

    // Assert
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
    expect(result).toEqual(expected);
  });

  it('should delete AND operator key after escaping', () => {
    // Arrange
    const filter = {
      AND: [
        {
          'bank.id': '9',
        },
      ],
    };

    // Act
    const result = escapeOperators(filter);

    // Assert
    expect(result).not.toHaveProperty('AND');
  });
});
