const { FACILITY_TYPE, FACILITY_STAGE } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');

const page = 'includes/application-preview/facilities.njk';
const render = pageRenderer(page);

const issuedCashFacility = { heading: FACILITY_TYPE.CASH, facilityId: 'issuedCash', stage: FACILITY_STAGE.ISSUED };
const unissuedCashFacility = { heading: FACILITY_TYPE.CASH, facilityId: 'unissuedCash', stage: FACILITY_STAGE.UNISSUED };
const issuedContingentFacility = { heading: FACILITY_TYPE.CONTINGENT, facilityId: 'issuedContingent', stage: FACILITY_STAGE.ISSUED };
const unissuedContingentFacility = { heading: FACILITY_TYPE.CONTINGENT, facilityId: 'unissuedContingent', stage: FACILITY_STAGE.UNISSUED };

const params = {
  facilities: {
    data: [issuedCashFacility, unissuedCashFacility, issuedContingentFacility, unissuedContingentFacility],
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

      wrapper.expectElement(makeAChangeButtonSelector(issuedCashFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(unissuedCashFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(issuedContingentFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(unissuedContingentFacility.facilityId)).notToExist();
    });

    it('should render on the issued facilities when showFacilityAmendmentButton is true', () => {
      wrapper = render({
        ...params,
        canIssuedFacilitiesBeAmended: true,
      });

      wrapper.expectElement(makeAChangeButtonSelector(issuedCashFacility.facilityId)).toExist();
      wrapper.expectText(makeAChangeButtonSelector(issuedCashFacility.facilityId)).toRead('Make a change');

      wrapper.expectElement(makeAChangeButtonSelector(issuedContingentFacility.facilityId)).toExist();
      wrapper.expectText(makeAChangeButtonSelector(issuedContingentFacility.facilityId)).toRead('Make a change');
    });

    it('should not render on the unissued facilities when showFacilityAmendmentButton is true', () => {
      wrapper = render({
        ...params,
        canIssuedFacilitiesBeAmended: true,
      });

      wrapper.expectElement(makeAChangeButtonSelector(unissuedCashFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(unissuedContingentFacility.facilityId)).notToExist();
    });
  });
});
