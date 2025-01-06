import relative from '../relativeURL';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import cloneGEFDeal from '../pages/clone-deal';
import mandatoryCriteria from '../pages/mandatory-criteria';
import nameApplication from '../pages/name-application';
import applicationDetails from '../pages/application-details';
import { submitButton } from '../partials';
import aboutFacilityUnissued from '../pages/unissued-facilities-about-facility';
import facilityEndDate from '../pages/facility-end-date';
import bankReviewDate from '../pages/bank-review-date';
import { MOCK_APPLICATION_AIN } from '../../fixtures/mocks/mock-deals';
import { anUnissuedCashFacility, anIssuedCashFacility } from '../../../../e2e-fixtures/mock-gef-facilities';
import { DEAL_STATUS, FACILITY_TYPE } from '../../fixtures/constants';

context('Clone version 1 deal to version 1', () => {
  let originalDealId;
  let clonedDealId;
  let token;

  const cashFacilityWithFacilityEndDate = {
    ...anUnissuedCashFacility(),
    isUsingFacilityEndDate: true,
    facilityEndDate: new Date(),
    bankReviewDate: null,
  };
  const cashFacilityWithBankReviewDate = {
    ...anIssuedCashFacility(),
    isUsingFacilityEndDate: false,
    bankReviewDate: new Date(),
    facilityEndDate: null,
  };

  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        // creates application and inserts facilities and changes status
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          originalDealId = body._id;
          cy.apiUpdateApplication(originalDealId, token, MOCK_APPLICATION_AIN).then(() => {
            cy.apiCreateFacility(originalDealId, FACILITY_TYPE.CASH, token).then((facility) => {
              cy.apiUpdateFacility(facility.body.details._id, token, cashFacilityWithFacilityEndDate);
            });
            cy.apiCreateFacility(originalDealId, FACILITY_TYPE.CASH, token).then((facility) => {
              cy.apiUpdateFacility(facility.body.details._id, token, cashFacilityWithBankReviewDate);
            });
            cy.apiSetApplicationStatus(originalDealId, token, DEAL_STATUS.UKEF_ACKNOWLEDGED);
          });
        });
      });
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('cloning a version 1 deal', () => {
    before(() => {
      cy.login(BANK1_MAKER1);

      cy.visit(relative(`/gef/application-details/${originalDealId}`));

      cloneGEFDeal.cloneGefDealLink().click();
      mandatoryCriteria.trueRadio().click();
      cy.clickContinueButton();

      cy.keyboardInput(nameApplication.internalRef(), 'Cloned of v0 deal');
      cy.clickContinueButton();

      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();

      cy.getDealIdFromUrl().then((id) => {
        clonedDealId = id;
      });
    });

    beforeEach(() => {
      cy.login(BANK1_MAKER1);

      cy.visit(relative(`/gef/application-details/${clonedDealId}`));
    });

    it('wipes facility end date & bank review date values', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateValue().should('contain', 'Required');
      applicationDetails.facilitySummaryListTable(1).isUsingFacilityEndDateValue().should('contain', 'Required');

      applicationDetails.facilitySummaryListTable(0).facilityEndDateAction().should('not.exist');
      applicationDetails.facilitySummaryListTable(0).bankReviewDateAction().should('not.exist');
      applicationDetails.facilitySummaryListTable(1).facilityEndDateAction().should('not.exist');
      applicationDetails.facilitySummaryListTable(1).bankReviewDateAction().should('not.exist');

      submitButton().should('not.exist');
    });

    it('isUsingFacilityEndDate is unset on about this facility page', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().click();

      aboutFacilityUnissued.isUsingFacilityEndDateYes().should('not.be.checked');
      aboutFacilityUnissued.isUsingFacilityEndDateNo().should('not.be.checked');
    });

    it('facility table renders "required" for facilityEndDate after isUsingFacilityEndDate is set to true', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().click();
      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();
      cy.clickSaveAndReturnButton();

      applicationDetails.facilitySummaryListTable(0).facilityEndDateValue().should('contain', 'Required');
      submitButton().should('not.exist');
    });

    it('facility end date page does not show pre-populated values', () => {
      applicationDetails.facilitySummaryListTable(0).facilityEndDateAction().click();

      facilityEndDate.facilityEndDateDay().should('have.value', '');
      facilityEndDate.facilityEndDateMonth().should('have.value', '');
      facilityEndDate.facilityEndDateYear().should('have.value', '');
    });

    it('facility table renders "required" for bankReviewDate after isUsingFacilityEndDate is set to false', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().click();
      aboutFacilityUnissued.isUsingFacilityEndDateNo().click();
      cy.clickSaveAndReturnButton();

      applicationDetails.facilitySummaryListTable(0).bankReviewDateValue().should('contain', 'Required');
      submitButton().should('not.exist');
    });

    it('bank review date page does not show pre-populated values', () => {
      applicationDetails.facilitySummaryListTable(0).bankReviewDateAction().click();

      bankReviewDate.bankReviewDateDay().should('have.value', '');
      bankReviewDate.bankReviewDateMonth().should('have.value', '');
      bankReviewDate.bankReviewDateYear().should('have.value', '');
    });
  });
});
