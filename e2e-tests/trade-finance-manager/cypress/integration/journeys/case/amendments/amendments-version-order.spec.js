import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, UNDERWRITER_MANAGER_DECISIONS } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import pages from '../../../pages';

context('Amendments underwriting - amendments should be in correct order of versions (including when withdrawn)', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('should submit and complete and amendment', () => {
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
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();

    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', '20 October 2022');

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions/summary');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');

    amendmentsPage.amendmentBankChoiceProceedRadio().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/received-date');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2022');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/effective-date');

    amendmentsPage.amendmentBankDecisionEffectiveDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionEffectiveDateYear().clear().focused().type('2022');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/check-answers');

    amendmentsPage.underWritingSubmitButton().click();
  });

  it('should show the correct details for amendment 1 on facility amendments page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).heading().contains('Amendment 1');
    amendmentsPage.amendmentDetails.row(1).bankDecisionTag().contains('Proceed');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().contains('123');
  });

  it('should submit and complete and withdraw a second amendment', () => {
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
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.threeMonthsDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.threeMonthsMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.threeMonthsYear);
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('1234');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();

    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(2).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    amendmentsPage.amendmentDetails.row(2).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions/summary');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');

    amendmentsPage.amendmentBankChoiceWithdrawRadio().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/received-date');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2022');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/check-answers');

    amendmentsPage.underWritingSubmitButton().click();
  });

  it('should show the correct details for amendment 2 on facility amendments page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).heading().contains('Amendment 1');
    amendmentsPage.amendmentDetails.row(1).bankDecisionTag().contains('Proceed');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().contains('123');

    amendmentsPage.amendmentDetails.row(2).heading().contains('Amendment 2');
    amendmentsPage.amendmentDetails.row(2).bankDecisionTag().contains('Withdrawn');
    amendmentsPage.amendmentDetails.row(2).newFacilityValue().contains('1,234');
  });

  it('should submit and complete a third amendment', () => {
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
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.threeMonthsDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.threeMonthsMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.threeMonthsYear);
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('12345');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();

    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(3).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    amendmentsPage.amendmentDetails.row(3).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions/summary');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');

    amendmentsPage.amendmentBankChoiceProceedRadio().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/received-date');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2022');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/effective-date');

    amendmentsPage.amendmentBankDecisionEffectiveDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionEffectiveDateYear().clear().focused().type('2022');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/check-answers');

    amendmentsPage.underWritingSubmitButton().click();
  });

  it('should show the correct details for amendment 3 on facility amendments page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).heading().contains('Amendment 1');
    amendmentsPage.amendmentDetails.row(1).bankDecisionTag().contains('Proceed');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().contains('123');

    amendmentsPage.amendmentDetails.row(2).heading().contains('Amendment 2');
    amendmentsPage.amendmentDetails.row(2).bankDecisionTag().contains('Withdrawn');
    amendmentsPage.amendmentDetails.row(2).newFacilityValue().contains('1,234');

    amendmentsPage.amendmentDetails.row(3).heading().contains('Amendment 3');
    amendmentsPage.amendmentDetails.row(3).bankDecisionTag().contains('Proceed');
    amendmentsPage.amendmentDetails.row(3).newFacilityValue().contains('12,345');
  });
});
