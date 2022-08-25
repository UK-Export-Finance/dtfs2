import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, UNDERWRITER_MANAGER_DECISIONS } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM } from '../../../../fixtures/users-portal';
import pages from '../../../pages';

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

context('Amendments underwriting - add underwriter decision', () => {
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

  it('should take you to `Add underwriter decision - Cover End Date` page', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');

    pages.amendmentsPage.underWriterManagerDecisionCoverEndDateHeading().contains('What\'s your decision?');
    pages.amendmentsPage.amendmentCurrentCoverEndDate().contains('20 October 2022');
    pages.amendmentsPage.amendmentNewCoverEndDateDay().contains(dateConstants.tomorrowDay);
    pages.amendmentsPage.amendmentNewCoverEndDateDay().contains(dateConstants.todayYear);

    pages.amendmentsPage.underWriterManagerDecisionRadioInputApproveWithoutConditions().should('exist');
    pages.amendmentsPage.underWriterManagerDecisionRadioInputApproveWithConditions().should('exist');
    pages.amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('exist');
  });

  it('should show an error if no decision has been made but the `Continue` button is clicked', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.continueAmendment().click();
    amendmentsPage.errorSummary().contains('Select your decision for the cover end date');
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

  it('should show an error if no decision has been made for `Facility Value` but the `Continue` button is clicked', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.continueAmendment().click();
    amendmentsPage.errorSummary().contains('Select your decision for the facility value');
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
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', '20 October 2022');

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentsManagersDecisionConditions().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionReasons().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionComments().should('be.visible');

    amendmentsPage.continueAmendment().should('be.visible');
  });

  it('should take you to `Add conditions, reasons and comments` summary page if no errors', () => {
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

    amendmentsPage.continueAmendment().click();
    // testing errors if conditions and decline boxes not filled
    amendmentsPage.errorSummary().contains('Enter the conditions for the approval');
    amendmentsPage.errorSummary().contains('Enter the reasons for declining the change');

    amendmentsPage.errorMessage().contains('Enter the conditions for the approval');
    amendmentsPage.errorMessage().contains('Enter the reasons for declining the change');

    // ensures these values stay the same
    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('have.class', 'govuk-tag--red');
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', '20 October 2022');

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('have.class', 'govuk-tag--green');

    amendmentsPage.amendmentsManagersDecisionConditions().clear().focused().type('This is a list of conditions <script>alert(\'hello world\')</script> <embed type="text/html" src="snippet.html" width="500" height="200">');
    amendmentsPage.amendmentsManagersDecisionReasons().clear().focused().type('This is the reason for declining the amendment <img src=x onerror=alert(\'img\')/> <object data="snippet.html" width="500" height="200"></object>');
    amendmentsPage.amendmentsManagersDecisionComments().clear().focused().type('This is a comment visible only to UKEF staff <input type="text" name="state" value="INPUT_FROM_USER">');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions/summary');
    amendmentsPage.amendmentSendToBankButton().should('be.visible');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', '20 October 2022');

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);
  });

  it('should take you to `Underwriting` page once a manual amendment has been submitted with underwriter managers decision and santised conditions/reasons/comments displayed', () => {
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

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', '/managers-conditions/summary');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', '20 October 2022');

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentManagersDecisionByHeading().contains('UKEF decision made by');
    amendmentsPage.amendmentManagersDecisionBy(1).contains(`${UNDERWRITER_MANAGER_1.firstName} ${UNDERWRITER_MANAGER_1.lastName}`);

    amendmentsPage.amendmentManagersDecisionDateHeading().contains('Date and time');
    amendmentsPage.amendmentManagersDecisionDate(1).contains(dateConstants.todayFormattedFull);
    amendmentsPage.amendmentManagersDecisionDate(1).contains(dateConstants.todayFormattedTimeHours);
    amendmentsPage.amendmentManagersDecisionDate(1).contains(dateConstants.todayFormattedTimeAmPm);

    amendmentsPage.amendmentManagersDecisionByHeading().contains('UKEF decision made by');
    amendmentsPage.amendmentManagersDecisionBy(1).contains(`${UNDERWRITER_MANAGER_1.firstName} ${UNDERWRITER_MANAGER_1.lastName}`);

    amendmentsPage.amendmentManagersDecisionConditionsHeading().contains('Conditions');
    amendmentsPage.amendmentManagersDecisionConditions(1).contains('This is a list of conditions');
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', '<script>alert(\'hello world\')</script>');
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', '<embed type="text/html" src="snippet.html" width="500" height="200">');

    amendmentsPage.amendmentManagersDecisionReasonsHeading().contains('Reasons');
    amendmentsPage.amendmentManagersDecisionReasons(1).contains('This is the reason for declining the amendment');
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', '<img src=x onerror=alert(\'img\')/>');
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', '<object data="snippet.html" width="500" height="200"></object>');

    amendmentsPage.amendmentManagersDecisionCommentsHeading().contains('Comments');
    amendmentsPage.amendmentManagersDecisionComments(1).contains('This is a comment visible only to UKEF staff');
    amendmentsPage.amendmentManagersDecisionComments(1).should('not.contain', '<input type="text" name="state" value="INPUT_FROM_USER">');
  });

  it('should display underwriter managers decision and conditions/reasons/comments displayed on amendment details page', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', '20 October 2022');

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentManagersDecisionByHeading().contains('UKEF decision made by');
    amendmentsPage.amendmentManagersDecisionBy(1).contains(`${UNDERWRITER_MANAGER_1.firstName} ${UNDERWRITER_MANAGER_1.lastName}`);

    amendmentsPage.amendmentManagersDecisionDateHeading().contains('Date and time');
    amendmentsPage.amendmentManagersDecisionDate(1).contains(dateConstants.todayFormattedFull);
    amendmentsPage.amendmentManagersDecisionDate(1).contains(dateConstants.todayFormattedTimeHours);
    amendmentsPage.amendmentManagersDecisionDate(1).contains(dateConstants.todayFormattedTimeAmPm);

    amendmentsPage.amendmentManagersDecisionByHeading().contains('UKEF decision made by');
    amendmentsPage.amendmentManagersDecisionBy(1).contains(`${UNDERWRITER_MANAGER_1.firstName} ${UNDERWRITER_MANAGER_1.lastName}`);

    amendmentsPage.amendmentManagersDecisionConditionsHeading().contains('Conditions');
    amendmentsPage.amendmentManagersDecisionConditions(1).contains('This is a list of conditions');
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', '<script>alert(\'hello world\')</script>');
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', '<embed type="text/html" src="snippet.html" width="500" height="200">');

    amendmentsPage.amendmentManagersDecisionReasonsHeading().contains('Reasons');
    amendmentsPage.amendmentManagersDecisionReasons(1).contains('This is the reason for declining the amendment');
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', '<img src=x onerror=alert(\'img\')/>');
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', '<object data="snippet.html" width="500" height="200"></object>');

    amendmentsPage.amendmentManagersDecisionCommentsHeading().contains('Comments');
    amendmentsPage.amendmentManagersDecisionComments(1).contains('This is a comment visible only to UKEF staff');
    amendmentsPage.amendmentManagersDecisionComments(1).should('not.contain', '<input type="text" name="state" value="INPUT_FROM_USER">');
  });
});
