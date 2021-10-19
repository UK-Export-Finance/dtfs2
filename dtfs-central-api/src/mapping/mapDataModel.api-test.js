const getBSSProperty = require('./mapDataModel');

describe('Mapping cross data model fields', () => {
  describe('BSS Fields', () => {
    it('Should return UKEF Deal ID', () => {
      const actual = getBSSProperty('dealSnapshot.ukefDealId');
      const expected = 'dealSnapshot.details.ukefDealId';
      expect(actual).toEqual(expected);
    });

    it('Should return Exporter name', () => {
      const actual = getBSSProperty('dealSnapshot.exporter.companyName');
      const expected = 'dealSnapshot.submissionDetails.supplier-name';
      expect(actual).toEqual(expected);
    });

    it('Should return Buyer name', () => {
      const actual = getBSSProperty('dealSnapshot.buyer.companyName');
      const expected = 'dealSnapshot.submissionDetails.buyer-name';
      expect(actual).toEqual(expected);
    });

    it('Should return Bank name', () => {
      const actual = getBSSProperty('dealSnapshot.details.owningBank.name');
      const expected = 'dealSnapshot.bank.name';
      expect(actual).toEqual(expected);
    });

    it('Should return the same path if the mapping does not exists', () => {
      const actual = getBSSProperty('dealSnapshot.path.doesnotexists');
      const expected = 'dealSnapshot.path.doesnotexists';
      expect(actual).toEqual(expected);
    });

    it('Should return null if an empty property path has been supplied', () => {
      const actual = getBSSProperty('');
      const expected = null;
      expect(actual).toEqual(expected);
    });
  });
});
