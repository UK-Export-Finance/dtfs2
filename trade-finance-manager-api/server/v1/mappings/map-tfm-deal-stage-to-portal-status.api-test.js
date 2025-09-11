const mapTfmDealStageToPortalStatus = require('./map-tfm-deal-stage-to-portal-status');
const CONSTANTS = require('../../constants');

describe('mapTfmDealStageToPortalStatus', () => {
  describe('when TFM status is `UKEF_APPROVED_WITH_CONDITIONS`', () => {
    it('should return portal BSS status `Approved by UKEF (with conditions)`', () => {
      const result = mapTfmDealStageToPortalStatus('Approved (with conditions)');
      expect(result).toEqual(CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);
    });
  });

  describe('when TFM status is `UKEF_APPROVED_WITHOUT_CONDITIONS`', () => {
    it('should return portal status `Approved by UKEF (without conditions)`', () => {
      const result = mapTfmDealStageToPortalStatus('Approved (without conditions)');
      expect(result).toEqual(CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS);
    });
  });

  describe('when TFM status is `DECLINED`', () => {
    it('should return portal status `Rejected by UKEF`', () => {
      const result = mapTfmDealStageToPortalStatus('Declined');
      expect(result).toEqual(CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_REFUSED);
    });
  });

  describe('when TFM status is not recognised', () => {
    it('should return null', () => {
      const result = mapTfmDealStageToPortalStatus('invalid status');
      expect(result).toEqual(null);
    });
  });
});
