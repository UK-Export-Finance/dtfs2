import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_DEAL from '../../../../fixtures/deal-AIN';
import { T1_USER_1, UNDERWRITER_MANAGER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Underwriter Manager\'s decision - Form and Validation', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  beforeEach(() => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('should take you to underwriting page', () => {
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS team should not see `Add decision` link', () => {
    cy.login(T1_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');
  });

  it('submitting an empty form displays validation errors', () => {
    pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });
    pages.managersDecisionPage.submitButton().click();

    pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
    pages.managersDecisionPage.decisionRadioInputValidationError().should('be.visible');
    pages.managersDecisionPage.decisionRadioInputValidationError().should('contain.text', 'Select if you approve or decline');
  });

  describe('selecting `Approve without conditions`', () => {
    it('should throw validation error if internal comment is too long', () => {
      pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('not.exist');

      pages.managersDecisionPage.decisionRadioInputApproveWithoutConditions().click();

      pages.managersDecisionPage.commentsInputInternal().type('a'.repeat(8001));

      pages.managersDecisionPage.submitButton().click();

      pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
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
      pages.managersDecisionPage.submitButton().click();

      // radio should be selected
      pages.managersDecisionPage.decisionRadioInputApproveWithConditions().should('be.checked');

      // assert errors are displayed
      pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('contain.text', 'Enter conditions');
    });

    it('should throw validation error if approval comment is too long', () => {
      pages.managersDecisionPage.commentsInputApproveWithConditions().type('a'.repeat(8001));

      pages.managersDecisionPage.submitButton().click();

      pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('contain.text', 'Conditions must be 8000 characters or fewer');
    });

    it('should throw validation error if approval comment is whitespace', () => {
      pages.managersDecisionPage.commentsInputApproveWithConditions().type('      ');

      pages.managersDecisionPage.submitButton().click();

      pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
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
      pages.managersDecisionPage.submitButton().click();

      // radio should be selected
      pages.managersDecisionPage.decisionRadioInputDecline().should('be.checked');

      // assert errors are displayed
      pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('contain.text', 'Enter reasons');
    });

    it('should throw validation error if decline comment is too long', () => {
      pages.managersDecisionPage.commentsInputDecline().type('a'.repeat(8001));

      pages.managersDecisionPage.submitButton().click();

      pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('contain.text', 'Reasons must be 8000 characters or fewer');
    });

    it('should throw validation error if decline comment is whitespace', () => {
      pages.managersDecisionPage.commentsInputDecline().type('      ');

      pages.managersDecisionPage.submitButton().click();

      pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('be.visible');
      pages.managersDecisionPage.commentsInputDeclineValidationError().should('contain.text', 'Enter reasons');
    });
  });
});

context('Case Underwriting - Underwriter Manager\'s decision - Submit Form', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  beforeEach(() => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('after valid form submit, cleans and displays submitted values and updates deal stage', () => {
    pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });

    const MOCK_COMMENTS = 'Approval comment. <div>Div contents</div><script>Script contents</script>';
    const MOCK_INTERNAL_COMMENTS = 'Internal comment. <div>Div contents</div><script>Script contents</script>';

    pages.managersDecisionPage.decisionRadioInputApproveWithConditions().click();

    pages.managersDecisionPage.commentsInputApproveWithConditions().type(MOCK_COMMENTS);
    pages.managersDecisionPage.commentsInputInternal().type(MOCK_INTERNAL_COMMENTS);

    pages.managersDecisionPage.submitButton().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    // assert values are displayed in decision page
    pages.managersDecisionPage.decisionStatusTag().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Approved (with conditions)');
    });

    pages.managersDecisionPage.decisionMadeBy().invoke('text').then((text) => {
      const { firstName, lastName } = UNDERWRITER_MANAGER_1;
      const userFullName = `${firstName} ${lastName}`;

      expect(text.trim()).to.equal(userFullName);
    });

    pages.managersDecisionPage.decisionDateTime().invoke('text').then((text) => {
      const todayFormatted = new Date().toLocaleString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' });

      expect(text.trim()).contains(todayFormatted);
    });

    pages.managersDecisionPage.conditions().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Approval comment. Div contents');
    });

    pages.managersDecisionPage.internalComments().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Internal comment. Div contents');
    });

    // deal stage
    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      // text formatting is slightly different to the submitted form value
      expect(text.trim()).to.equal('Approved (with conditions)');
    });
  });
});

context('Case Underwriting - Underwriter Manager\'s decision AIN', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  beforeEach(() => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('should show not applicable for manager\'s decision for AIN', () => {
    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');
    pages.underwritingPage.underwriterManagerDecisionNotApplicable().contains('Not applicable');
  });
});
