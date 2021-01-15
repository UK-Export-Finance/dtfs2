const assert = require('assert');
const component = require('./formatAsCurrency');

describe('formatAsCurrency', () => {
  const value = '1234.56';
  it('should return value in currency format', () => {
    const currencyValue = component.formatAsCurrency(value);
    assert.strictEqual(currencyValue, '1,234.56');
  });
});
