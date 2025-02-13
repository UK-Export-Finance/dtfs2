import relative from '../../../relativeURL';
import { caseSubNavigation, continueButton, errorSummary } from '../../../partials';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import caseDealPage from '../../../pages/caseDealPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { oneMonth, today, tomorrow } from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, UNDERWRITER_MANAGER_DECISIONS, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';
import { NOT_ADDED } from '../../../../fixtures/constants';
import pages from '../../../pages';

context('Amendments underwriting - add banks decision - withdraw', () => {
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

  it('should submit an amendment request', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

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

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: tomorrow.day, month: today.monthLong, year: today.year });

    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should take you to `Add underwriter decision - Facility value` page if a decision has been made for Cover End Date', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
  });

  it('should take you to `Add conditions, reasons and comments` page if a decision has been made for Facility Value and Cover End Date', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.dayLong);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.dd_MMMM_yyyy);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentsManagersDecisionConditions().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionReasons().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionComments().should('be.visible');

    continueButton().should('be.visible');
  });

  it('should take you to `Add conditions, reasons and comments` summary page', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    cy.keyboardInput(amendmentsPage.amendmentsManagersDecisionConditions(), 'This is a list of conditions');
    cy.keyboardInput(amendmentsPage.amendmentsManagersDecisionReasons(), 'This is the reason for declining the amendment');
    cy.keyboardInput(amendmentsPage.amendmentsManagersDecisionComments(), 'This is a comment visible only to UKEF staff');

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');
    amendmentsPage.amendmentSendToBankButton().should('be.visible');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.dayLong);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.dd_MMMM_yyyy);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentSendToBankButton().click();
  });

  it('should show add decision button if logged in as PIM user', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');
    amendmentsPage.amendmentBankChoiceHeading().contains("What is the bank's decision?");
  });

  it('should take you to request date page if selecting withdraw on bank decision choice page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.amendmentBankChoiceWithdrawRadio().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.amendmentBankDecisionReceivedDateHeading().contains('What date did UKEF receive the bank’s decision?');
    amendmentsPage.amendmentBankDecisionReceivedDateHint().contains('For example, 31 3 1980');

    cy.completeDateFormFields({ idPrefix: 'amendment--bank-decision-date', day: '05', month: '05', year: '22' });

    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--bank-decision-date', day: '05', month: '05', year: '2 022' });

    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--bank-decision-date', day: '05', month: '05', year: '2 22' });

    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');

    cy.completeDateFormFields({ idPrefix: 'amendment--bank-decision-date', day: '05', month: '06', year: '2022' });

    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/check-answers');
  });

  it('should take you to check answers page if date entered correctly (and not effective date)', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/check-answers');
    amendmentsPage.amendmentBankDecisionCheckAnswersHeading().contains('Check your answers');
    amendmentsPage.amendmentBankDecisionCheckDecisionHeading().contains("Bank's decision");
    amendmentsPage.amendmentBankDecisionCheckDecisionValue().contains('Withdraw');
    amendmentsPage.amendmentBankDecisionCheckDecisionLink().contains('Change');

    amendmentsPage.amendmentBankDecisionCheckReceivedHeading().contains('Date decision received');
    amendmentsPage.amendmentBankDecisionCheckReceivedValue().contains('05 Jun 2022');
    amendmentsPage.amendmentBankDecisionCheckReceivedLink().contains('Change');

    amendmentsPage.amendmentBankDecisionCheckEffectiveHeading().should('not.exist');
    amendmentsPage.amendmentBankDecisionCheckEffectiveValue().should('not.exist');
    amendmentsPage.amendmentBankDecisionCheckEffectiveLink().should('not.exist');
  });

  it('should take you to individual pages with fields checked or filled when pressing change link', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/check-answers');
    amendmentsPage.amendmentBankDecisionCheckDecisionLink().click();

    cy.url().should('contain', '/banks-decision');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/check-answers');
    amendmentsPage.amendmentBankDecisionCheckReceivedLink().click();

    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage
      .amendmentBankDecisionReceivedDateDay()
      .invoke('attr', 'value')
      .then((value) => {
        expect(value).to.equal('05');
      });
    amendmentsPage
      .amendmentBankDecisionReceivedDateMonth()
      .invoke('attr', 'value')
      .then((value) => {
        expect(value).to.equal('06');
      });
    amendmentsPage
      .amendmentBankDecisionReceivedDateYear()
      .invoke('attr', 'value')
      .then((value) => {
        expect(value).to.equal('2022');
      });

    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/check-answers');
  });

  it('should take you to underwriting page once submit bank decision.  Amendments page should show withdrawn badge for banks decision', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/check-answers');
    cy.clickContinueButton();

    caseSubNavigation.dealLink().click();
    caseDealPage.dealFacilitiesTable.row(dealFacilities[0]._id).facilityId().click();
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).bankDecisionTag().contains('Withdrawn');
    amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', NOT_ADDED.DASH);
  });
});

context('Amendments underwriting - add banks decision - change from proceed to withdraw', () => {
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

  it('should submit an amendment request', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

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

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: tomorrow.day, month: today.monthLong, year: today.year });

    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should take you to `Add underwriter decision - Facility value` page if a decision has been made for Cover End Date', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
  });

  it('should take you to `Add conditions, reasons and comments` page if a decision has been made for Facility Value and Cover End Date', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.dayLong);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.dd_MMMM_yyyy);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentsManagersDecisionConditions().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionReasons().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionComments().should('be.visible');

    continueButton().should('be.visible');
  });

  it('should take you to `Add conditions, reasons and comments` summary page', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    cy.keyboardInput(amendmentsPage.amendmentsManagersDecisionConditions(), 'This is a list of conditions');
    cy.keyboardInput(amendmentsPage.amendmentsManagersDecisionReasons(), 'This is the reason for declining the amendment');
    cy.keyboardInput(amendmentsPage.amendmentsManagersDecisionComments(), 'This is a comment visible only to UKEF staff');

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');
    amendmentsPage.amendmentSendToBankButton().should('be.visible');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.dayLong);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.dd_MMMM_yyyy);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentSendToBankButton().click();
  });

  it('should take you to check your answers page after completing form for proceed as bank decision', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');
    amendmentsPage.amendmentBankChoiceProceedRadio().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/received-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--bank-decision-date', day: '05', month: '06', year: '2022' });

    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/effective-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--bank-decision-date', day: '05', month: '06', year: '2022' });
    cy.clickContinueButton();

    cy.url().should('contain', '/banks-decision/check-answers');
  });

  it('should take you to check answers page from received page after changing decision to withdraw without effective date', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/effective-date');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/check-answers');

    amendmentsPage.amendmentBankDecisionCheckDecisionValue().contains('Proceed');
    amendmentsPage.amendmentBankDecisionCheckDecisionLink().click();
    amendmentsPage.amendmentBankChoiceWithdrawRadio().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/check-answers');

    amendmentsPage.amendmentBankDecisionCheckEffectiveHeading().should('not.exist');
    amendmentsPage.amendmentBankDecisionCheckEffectiveValue().should('not.exist');
    amendmentsPage.amendmentBankDecisionCheckEffectiveLink().should('not.exist');
  });

  it('should take you to underwriting page once submit bank decision.  Amendments page should show withdrawn badge for banks decision', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/received-date');
    cy.clickContinueButton();
    cy.url().should('contain', '/banks-decision/check-answers');
    cy.clickContinueButton();

    caseSubNavigation.dealLink().click();
    caseDealPage.dealFacilitiesTable.row(dealFacilities[0]._id).facilityId().click();
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).bankDecisionTag().contains('Withdrawn');
    amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', NOT_ADDED.DASH);
  });
});
