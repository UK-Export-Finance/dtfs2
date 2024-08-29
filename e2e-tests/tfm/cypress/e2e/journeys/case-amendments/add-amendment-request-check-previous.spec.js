import relative from '../../relativeURL';
import { errorSummary } from '../../partials';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';
import pages from '../../pages';

const tfmFacilityEndDateEnabled = Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'true';

context('Amendments - should not allow amendments to have same coverEndDate/value if previously submitted', () => {
  let dealId;
  const dealFacilities = [];
  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0], mockFacilities[1]], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, PIM_USER_1);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should submit an automatic amendment request', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    // automatic approval
    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-effective-date');

    amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.tomorrowMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.tomorrowYear);
    cy.clickContinueButton();

    if (tfmFacilityEndDateEnabled) {
      amendmentsPage.navigateThroughFacilityEndDateAmendmentPages();
    }

    cy.url().should('contain', 'facility-value');

    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');
    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should throw an error if same facility coverEndDate and value when previous amendment was automatic and submit when different', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.tomorrowMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.tomorrowYear);
    cy.clickContinueButton();

    errorSummary().contains('The new cover end date cannot be the same as the current cover end date');
    amendmentsPage.errorMessage().contains('The new cover end date cannot be the same as the current cover end date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.threeDaysDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.threeDaysMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.threeDaysYear);
    cy.clickContinueButton();

    if (tfmFacilityEndDateEnabled) {
      amendmentsPage.navigateThroughFacilityEndDateAmendmentPages();
    }

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

    cy.clickContinueButton();

    errorSummary().contains('The new facility value cannot be the same as the current facility value');
    amendmentsPage.errorMessage().contains('The new facility value cannot be the same as the current facility value');

    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('1234');

    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should accept the facility value and decline cover end date and bank should proceed', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentsManagersDecisionConditions().clear().focused().type('This is a list of conditions');
    amendmentsPage.amendmentsManagersDecisionReasons().clear().focused().type('This is the reason for declining the amendment');
    amendmentsPage.amendmentsManagersDecisionComments().clear().focused().type('This is a comment visible only to UKEF staff');

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');
    amendmentsPage.amendmentSendToBankButton().should('be.visible');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    amendmentsPage.amendmentBankChoiceProceedRadio().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2022');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.amendmentBankDecisionEffectiveDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionEffectiveDateYear().clear().focused().type('2022');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/check-answers');
    cy.clickContinueButton();
  });

  it('should throw an error if keeping the same facility value.  should submit amendment if same coverEndDate but different facility value', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.threeYearsDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.threeYearsMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.threeYearsYear);
    cy.clickContinueButton();

    if (tfmFacilityEndDateEnabled) {
      amendmentsPage.navigateThroughFacilityEndDateAmendmentPages();
    }

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('1234');

    cy.clickContinueButton();

    errorSummary().contains('The new facility value cannot be the same as the current facility value');
    amendmentsPage.errorMessage().contains('The new facility value cannot be the same as the current facility value');

    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('12345');

    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should accept the coverEndDate and accept facility value and bank should withdraw', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentsManagersDecisionConditions().clear().focused().type('This is a list of conditions');
    amendmentsPage.amendmentsManagersDecisionComments().clear().focused().type('This is a comment visible only to UKEF staff');

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');
    amendmentsPage.amendmentSendToBankButton().should('be.visible');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    amendmentsPage.amendmentBankChoiceWithdrawRadio().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2022');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/check-answers');
    cy.clickContinueButton();
  });

  it('should submit an amendment without errors with same values as last request as was withdrawn by bank', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.threeDaysDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.threeDaysMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.threeDaysYear);
    cy.clickContinueButton();

    if (tfmFacilityEndDateEnabled) {
      amendmentsPage.navigateThroughFacilityEndDateAmendmentPages();
    }

    cy.url().should('contain', 'facility-value');

    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('1234');

    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });
});
