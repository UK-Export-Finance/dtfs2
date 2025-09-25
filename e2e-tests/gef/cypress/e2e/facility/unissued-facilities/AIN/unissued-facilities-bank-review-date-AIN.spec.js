import { threeDaysAgo, threeMonthsOneDay } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import CONSTANTS from '../../../../fixtures/constants';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import unissuedFacilityTable from '../../../pages/unissued-facilities';
import applicationPreview from '../../../pages/application-preview';
import aboutFacilityUnissued from '../../../pages/unissued-facilities-about-facility';
import bankReviewDate from '../../../pages/bank-review-date';

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover } = multipleMockGefFacilities({
  facilityEndDateEnabled: true,
});

context('Unissued Facilities AIN - bank review date page', () => {
  let dealId;
  let token;
  let facilityOneId;

  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        // creates application and inserts facilities and changes status
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          dealId = body._id;
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN_DRAFT).then(() => {
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              facilityOneId = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedContingentFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF);
          });
        });
      });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.login(BANK1_MAKER1);
  });

  describe('Visiting from unissued facilities page', () => {
    const getUnissuedFacilitiesUrl = () => relative(`/gef/application-details/${dealId}/unissued-facilities`);

    beforeEach(() => {
      cy.visit(getUnissuedFacilitiesUrl());
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date', date: threeDaysAgo.date });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeDaysAgo.date });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateNo().click();

      cy.clickContinueButton();
    });

    it('should redirect user to the about unissued facility page when clicking back link', () => {
      const facilityOneBankReviewDateUrl = relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/bank-review-date`);
      cy.url().should('eq', facilityOneBankReviewDateUrl);

      cy.clickBackLink();

      const aboutUnissuedFacilityUrl = relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`);
      cy.url().should('eq', aboutUnissuedFacilityUrl);
    });

    it('should display an error message when the date is entered incorrectly & click continue', () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date', day: 'abcd', month: null, year: null });

      cy.clickContinueButton();

      errorSummary();
      bankReviewDate.bankReviewDateError();
    });

    it('should display an error message when the date is entered incorrectly & click save and return', () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date', day: 'abcd', month: null, year: null });

      cy.clickSaveAndReturnButton();

      errorSummary();
      bankReviewDate.bankReviewDateError();
    });

    it('should redirect user to the unissued facility page when clicking continue', () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date' });

      cy.clickContinueButton();

      cy.url().should('eq', getUnissuedFacilitiesUrl());
    });

    it('should redirect user to the unissued facility page when clicking save and return', () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date' });

      cy.clickSaveAndReturnButton();

      cy.url().should('eq', getUnissuedFacilitiesUrl());
    });
  });

  describe('Visiting from application preview page', () => {
    const getApplicationDetailsUrl = () => relative(`/gef/application-details/${dealId}`);

    beforeEach(() => {
      cy.visit(getApplicationDetailsUrl());
      applicationPreview.facilitySummaryListTable(6).bankReviewDateAction().click();
    });

    it('should redirect user to the about unissued facility page when clicking back link', () => {
      const facilityOneChangeBankReviewDateUrl = relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/bank-review-date/change`);
      cy.url().should('eq', facilityOneChangeBankReviewDateUrl);

      cy.clickBackLink();

      const facilityOneChangeUnissuedFacilityUrl = relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`);
      cy.url().should('eq', facilityOneChangeUnissuedFacilityUrl);
    });

    it('should display an error message when the date is entered incorrectly & click continue', () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date', day: 'abcd', month: null, year: null });
      cy.clickContinueButton();

      errorSummary();
      bankReviewDate.bankReviewDateError();
    });

    it('should display an error message when the date is entered incorrectly & click saveAndReturn', () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date', day: 'abcd', month: null, year: null });
      cy.clickSaveAndReturnButton();

      errorSummary();
      bankReviewDate.bankReviewDateError();
    });

    it('should redirect user to the application details page when clicking continue', () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date' });
      cy.clickContinueButton();

      cy.url().should('eq', getApplicationDetailsUrl());
    });

    it('should redirect user to the application details page when clicking save and return', () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date' });

      cy.clickSaveAndReturnButton();

      cy.url().should('eq', getApplicationDetailsUrl());
    });
  });
});
