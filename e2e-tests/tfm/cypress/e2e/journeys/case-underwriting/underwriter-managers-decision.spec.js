import { MOCK_DEAL_AIN } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../relativeURL';
import { caseSubNavigation, caseSummary, errorSummaryItems } from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, UNDERWRITER_MANAGER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context("Case Underwriting - Underwriter Manager's decision - Form and Validation", () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    caseSubNavigation.underwritingLink().click();
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should take you to underwriting page', () => {
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS team should not see `Add decision` link', () => {
    cy.login(T1_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');
  });

  it('submitting an empty form displays validation errors', () => {
    pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });
    cy.clickSubmitButton();

    errorSummaryItems().should('have.length', 1);
    pages.managersDecisionPage.decisionRadioInputValidationError().should('be.visible');
    pages.managersDecisionPage.decisionRadioInputValidationError().should('contain.text', 'Select if you approve or decline');
  });

  describe('selecting `Approve without conditions`', () => {
    it('should throw validation error if internal comment is too long', () => {
      pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('not.exist');

      pages.managersDecisionPage.decisionRadioInputApproveWithoutConditions().click();

      cy.keyboardInput(pages.managersDecisionPage.commentsInputInternal(), 'a'.repeat(8001));

      cy.clickSubmitButton();

      errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputInternalValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputInternalValidationError().should('contain.text', 'Comments must be 8000 characters or fewer');
    });
  });

  describe('selecting `Approve with conditions`', () => {
    beforeEach(() => {
      pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('not.exist');

      pages.managersDecisionPage.decisionRadioInputApproveWithConditions().click();
    });

    it('should reveal comments input', () => {
      pages.managersDecisionPage.commentsInputApproveWithConditions().should('be.visible');
    });

    it('should throw validation error if no comment provided and persists radio selection', () => {
      cy.clickSubmitButton();

      // radio should be selected
      pages.managersDecisionPage.decisionRadioInputApproveWithConditions().should('be.checked');

      // assert errors are displayed
      errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('contain.text', 'Enter conditions');
    });

    it('should throw validation error if approval comment is too long', () => {
      cy.keyboardInput(pages.managersDecisionPage.commentsInputApproveWithConditions(), 'a'.repeat(8001));

      cy.clickSubmitButton();

      errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('contain.text', 'Conditions must be 8000 characters or fewer');
    });

    it('should throw validation error if approval comment is whitespace', () => {
      cy.keyboardInput(pages.managersDecisionPage.commentsInputApproveWithConditions(), '      ');

      cy.clickSubmitButton();

      errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('contain.text', 'Enter conditions');
    });
  });

  describe('selecting `Decline`', () => {
    beforeEach(() => {
      pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });

      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('not.exist');

      pages.managersDecisionPage.decisionRadioInputDecline().click();
    });

    it('should reveal the decline comments input', () => {
      pages.managersDecisionPage.commentsInputDecline().should('be.visible');
    });

    it('should throw validation error if no comment provided and persists radio selection', () => {
      cy.clickSubmitButton();

      // radio should be selected
      pages.managersDecisionPage.decisionRadioInputDecline().should('be.checked');

      // assert errors are displayed
      errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('contain.text', 'Enter reasons');
    });

    it('should throw validation error if decline comment is too long', () => {
      cy.keyboardInput(pages.managersDecisionPage.commentsInputDecline(), 'a'.repeat(8001));

      cy.clickSubmitButton();

      errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('contain.text', 'Reasons must be 8000 characters or fewer');
    });

    it('should throw validation error if decline comment is whitespace', () => {
      cy.keyboardInput(pages.managersDecisionPage.commentsInputDecline(), '      ');

      cy.clickSubmitButton();

      errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('contain.text', 'Enter reasons');
    });
  });
});

context("Case Underwriting - Underwriter Manager's decision - Submit Form", () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    caseSubNavigation.underwritingLink().click();
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('after valid form submit, cleans and displays submitted values and updates deal stage', () => {
    pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });

    const MOCK_COMMENTS = "Approval comment. <div>Div contents</div><script>Script contents</script> &lt;img src = 'data:abc' /&gt;";
    const MOCK_INTERNAL_COMMENTS = "Internal comment. <div>Div contents</div><script>Script contents</script> &lt;img src = 'data:abc' /&gt;";

    pages.managersDecisionPage.decisionRadioInputApproveWithConditions().click();

    cy.keyboardInput(pages.managersDecisionPage.commentsInputApproveWithConditions(), MOCK_COMMENTS);
    cy.keyboardInput(pages.managersDecisionPage.commentsInputInternal(), MOCK_INTERNAL_COMMENTS);

    cy.clickSubmitButton();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    // assert values are displayed in decision page

    cy.assertText(pages.managersDecisionPage.decisionStatusTag(), 'Approved (with conditions)');

    const { firstName, lastName } = UNDERWRITER_MANAGER_1;
    const expectedName = `${firstName} ${lastName}`;

    cy.assertText(pages.managersDecisionPage.decisionMadeBy(), expectedName);

    pages.managersDecisionPage
      .decisionDateTime()
      .invoke('text')
      .then((text) => {
        const todayFormatted = new Date().toLocaleString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' });

        expect(text.trim()).contains(todayFormatted);
      });

    cy.assertText(pages.managersDecisionPage.conditions(), "Approval comment. Div contents &lt;img src = 'data:abc' /&gt;");

    cy.assertText(pages.managersDecisionPage.internalComments(), "Internal comment. Div contents &lt;img src = 'data:abc' /&gt;");

    cy.assertText(caseSummary.ukefDealStage(), 'Approved (with conditions)');
  });
});

context("Case Underwriting - Underwriter Manager's decision AIN", () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    caseSubNavigation.underwritingLink().click();
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it("should show not applicable for manager's decision for AIN", () => {
    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');
    pages.underwritingPage.underwriterManagerDecisionNotApplicable().contains('Not applicable');
  });
});
