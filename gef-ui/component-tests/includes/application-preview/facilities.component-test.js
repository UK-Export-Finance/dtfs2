const { FACILITY_TYPE, FACILITY_STAGE, ROLES } = require('@ukef/dtfs2-common');
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
  userRoles: [ROLES.MAKER],
  dealId: '123',
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
    const url = `/gef/application-details/${params.dealId}/amendment-details`;

    it(`should be rendered when facility has an amendment in progress and the user is logged in as a maker`, () => {
      const urlText = 'See details';
      wrapper = render(params);

      wrapper.expectElement(amendmentInProgress).toExist();
      wrapper.expectLink(amendmentInProgress).toLinkTo(url, urlText);
      wrapper.expectText(amendmentInProgress).toRead(urlText);
    });

    it('should be rendered when facility has an amendment in progress and the user is logged in as a checker', () => {
      const userRoles = [ROLES.CHECKER];
      const urlText = 'Check amendment details before submitting to UKEF';
      wrapper = render({ ...params, userRoles });

      wrapper.expectElement(amendmentInProgress).toExist();
      wrapper.expectLink(amendmentInProgress).toLinkTo(url, urlText);
      wrapper.expectText(amendmentInProgress).toRead(urlText);
    });

    it('should be rendered when facility does not have an amendment in progress', () => {
      issuedCashFacility.isFacilityWithAmendmentInProgress = false;
      wrapper = render({
        ...params,
      });

      wrapper.expectElement(amendmentInProgress).notToExist();
    });
  });
});
