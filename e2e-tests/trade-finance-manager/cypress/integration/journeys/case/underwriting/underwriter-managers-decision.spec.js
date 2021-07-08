import moment from 'moment';
import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Pricing and risk', () => {
  let deal;
  let dealId;
  let underWritingManager;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_MIA;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  beforeEach(() => {
    underWritingManager = MOCK_USERS.find((user) =>
      user.teams.includes('UNDERWRITER_MANAGERS'));

    cy.login(underWritingManager);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.underwriterManagerDecisionLink().click();
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('clicking `underwriting managers decision` nav link should direct to underwriting-managers-decision page', () => {
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/managers-decision`));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS team should not see `Add decision` link', () => {
    const nonUnderWritingManager = MOCK_USERS.find((user) =>
      !user.teams.includes('UNDERWRITER_MANAGERS'));

    cy.login(nonUnderWritingManager);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.underwriterManagerDecisionLink().click();

    pages.managersDecisionPage.addDecisionLink().should('not.be.visible');
  });

  it('submitting an empty form displays validation errors', () => {
    pages.managersDecisionPage.addDecisionLink().click();
    pages.managersDecisionPage.submitButton().click();

    pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
    pages.managersDecisionPage.decisionRadioInputValidationError().should('be.visible');
  });

  it('selecting `Approve with conditions` radio button reveals comments input, throws validation error if no comment provided and persists radio selection', () => {
    pages.managersDecisionPage.addDecisionLink().click();

    pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('not.be.visible');

    pages.managersDecisionPage.decisionRadioInputApproveWithConditions().click();
    pages.managersDecisionPage.commentsInputApproveWithConditions().should('be.visible');
    pages.managersDecisionPage.submitButton().click();

    // radio should be selected
    pages.managersDecisionPage.decisionRadioInputApproveWithConditions().should('be.checked');

    // assert errors are displayed
    pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
    pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('be.visible');
  });

  it('selecting `Decline` radio button reveals comments input, throws validation error if no comment provided  and persists radio selection', () => {
    pages.managersDecisionPage.addDecisionLink().click();

    pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('not.be.visible');

    pages.managersDecisionPage.decisionRadioInputDecline().click();
    pages.managersDecisionPage.commentsInputDecline().should('be.visible');
    pages.managersDecisionPage.submitButton().click();

    // radio should be selected
    pages.managersDecisionPage.decisionRadioInputDecline().should('be.checked');

    // assert errors are displayed
    pages.managersDecisionPage.errorSummaryItems().should('have.length', 1);
    pages.managersDecisionPage.commentsInputDeclineValidationError().should('be.visible');
  });

  it('after valid form submit, displays submitted values and updates deal stage', () => {
    pages.managersDecisionPage.addDecisionLink().click();

    const MOCK_COMMENTS = 'Testing';
    const MOCK_INTERNAL_COMMENTS = 'Internal comment';

    pages.managersDecisionPage.decisionRadioInputApproveWithConditions().click();

    pages.managersDecisionPage.commentsInputApproveWithConditions().type(MOCK_COMMENTS);
    pages.managersDecisionPage.commentsInputInternal().type(MOCK_INTERNAL_COMMENTS);

    pages.managersDecisionPage.submitButton().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/managers-decision`));

    // assert values are displayed in decision page
    pages.managersDecisionPage.decisionStatusTag().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Approved (with conditions)');
    });

    pages.managersDecisionPage.decisionMadeBy().invoke('text').then((text) => {
      const { firstName, lastName } = underWritingManager;
      const userFullName = `${firstName} ${lastName}`;

      expect(text.trim()).to.equal(userFullName);
    });

    pages.managersDecisionPage.decisionDateTime().invoke('text').then((text) => {
      const todayFormatted = moment().format('D MMMM YYYY');

      expect(text.trim()).contains(todayFormatted);
    });

    pages.managersDecisionPage.conditions().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_COMMENTS);
    });

    pages.managersDecisionPage.internalComments().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_INTERNAL_COMMENTS);
    });

    // deal stage
    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      // text formatting is slightly different to the submitted form value
      expect(text.trim()).to.equal('Approved (with conditions)');
    });
  });
});
