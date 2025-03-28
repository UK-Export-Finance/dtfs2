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
  userRoles: ['maker'],
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

      wrapper.expectElement(makeAChangeButtonSelector(issuedCashFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(unissuedCashFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(issuedContingentFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(unissuedContingentFacility.facilityId)).notToExist();
    });

    it('should not be rendered when showFacilityAmendmentButton is not passed in', () => {
      wrapper = render(params);

      wrapper.expectElement(makeAChangeButtonSelector(issuedCashFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(unissuedCashFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(issuedContingentFacility.facilityId)).notToExist();
      wrapper.expectElement(makeAChangeButtonSelector(unissuedContingentFacility.facilityId)).notToExist();
    });

    describe('when showFacilityAmendmentButton is true', () => {
      it('should render on the issued facilities with the correct link', () => {
        const dealId = '123';

        wrapper = render({
          ...params,
          canIssuedFacilitiesBeAmended: true,
          dealId,
        });

        const expectedButtonText = 'Make a change';

        wrapper.expectPrimaryButton(makeAChangeButtonSelector(issuedCashFacility.facilityId)).toLinkTo(undefined, expectedButtonText);
        wrapper.expectPrimaryButton(makeAChangeButtonSelector(issuedContingentFacility.facilityId)).toLinkTo(undefined, expectedButtonText);
      });

      it('should not render on the unissued facilities', () => {
        wrapper = render({
          ...params,
          canIssuedFacilitiesBeAmended: true,
        });

        wrapper.expectElement(makeAChangeButtonSelector(unissuedCashFacility.facilityId)).notToExist();
        wrapper.expectElement(makeAChangeButtonSelector(unissuedContingentFacility.facilityId)).notToExist();
      });
    });
  });

  describe('Amendment details', () => {
    issuedCashFacility.isFacilityWithAmendmentInProgress = true;
    const amendmentInProgress = `[data-cy="amendment-in-progress"]`;

    it('should be rendered when portalAmendment is in progress and login as a maker', () => {
      wrapper = render(params);

      wrapper.expectElement(amendmentInProgress).toExist();
      wrapper.expectText(amendmentInProgress).toRead('See details');
    });

    it('should be rendered when portalAmendment is in progress and login as a checker', () => {
      wrapper = render({ ...params, userRoles: ['checker'] });

      wrapper.expectElement(amendmentInProgress).toExist();
      wrapper.expectText(amendmentInProgress).toRead('Check amendment details before submitting to UKEF');
    });

    it('should not be rendered when portalAmendment is not in progress', () => {
      issuedCashFacility.isFacilityWithAmendmentInProgress = false;
      wrapper = render({
        ...params,
      });

      wrapper.expectElement(amendmentInProgress).notToExist();
    });
  });
});
