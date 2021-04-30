const mapTfmDealStageToPortalStatus = require('./map-tfm-deal-stage-to-portal-status');
const CONSTANTS = require('../../constants');

describe('mapTfmDealStageToPortalStatus', () => {
  describe('when TFM status is `APPROVED_WITH_CONDITIONS`', () => {
    it('should return portal status APPROVED_WITH_CONDITIONS', () => {
      const result = mapTfmDealStageToPortalStatus('Approved with conditions');

      expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL.APPROVED_WITH_CONDITIONS);
    });
  });

  describe('when TFM status is `APPROVED_WITHOUT_CONDITIONS`', () => {
    it('should return portal status APPROVED_WITHOUT_CONDITIONS', () => {
      const result = mapTfmDealStageToPortalStatus('Approved without conditions');

      expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL.APPROVED_WITHOUT_CONDITIONS);
    });
  });

  describe('when TFM status is `DECLINED`', () => {
    it('should return portal status DECLINED', () => {
      const result = mapTfmDealStageToPortalStatus('Declined');

      expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL.DECLINED);
    });
  });
});
