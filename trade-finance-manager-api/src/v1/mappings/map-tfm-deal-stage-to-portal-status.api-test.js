const mapTfmDealStageToPortalStatus = require('./map-tfm-deal-stage-to-portal-status');
const CONSTANTS = require('../../constants');

describe('mapTfmDealStageToPortalStatus', () => {
  describe('when TFM status is `UKEF_APPROVED_WITH_CONDITIONS`', () => {
    describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
      it('should return portal BSS status UKEF_APPROVED_WITH_CONDITIONS', () => {
        const result = mapTfmDealStageToPortalStatus(
          CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          'Approved (with conditions)',
        );

        expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.UKEF_APPROVED_WITH_CONDITIONS);
      });
    });

    describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
      it('should return portal GEF status UKEF_APPROVED_WITH_CONDITIONS', () => {
        const result = mapTfmDealStageToPortalStatus(
          CONSTANTS.DEALS.DEAL_TYPE.GEF,
          'Approved (with conditions)',
        );

        expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_APPROVED_WITH_CONDITIONS);
      });
    });
  });

  describe('when TFM status is `APPROVED_WITHOUT_CONDITIONS`', () => {
    describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
      it('should return portal BSS status APPROVED_WITHOUT_CONDITIONS', () => {
        const result = mapTfmDealStageToPortalStatus(
          CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          'Approved (without conditions)',
        );

        expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.APPROVED_WITHOUT_CONDITIONS);
      });
    });

    describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
      it('should return portal GEF status APPROVED_WITHOUT_CONDITIONS', () => {
        const result = mapTfmDealStageToPortalStatus(
          CONSTANTS.DEALS.DEAL_TYPE.GEF,
          'Approved (without conditions)',
        );

        expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_APPROVED_WITHOUT_CONDITIONS);
      });
    });
  });

  describe('when TFM status is `DECLINED`', () => {
    describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
      it('should return portal BSS status DECLINED', () => {
        const result = mapTfmDealStageToPortalStatus(
          CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          'Declined',
        );

        expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.UKEF_REFUSED);
      });
    });

    describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
      it('should return portal GEF status DECLINED', () => {
        const result = mapTfmDealStageToPortalStatus(
          CONSTANTS.DEALS.DEAL_TYPE.GEF,
          'Declined',
        );

        expect(result).toEqual(CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_REFUSED);
      });
    });
  });

  describe('when TFM status is not recognised', () => {
    it('should return null', () => {
      const result = mapTfmDealStageToPortalStatus(
        CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        'invalid status',
      );

      expect(result).toEqual(null);
    });
  });

  describe('when dealType is not recognised', () => {
    it('should return null', () => {
      const result = mapTfmDealStageToPortalStatus(
        'invalid deal type',
        'Declined',
      );

      expect(result).toEqual(null);
    });
  });
});
