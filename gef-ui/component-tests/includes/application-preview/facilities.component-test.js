const { FACILITY_TYPE, FACILITY_STAGE } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');

const page = 'includes/application-preview/facilities.njk';
const render = pageRenderer(page);

const params = {
  facilities: {
    data: [
      { heading: FACILITY_TYPE.CASH, facilityId: 'issuedCash', stage: FACILITY_STAGE.ISSUED },
      { heading: FACILITY_TYPE.CASH, facilityId: 'unissuedCash', stage: FACILITY_STAGE.UNISSUED },
      { heading: FACILITY_TYPE.CONTINGENT, facilityId: 'issuedContingent', stage: FACILITY_STAGE.ISSUED },
      { heading: FACILITY_TYPE.CONTINGENT, facilityId: 'unissuedContingent', stage: FACILITY_STAGE.UNISSUED },
    ],
  },
};

describe(page, () => {
  let wrapper;

  describe("'Make a change' button", () => {
    const makeAChangeButtonSelector = (facilityId) => `[data-cy="facility-${facilityId}-make-change-button"]`;

    it('should not be rendered when showFacilityAmendmentButton is false', () => {
      wrapper = render({
        ...params,
        canIssuedFacilitiesBeAmended: false,
      });

      wrapper.expectElement(makeAChangeButtonSelector('issuedCash')).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector('unissuedCash')).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector('issuedContingent')).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector('unissuedContingent')).notToExist();
    });

    it('should not be rendered when showFacilityAmendmentButton is not passed in', () => {
      wrapper = render(params);

      wrapper.expectElement(makeAChangeButtonSelector('issuedCash')).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector('unissuedCash')).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector('issuedContingent')).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector('unissuedContingent')).notToExist();
    });

    it('should be rendered on the issued facilities only when showFacilityAmendmentButton is true', () => {
      wrapper = render({
        ...params,
        canIssuedFacilitiesBeAmended: true,
      });

      wrapper.expectElement(makeAChangeButtonSelector('issuedCash')).toExist();
      wrapper.expectText(makeAChangeButtonSelector('issuedCash')).toRead('Make a change');

      wrapper.expectElement(makeAChangeButtonSelector('issuedContingent')).toExist();
      wrapper.expectText(makeAChangeButtonSelector('issuedContingent')).toRead('Make a change');

      wrapper.expectElement(makeAChangeButtonSelector('unissuedCash')).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector('unissuedContingent')).notToExist();
    });
  });
});
