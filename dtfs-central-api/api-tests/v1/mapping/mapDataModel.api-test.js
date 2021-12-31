const mapDataModel = require('../../../src/mapping/mapDataModel');
const CONSTANTS = require('../../../src/constants');

const deal = {
  dealSnapshot: {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  },
};

describe('Mapping cross data model fields', () => {
  describe('BSS Fields', () => {
    it('Should return UKEF Deal ID', () => {
      const actual = mapDataModel(deal, 'dealSnapshot.ukefDealId');
      const expected = 'dealSnapshot.details.ukefDealId';
      expect(actual).toEqual(expected);
    });

    it('Should return Exporter name', () => {
      const actual = mapDataModel(deal, 'dealSnapshot.exporter.companyName');
      const expected = 'dealSnapshot.submissionDetails.supplier-name';
      expect(actual).toEqual(expected);
    });

    it('Should return Buyer name', () => {
      const actual = mapDataModel(deal, 'dealSnapshot.buyer.companyName');
      const expected = 'dealSnapshot.submissionDetails.buyer-name';
      expect(actual).toEqual(expected);
    });

    it('Should return the same path if the mapping does not exists', () => {
      const actual = mapDataModel(deal, 'dealSnapshot.path.doesnotexists');
      const expected = 'dealSnapshot.path.doesnotexists';
      expect(actual).toEqual(expected);
    });

    it('Should return blank if an empty property path has been supplied', () => {
      const actual = mapDataModel(deal, '');
      const expected = '';
      expect(actual).toEqual(expected);
    });
  });
});
