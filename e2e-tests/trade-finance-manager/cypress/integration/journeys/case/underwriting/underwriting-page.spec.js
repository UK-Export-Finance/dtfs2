import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { UNDERWRITER_MANAGER_1, T1_USER_1, UNDERWRITER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Underwriting page', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_MIA;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
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

  it('should have the correct headings', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();
    pages.underwritingPage.dealHeading().contains('Deal');
    pages.underwritingPage.underwritingAccordion().contains('Lead underwriter');
    pages.underwritingPage.underwritingAccordion().contains('Pricing and risk');
    pages.underwritingPage.underwritingAccordion().contains('Underwriter Manager\'s decision');
  });

  it('should show unassigned and no decision yet if logged in as non-underwriter manager', () => {
    cy.login(T1_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.showAllButton().click();

    pages.underwritingPage.leadUnderwriterUnassigned().contains('Unassigned');
    pages.underwritingPage.assignLeadUnderwriterButton().should('not.exist');

    pages.underwritingPage.underwriterManagerDecisionNotAdded().contains('Not added yet');
    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');

    pages.underwritingPage.addCreditRatingButton().should('not.exist');
    pages.underwritingPage.exporterTableChangeCreditRatingLink().should('not.exist');
    pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().should('not.exist');
    pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');

    pages.underwritingPage.facilityTable(dealFacilities[0]._id).changeRiskProfileLink().should('not.exist');
  });

  it('should show correct links and buttons if logged in as underwriter_manager', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.showAllButton().click();

    pages.underwritingPage.leadUnderwriterUnassigned().should('not.exist');
    pages.underwritingPage.assignLeadUnderwriterButton().contains('Add underwriter');

    pages.underwritingPage.underwriterManagerDecisionNotAdded().should('not.exist');
    pages.underwritingPage.addUnderwriterManagerDecisionButton().contains('Add decision');

    pages.underwritingPage.addCreditRatingButton().contains('Add');
    pages.underwritingPage.exporterTableChangeCreditRatingLink().should('not.exist');
    pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().contains('Change');
    pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().contains('Change');

    pages.underwritingPage.facilityTable(dealFacilities[0]._id).changeRiskProfileLink().contains('Change');
  });

  it('should show correct links and buttons if logged in as underwriter', () => {
    cy.login(UNDERWRITER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.showAllButton().click();

    pages.underwritingPage.leadUnderwriterUnassigned().contains('Unassigned');
    pages.underwritingPage.assignLeadUnderwriterButton().should('not.exist');

    pages.underwritingPage.underwriterManagerDecisionNotAdded().contains('Not added yet');
    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');

    pages.underwritingPage.addCreditRatingButton().contains('Add');
    pages.underwritingPage.exporterTableChangeCreditRatingLink().should('not.exist');
    pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().contains('Change');
    pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().contains('Change');

    pages.underwritingPage.facilityTable(dealFacilities[0]._id).changeRiskProfileLink().contains('Change');
  });
});
