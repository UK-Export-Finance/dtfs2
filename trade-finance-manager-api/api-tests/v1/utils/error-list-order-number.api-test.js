const { orderNumber } = require('../../../src/utils/error-list-order-number');

describe('utils - orderNumber', () => {
  it('should return a number as string that is incremented from the `order` value of the last property from the given errorList\'s', () => {
    const mockErrorList = {
      someField: { order: '1', text: 'This is required' },
      anotherField: { order: '2', text: 'This is required' },
      testField: { order: '3', text: 'This is required' },
    };

    const result = orderNumber(mockErrorList);

    const lastFieldName = Object.keys(mockErrorList)[Object.keys(mockErrorList).length - 1];
    const lastFieldOrderNumber = Number(mockErrorList[lastFieldName].order);
    const expected = String(lastFieldOrderNumber + 1);

    expect(result).toEqual(expected);
  });

  describe('when there are no existing errors in the given errorList', () => {
    it('should return `1`', () => {
      const result = orderNumber({});
      expect(result).toEqual('1');
    });
  });
});
