const { format, fromUnixTime } = require('date-fns');
const portalActivityGenerator = require('../../../src/v1/portalActivity-object-generator');

describe('portalActivityGenerator()', () => {
  const applicationType = 'Manual Inclusion Application submitted to UKEF';
  const user = {
    firstname: 'tester',
    surname: 'testing',
    _id: 12345,
  };
  const activityType = 'NOTICE';
  const text = 'test123';

  it('should correctly return populated object', () => {
    const generatorObj = {
      type: applicationType,
      user,
      activityType,
      text,
    };
    // ensures the returned object is properly generated with required fields
    const result = portalActivityGenerator(generatorObj);

    expect(result.type).toEqual('NOTICE');
    // matches date as timestamps may be seconds off
    const receivedDate = format(fromUnixTime(result.timestamp), 'dd-MMMM-yyyy');
    const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
    expect(receivedDate).toEqual(expectedDate);

    const expectedUser = {
      firstName: 'tester',
      lastName: 'testing',
      _id: 12345,
    };
    expect(result.author).toEqual(expectedUser);

    expect(result.text).toEqual('test123');

    expect(result.label).toEqual('Manual Inclusion Application submitted to UKEF');
  });
});
