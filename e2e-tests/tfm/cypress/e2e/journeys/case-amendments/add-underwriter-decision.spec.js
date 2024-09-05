import relative from '../../relativeURL';
import { continueButton, errorSummary } from '../../partials';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, UNDERWRITER_MANAGER_DECISIONS, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';
import pages from '../../pages';

context('Amendments underwriting - add underwriter decision', () => {
  let dealId;
  const dealFacilities = [];

  beforeEach(() => {
    cy.saveSession();
  });

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
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should take you to `Add underwriter decision - Cover End Date` page', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');

    pages.amendmentsPage.underWriterManagerDecisionCoverEndDateHeading().contains("What's your decision?");
    pages.amendmentsPage.amendmentCurrentCoverEndDate().contains(dateConstants.oneMonthFormattedFull);
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
    cy.clickContinueButton();
    errorSummary().contains('Select your decision for the cover end date');
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

  it('should show an error if no decision has been made for `Facility Value` but the `Continue` button is clicked', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
    pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    cy.clickContinueButton();
    errorSummary().contains('Select your decision for the facility value');
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
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);

    amendmentsPage.amendmentsManagersDecisionConditions().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionReasons().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionComments().should('be.visible');

    continueButton().should('be.visible');
  });

  it('should take you to `Add conditions, reasons and comments` summary page if no errors', () => {
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

    cy.clickContinueButton();
    // testing errors if conditions and decline boxes not filled
    errorSummary().contains('Enter the conditions for the approval');
    errorSummary().contains('Enter the reasons for declining the change');

    amendmentsPage.errorMessage().contains('Enter the conditions for the approval');
    amendmentsPage.errorMessage().contains('Enter the reasons for declining the change');

    // ensures these values stay the same
    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('have.class', 'govuk-tag--red');
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('have.class', 'govuk-tag--green');

    amendmentsPage
      .amendmentsManagersDecisionConditions()
      .clear()
      .focused()
      .type(
        'This is a list of conditions <script>(\'hello world\')</script> <embed type="text/html" src="snippet.html" width="500" height="200"> <h1>html text </h1>',
      );
    amendmentsPage
      .amendmentsManagersDecisionReasons()
      .clear()
      .focused()
      .type(
        'This is the reason for declining the amendment <img src=x onerror=console.log(\'img\')/> <object data="snippet.html" width="500" height="200"></object><h1>html text </h1>',
      );
    amendmentsPage
      .amendmentsManagersDecisionComments()
      .clear()
      .focused()
      .type('This is a comment visible only to UKEF staff <input type="text" name="state" value="INPUT_FROM_USER"> <h1>html text </h1>');

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');
    amendmentsPage.amendmentSendToBankButton().should('be.visible');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);
  });

  it('should take you to `Underwriting` page once a manual amendment has been submitted', () => {
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

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');

    amendmentsPage.amendmentSendToBankButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
  });

  it('should show underwriter managers decision and sanitised conditions/reasons/comments displayed', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);

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
    amendmentsPage.amendmentManagersDecisionConditions(1).contains('html text');
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', "<script>console.log('hello world')</script>");
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', '<embed type="text/html" src="snippet.html" width="500" height="200">');
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', '<h1>html text </h1>');

    amendmentsPage.amendmentManagersDecisionReasonsHeading().contains('Reasons');
    amendmentsPage.amendmentManagersDecisionReasons(1).contains('This is the reason for declining the amendment');
    amendmentsPage.amendmentManagersDecisionReasons(1).contains('html text');
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', "<img src=x onerror=console.log('img')/>");
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', '<object data="snippet.html" width="500" height="200"></object>');
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', '<h1>html text </h1>');

    amendmentsPage.amendmentManagersDecisionCommentsHeading().contains('Comments');
    amendmentsPage.amendmentManagersDecisionComments(1).contains('This is a comment visible only to UKEF staff');
    amendmentsPage.amendmentManagersDecisionComments(1).contains('html text');
    amendmentsPage.amendmentManagersDecisionComments(1).should('not.contain', '<input type="text" name="state" value="INPUT_FROM_USER">');
    amendmentsPage.amendmentManagersDecisionComments(1).should('not.contain', '<h1>html text </h1>');
  });

  it('should display underwriter managers decision and conditions/reasons/comments displayed on amendment details page', () => {
    cy.login(UNDERWRITER_MANAGER_1);

    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);

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
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', "<script>console.log('hello world')</script>");
    amendmentsPage.amendmentManagersDecisionConditions(1).should('not.contain', '<embed type="text/html" src="snippet.html" width="500" height="200">');

    amendmentsPage.amendmentManagersDecisionReasonsHeading().contains('Reasons');
    amendmentsPage.amendmentManagersDecisionReasons(1).contains('This is the reason for declining the amendment');
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', "<img src=x onerror=console.log('img')/>");
    amendmentsPage.amendmentManagersDecisionReasons(1).should('not.contain', '<object data="snippet.html" width="500" height="200"></object>');

    amendmentsPage.amendmentManagersDecisionCommentsHeading().contains('Comments');
    amendmentsPage.amendmentManagersDecisionComments(1).contains('This is a comment visible only to UKEF staff');
    amendmentsPage.amendmentManagersDecisionComments(1).should('not.contain', '<input type="text" name="state" value="INPUT_FROM_USER">');
  });
});
