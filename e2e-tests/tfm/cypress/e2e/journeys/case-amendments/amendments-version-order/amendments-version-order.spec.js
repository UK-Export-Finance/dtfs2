import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';

import { PIM_USER_1, UNDERWRITER_MANAGER_1, UNDERWRITER_MANAGER_DECISIONS, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';
import pages from '../../../pages';
import { oneMonth, threeMonths, threeYears, today, tomorrow } from '../../../../../../e2e-fixtures/dateConstants';

context('Amendments underwriting - amendments should be in correct order of versions (including when withdrawn)', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
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

  it('should submit and complete and amendment', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    cy.keyboardInput(amendmentsPage.amendmentRequestDayInput(), today.day);
    cy.keyboardInput(amendmentsPage.amendmentRequestMonthInput(), today.month);
    cy.keyboardInput(amendmentsPage.amendmentRequestYearInput(), today.year);
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

    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateDayInput(), tomorrow.day);
    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateMonthInput(), today.month);
    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateYearInput(), today.year);
    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();

    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.day);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.ddMMMMyyyy);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');

    amendmentsPage.amendmentBankChoiceProceedRadio().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/received-date');

    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateDay(), '05');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateMonth(), '06');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateYear(), '2022');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/effective-date');

    cy.keyboardInput(amendmentsPage.amendmentBankDecisionEffectiveDateDay(), '05');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionEffectiveDateMonth(), '06');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionEffectiveDateYear(), '2022');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/check-answers');

    cy.clickContinueButton();
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

    cy.keyboardInput(amendmentsPage.amendmentRequestDayInput(), today.day);
    cy.keyboardInput(amendmentsPage.amendmentRequestMonthInput(), today.month);
    cy.keyboardInput(amendmentsPage.amendmentRequestYearInput(), today.year);
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

    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateDayInput(), threeMonths.day);
    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateMonthInput(), threeMonths.month);
    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateYearInput(), threeMonths.year);
    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '1234');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();

    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(2).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    amendmentsPage.amendmentDetails.row(2).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');

    amendmentsPage.amendmentBankChoiceWithdrawRadio().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/received-date');

    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateDay(), '05');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateMonth(), '06');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateYear(), '2022');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/check-answers');

    cy.clickContinueButton();
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

    cy.keyboardInput(amendmentsPage.amendmentRequestDayInput(), today.day);
    cy.keyboardInput(amendmentsPage.amendmentRequestMonthInput(), today.month);
    cy.keyboardInput(amendmentsPage.amendmentRequestYearInput(), today.year);
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

    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateDayInput(), threeYears.day);
    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateMonthInput(), threeYears.month);
    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateYearInput(), threeYears.year);
    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '12345');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();

    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(3).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    amendmentsPage.amendmentDetails.row(3).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');

    amendmentsPage.amendmentBankChoiceProceedRadio().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/received-date');

    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateDay(), '05');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateMonth(), '06');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionReceivedDateYear(), '2022');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/effective-date');

    cy.keyboardInput(amendmentsPage.amendmentBankDecisionEffectiveDateDay(), '05');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionEffectiveDateMonth(), '06');
    cy.keyboardInput(amendmentsPage.amendmentBankDecisionEffectiveDateYear(), '2022');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/check-answers');

    cy.clickContinueButton();
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
