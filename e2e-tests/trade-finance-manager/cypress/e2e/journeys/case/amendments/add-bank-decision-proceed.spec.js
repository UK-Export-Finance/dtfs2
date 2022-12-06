import relative from '../../../relativeURL';
import caseSubNavigation from '../../../partials/caseSubNavigation';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import caseDealPage from '../../../pages/caseDealPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, UNDERWRITER_MANAGER_DECISIONS } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import pages from '../../../pages';
import { CURRENCY } from '../../../../../../e2e-fixtures/constants.fixture';

context('Amendments underwriting - add banks decision - proceed', () => {
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

  it('should display facility details and values on deal and facility page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/deal`));
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains('26 months');
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
    caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
    facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
    facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

    facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
    facilityPage.facilityTenor().contains('26 months');
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
  });

  it('should take you to `Add underwriter decision - Facility value` page if a decision has been made for Cover End Date', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/facility-value/managers-decision');
  });

  it('should take you to `Add conditions, reasons and comments` page if a decision has been made for Facility Value and Cover End Date', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().click();
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentsManagersDecisionConditions().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionReasons().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionComments().should('be.visible');

    amendmentsPage.continueAmendment().should('be.visible');
  });

  it('should take you to `Add conditions, reasons and comments` summary page', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentsManagersDecisionConditions().clear().focused().type('This is a list of conditions');
    amendmentsPage.amendmentsManagersDecisionReasons().clear().focused().type('This is the reason for declining the amendment');
    amendmentsPage.amendmentsManagersDecisionComments().clear().focused().type('This is a comment visible only to UKEF staff');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions/summary');
    amendmentsPage.amendmentSendToBankButton().should('be.visible');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentSendToBankButton().click();
  });

  it('should display facility details and values on deal and facility page as bank decision not added yet', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/deal`));
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains('26 months');
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
    caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
    facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
    facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

    facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
    facilityPage.facilityTenor().contains('26 months');
  });

  it('should show add decision button if logged in as PIM user', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().should('exist');
    amendmentsPage.addBankDecisionButton().click({ force: true });

    cy.url().should('contain', '/banks-decision');

    amendmentsPage.amendmentBankChoiceHeading().contains('What is the bank\'s decision?');
  });

  it('should show error if no decision selected and cancel should take back to the underwriting page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision');
    amendmentsPage.errorSummary().contains('Select if the bank wants to proceed or withdraw');
    amendmentsPage.errorMessage().contains('Select if the bank wants to proceed or withdraw');

    amendmentsPage.cancelLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
  });

  it('should take you to request date page if selecting proceed on bank decision choice page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });

    amendmentsPage.amendmentBankChoiceProceedRadio().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.amendmentBankDecisionReceivedDateHeading().contains('What date did UKEF receive the bank’s decision?');
    amendmentsPage.amendmentBankDecisionReceivedDateHint().contains('For example, 31 3 1980');
  });

  it('should show an error if no date or partial date is entered', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.continueAmendment().click();

    amendmentsPage.errorSummary().contains('Enter the date UKEF received the bank\'s decision');
    amendmentsPage.errorMessage().contains('Enter the date UKEF received the bank\'s decision');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().type('2022');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.errorSummary().contains('Enter the date UKEF received the bank\'s decision');
    amendmentsPage.errorMessage().contains('Enter the date UKEF received the bank\'s decision');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('22');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2O22');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2 022');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2 22');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');
  });

  it('should take you to effective date page if date entered correctly', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');

    amendmentsPage.amendmentBankDecisionReceivedDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionReceivedDateYear().clear().focused().type('2022');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.amendmentBankDecisionEffectiveDateHeading().contains('What date will the amendment be effective from?');
    amendmentsPage.amendmentBankDecisionEffectiveDateHint().contains('For example, 31 3 1980');
  });

  it('should show an error if no date or partial date is entered', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.errorSummary().contains('Enter the date the amendment will be effective from');
    amendmentsPage.errorMessage().contains('Enter the date the amendment will be effective from');

    amendmentsPage.amendmentBankDecisionEffectiveDateDay().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateYear().type('2022');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.errorSummary().contains('Enter the date the amendment will be effective from');
    amendmentsPage.errorMessage().contains('Enter the date the amendment will be effective from');

    amendmentsPage.amendmentBankDecisionEffectiveDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateMonth().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateYear().clear().focused().type('22');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');

    amendmentsPage.amendmentBankDecisionEffectiveDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateMonth().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateYear().clear().focused().type('2O22');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.errorSummary().contains('The year must include 4 numbers');
    amendmentsPage.errorMessage().contains('The year must include 4 numbers');
  });

  it('should take you to check answers page if date entered correctly', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/effective-date');

    amendmentsPage.amendmentBankDecisionEffectiveDateDay().clear().focused().type('05');
    amendmentsPage.amendmentBankDecisionEffectiveDateMonth().clear().focused().type('06');
    amendmentsPage.amendmentBankDecisionEffectiveDateYear().clear().focused().type('2022');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/banks-decision/check-answers');
    amendmentsPage.amendmentBankDecisionCheckAnswersHeading().contains('Check your answers');
    amendmentsPage.amendmentBankDecisionCheckDecisionHeading().contains('Bank\'s decision');
    amendmentsPage.amendmentBankDecisionCheckDecisionValue().contains('Proceed');
    amendmentsPage.amendmentBankDecisionCheckDecisionLink().contains('Change');

    amendmentsPage.amendmentBankDecisionCheckReceivedHeading().contains('Date decision received');
    amendmentsPage.amendmentBankDecisionCheckReceivedValue().contains('05 Jun 2022');
    amendmentsPage.amendmentBankDecisionCheckReceivedLink().contains('Change');

    amendmentsPage.amendmentBankDecisionCheckEffectiveHeading().contains('Date the amendment will be effective from');
    amendmentsPage.amendmentBankDecisionCheckEffectiveValue().contains('05 Jun 2022');
    amendmentsPage.amendmentBankDecisionCheckEffectiveLink().contains('Change');
  });

  it('should take you to individual pages with fields checked or filled when pressing change link', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/check-answers');

    amendmentsPage.amendmentBankDecisionCheckDecisionLink().click();
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/check-answers');
    amendmentsPage.amendmentBankDecisionCheckReceivedLink().click();

    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.amendmentBankDecisionReceivedDateDay().invoke('attr', 'value').then((value) => {
      expect(value).to.equal('05');
    });
    amendmentsPage.amendmentBankDecisionReceivedDateMonth().invoke('attr', 'value').then((value) => {
      expect(value).to.equal('06');
    });
    amendmentsPage.amendmentBankDecisionReceivedDateYear().invoke('attr', 'value').then((value) => {
      expect(value).to.equal('2022');
    });
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/check-answers');
    amendmentsPage.amendmentBankDecisionCheckEffectiveLink().click();

    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.amendmentBankDecisionEffectiveDateDay().invoke('attr', 'value').then((value) => {
      expect(value).to.equal('05');
    });
    amendmentsPage.amendmentBankDecisionEffectiveDateMonth().invoke('attr', 'value').then((value) => {
      expect(value).to.equal('06');
    });
    amendmentsPage.amendmentBankDecisionEffectiveDateYear().invoke('attr', 'value').then((value) => {
      expect(value).to.equal('2022');
    });
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/check-answers');
  });

  it('should take you to underwriting page once submit bank decision.  Amendments page should show proceed badge for banks decision', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.addBankDecisionButton().click({ force: true });
    cy.url().should('contain', '/banks-decision');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/received-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/effective-date');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/banks-decision/check-answers');
    amendmentsPage.underWritingSubmitButton().click();

    caseSubNavigation.dealLink().click();
    caseDealPage.dealFacilitiesTable.row(dealFacilities[0]._id).facilityId().click();
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).bankDecisionTag().contains('Proceed');
    amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', '05 June 2022');
  });

  it('should display amendment changed values on deal and facility page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;

    cy.visit(relative(`/case/${dealId}/deal`));
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains('26 months');
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
    caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 123.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 123.00`);
    caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 24.60`);

    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 123.00`);
    facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 123.00`);
    facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 24.60 as at 5 June 2022`);

    facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
    facilityPage.facilityTenor().contains('26 months');
  });
});
