import { format } from 'date-fns';
import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mock-gef-deals';
import { DEAL_TYPE } from '../../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import { DATE_FORMATS } from '../../../../../fixtures/constants';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { today } from '../../../../../../../e2e-fixtures/dateConstants';

context('Amendments - GEF deal add multiple consecutive amendments impacting facility end date values - feature flag enabled', () => {
  let dealId;
  let facility;

  const Date1 = new Date('2024-01-01');
  const Date2 = new Date('2024-02-02');
  const Date3 = new Date('2024-03-03');
  const Date4 = new Date('2024-04-04');
  const Date5 = new Date('2024-05-05');

  const currentDateFormat = DATE_FORMATS.FULL;
  const checkAnswersDateFormat = DATE_FORMATS.SHORT;
  const facilityPageDateFormat = DATE_FORMATS.SINGLE_DIGIT_DAY_LONG;

  const facilityWithBankReviewDate = {
    ...anIssuedCashFacility(),
    isUsingFacilityEndDate: false,
    facilityEndDate: undefined,
    bankReviewDate: Date1,
  };

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      // updates a gef deal so has relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [facilityWithBankReviewDate], BANK1_MAKER1).then((createdFacility) => {
        facility = createdFacility.details;
      });

      cy.submitDeal(dealId, DEAL_TYPE.GEF, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    cy.deleteFacility(facility._id, BANK1_MAKER1);
  });

  it('should display the current bank review date details from the facility snapshot in the Details tab', () => {
    facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
    facilityPage.facilityBankReviewDate().should('have.text', format(Date1, facilityPageDateFormat));
    facilityPage.facilityFacilityEndDate().should('not.exist');
  });

  describe('when amending the bank review date for the first time', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true, newCoverEndDate: Date1 });
      amendmentsPage.isUsingFacilityEndDateNo().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'bank-review-date');
      amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', format(Date1, currentDateFormat));
      amendmentsPage.amendmentBankReviewDateDetails().should('exist');

      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateDayInput(), format(Date2, 'd'));
      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateMonthInput(), format(Date2, 'M'));
      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateYearInput(), format(Date2, 'yyyy'));
      cy.clickContinueButton();
    });

    it('should display the correct values on the check answers page and facility page', () => {
      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
      amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', format(Date2, checkAnswersDateFormat));
      amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');

      cy.clickContinueButton();

      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
      facilityPage.facilityBankReviewDate().should('have.text', format(Date2, facilityPageDateFormat));
      facilityPage.facilityFacilityEndDate().should('not.exist');
    });
  });

  describe('when amending the bank review date for a second time', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true, newCoverEndDate: Date2 });
      amendmentsPage.isUsingFacilityEndDateNo().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'bank-review-date');
      amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', format(Date2, currentDateFormat));
      amendmentsPage.amendmentBankReviewDateDetails().should('exist');

      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateDayInput(), format(Date3, 'd'));
      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateMonthInput(), format(Date3, 'M'));
      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateYearInput(), format(Date3, 'yyyy'));
      cy.clickContinueButton();
    });

    it('should display the correct values on the check answers page and facility page', () => {
      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
      amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', format(Date3, checkAnswersDateFormat));
      amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');

      cy.clickContinueButton();

      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
      facilityPage.facilityBankReviewDate().should('have.text', format(Date3, facilityPageDateFormat));
      facilityPage.facilityFacilityEndDate().should('not.exist');
    });
  });

  describe('when amending the facility end date for the first time', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true, newCoverEndDate: Date3 });
      amendmentsPage.isUsingFacilityEndDateYes().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
      amendmentsPage.amendmentCurrentFacilityEndDate().should('have.text', 'Not provided');
      amendmentsPage.amendmentFacilityEndDateDetails().should('exist');

      cy.keyboardInput(amendmentsPage.amendmentFacilityEndDateDayInput(), format(Date4, 'd'));
      cy.keyboardInput(amendmentsPage.amendmentFacilityEndDateMonthInput(), format(Date4, 'M'));
      cy.keyboardInput(amendmentsPage.amendmentFacilityEndDateYearInput(), format(Date4, 'yyyy'));
      cy.clickContinueButton();
    });

    it('should display the correct values on the check answers page and facility page', () => {
      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'Yes');
      amendmentsPage.amendmentAnswerFacilityEndDate().should('have.text', format(Date4, checkAnswersDateFormat));
      amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');

      cy.clickContinueButton();

      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'Yes');
      facilityPage.facilityFacilityEndDate().should('have.text', format(Date4, facilityPageDateFormat));
      facilityPage.facilityBankReviewDate().should('not.exist');
    });
  });

  describe('when amending the facility end date for a second time', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true, newCoverEndDate: Date4 });

      amendmentsPage.isUsingFacilityEndDateNo().click();
      cy.clickContinueButton();

      // There should no longer be a current bank review date value, as the last amendment had a facility end date.
      // We reset it to bank review date here.
      amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', 'Not provided');
      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateDayInput(), format(Date5, 'd'));
      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateMonthInput(), format(Date5, 'M'));
      cy.keyboardInput(amendmentsPage.amendmentBankReviewDateYearInput(), format(Date5, 'yyyy'));
      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDateChangeLink().click();

      amendmentsPage.isUsingFacilityEndDateYes().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
      amendmentsPage.amendmentCurrentFacilityEndDate().should('have.text', format(Date4, DATE_FORMATS.FULL));
      amendmentsPage.amendmentFacilityEndDateDetails().should('exist');

      cy.keyboardInput(amendmentsPage.amendmentFacilityEndDateDayInput(), format(Date5, 'd'));
      cy.keyboardInput(amendmentsPage.amendmentFacilityEndDateMonthInput(), format(Date5, 'M'));
      cy.keyboardInput(amendmentsPage.amendmentFacilityEndDateYearInput(), format(Date5, 'yyyy'));
      cy.clickContinueButton();
    });

    it('should display the correct values on the check answers page and facility page', () => {
      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'Yes');
      amendmentsPage.amendmentAnswerFacilityEndDate().should('have.text', format(Date5, checkAnswersDateFormat));
      amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');

      cy.clickContinueButton();

      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'Yes');
      facilityPage.facilityFacilityEndDate().should('have.text', format(Date5, facilityPageDateFormat));
      facilityPage.facilityBankReviewDate().should('not.exist');
    });
  });

  describe('after submitting further amendments that do not change the facility end date or bank review date values', () => {
    beforeEach(() => {
      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().click();

      cy.url().should('contain', 'request-date');
      cy.keyboardInput(amendmentsPage.amendmentRequestDayInput(), today.day);
      cy.keyboardInput(amendmentsPage.amendmentRequestMonthInput(), today.month);
      cy.keyboardInput(amendmentsPage.amendmentRequestYearInput(), today.year);
      cy.clickContinueButton();

      cy.url().should('contain', 'request-approval');
      amendmentsPage.amendmentRequestApprovalNo().check();
      cy.clickContinueButton();

      cy.url().should('contain', 'amendment-effective-date');
      cy.keyboardInput(amendmentsPage.amendmentEffectiveDayInput(), today.day);
      cy.keyboardInput(amendmentsPage.amendmentEffectiveMonthInput(), today.month);
      cy.keyboardInput(amendmentsPage.amendmentEffectiveYearInput(), today.year);
      cy.clickContinueButton();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentFacilityValueCheckbox().check();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-value');
      cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');
      cy.clickContinueButton();
    });

    it('should continue to display the correct (most recent) amended facility end date details', () => {
      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('not.exist');
      amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');
      amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');

      cy.clickContinueButton();

      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'Yes');
      facilityPage.facilityFacilityEndDate().should('have.text', format(Date5, facilityPageDateFormat));
      facilityPage.facilityBankReviewDate().should('not.exist');
    });
  });
});
