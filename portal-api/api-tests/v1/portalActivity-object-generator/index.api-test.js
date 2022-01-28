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
  const activityText = 'test123';
  const facility = {
    type: 'Cash',
    ukefFacilityId: 123456
  };
  const maker = {
    firstname: 'Joe',
    surname: 'Bloggs',
    id: '12345',
  };
  const checker = {
    firstname: 'Bob',
    surname: 'Smith',
    id: '4567',
  };
  const activityHTML = 'facility';

  describe('should correctly return populated object where facility defined', () => {
    const generatorObj = {
      type: applicationType,
      user,
      activityType,
      activityText,
      activityHTML,
      facility,
      checker,
      maker,
    };
    // ensures the returned object is properly generated with required fields
    const result = portalActivityGenerator(generatorObj);
    it('should correctly return type', () => {
      expect(result.type).toEqual('NOTICE');
    });

    it('should correctly return timestamp', () => {
    // matches date as timestamps may be seconds off
      const receivedDate = format(fromUnixTime(result.timestamp), 'dd-MMMM-yyyy');
      const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
      expect(receivedDate).toEqual(expectedDate);
    });

    it('should correctly return author', () => {
      const expectedUser = {
        firstName: 'tester',
        lastName: 'testing',
        _id: 12345,
      };
      expect(result.author).toEqual(expectedUser);
    });

    it('should correctly return text', () => {
      expect(result.text).toEqual('test123');
    });

    it('should correctly return label', () => {
      expect(result.label).toEqual('Manual Inclusion Application submitted to UKEF');
    });

    it('should correctly return html', () => {
      expect(result.html).toEqual('facility');
    });

    it('should correctly return maker', () => {
      expect(result.maker).toEqual(maker);
    });

    it('should correctly return checker', () => {
      expect(result.checker).toEqual(checker);
    });

    it('should correctly return type', () => {
      expect(result.facilityType).toEqual('Cash facility');
    });

    it('should correctly return ukefFacilityId', () => {
      expect(result.ukefFacilityId).toEqual(123456);
    });
  });

  describe('should correctly return populated object where facility undefined', () => {
    const generatorObj = {
      type: applicationType,
      user,
      activityType,
      activityText,
      activityHTML,
      facility: null,
      checker,
      maker,
    };
    // ensures the returned object is properly generated with required fields
    const result = portalActivityGenerator(generatorObj);
    it('should correctly return type', () => {
      expect(result.type).toEqual('NOTICE');
    });

    it('should correctly return timestamp', () => {
    // matches date as timestamps may be seconds off
      const receivedDate = format(fromUnixTime(result.timestamp), 'dd-MMMM-yyyy');
      const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
      expect(receivedDate).toEqual(expectedDate);
    });

    it('should correctly return author', () => {
      const expectedUser = {
        firstName: 'tester',
        lastName: 'testing',
        _id: 12345,
      };
      expect(result.author).toEqual(expectedUser);
    });

    it('should correctly return text', () => {
      expect(result.text).toEqual('test123');
    });

    it('should correctly return label', () => {
      expect(result.label).toEqual('Manual Inclusion Application submitted to UKEF');
    });

    it('should correctly return html', () => {
      expect(result.html).toEqual('facility');
    });

    it('should correctly return maker', () => {
      expect(result.maker).toEqual(maker);
    });

    it('should correctly return checker', () => {
      expect(result.checker).toEqual(checker);
    });

    it('should correctly return facilityType', () => {
      expect(result.facilityType).toEqual('');
    });

    it('should correctly return ukefFacilityId', () => {
      expect(result.ukefFacilityId).toEqual('');
    });
  });
});
