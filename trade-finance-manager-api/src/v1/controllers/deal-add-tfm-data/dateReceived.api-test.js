const { format } = require('date-fns');
const generateDateReceived = require('./dateReceived');

describe('deal submit - add TFM data - date received', () => {
  it('should return a formatted date and timestamp', () => {
    const result = generateDateReceived();

    const expectedDateReceived = format(new Date(), 'dd-MM-yyyy');
    expect(result.dateReceived).toEqual(expectedDateReceived);

    expect(typeof result.dateReceivedTimestamp).toEqual('number');
  });
});
