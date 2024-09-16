import relative from '../../relativeURL';
import partials from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { UNDERWRITER_MANAGER_1, T1_USER_1, UNDERWRITER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Underwriting page', () => {
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

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should have the correct headings', () => {
    cy.login({ user: UNDERWRITER_MANAGER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();
    pages.underwritingPage.dealHeading().contains('Underwriting');
    pages.underwritingPage.underwritingAccordion().contains('Lead underwriter');
    pages.underwritingPage.underwritingAccordion().contains('Pricing and risk');
    pages.underwritingPage.underwritingAccordion().contains("Underwriter Manager's decision");
  });

  it('should show unassigned and no decision yet if logged in as non-underwriter manager', () => {
    cy.login({ user: T1_USER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.showAllButton().click();

    pages.underwritingPage.leadUnderwriterUnassigned().contains('Unassigned');
    pages.underwritingPage.assignLeadUnderwriterButton().should('not.exist');

    pages.underwritingPage.underwriterManagerDecisionNotAdded().contains('Not added yet');
    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');

    pages.underwritingPage.exporterTableChangeOrAddCreditRatingLink().should('not.exist');
    pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().should('not.exist');
    pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');

    pages.underwritingPage.facilityTable(dealFacilities[0]._id).changeRiskProfileLink().should('not.exist');
  });

  it('should show correct links and buttons if logged in as underwriter_manager', () => {
    cy.login({ user: UNDERWRITER_MANAGER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.showAllButton().click();

    pages.underwritingPage.leadUnderwriterUnassigned().should('not.exist');
    pages.underwritingPage.assignLeadUnderwriterButton().contains('Add underwriter');

    pages.underwritingPage.underwriterManagerDecisionNotAdded().should('not.exist');
    pages.underwritingPage.addUnderwriterManagerDecisionButton().contains('Add decision');

    pages.underwritingPage.exporterTableChangeOrAddCreditRatingLink().should('contain', 'Add');
    pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().contains('Change');
    pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().contains('Change');

    pages.underwritingPage.facilityTable(dealFacilities[0]._id).changeRiskProfileLink().contains('Change');
  });

  it('should show correct links and buttons if logged in as underwriter', () => {
    cy.login({ user: UNDERWRITER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.showAllButton().click();

    pages.underwritingPage.leadUnderwriterUnassigned().should('not.exist');
    pages.underwritingPage.assignLeadUnderwriterButton().contains('Add underwriter');

    pages.underwritingPage.underwriterManagerDecisionNotAdded().contains('Not added yet');
    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');

    pages.underwritingPage.exporterTableChangeOrAddCreditRatingLink().should('contain', 'Add');
    pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().contains('Change');
    pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().contains('Change');

    pages.underwritingPage.facilityTable(dealFacilities[0]._id).changeRiskProfileLink().contains('Change');
  });

  it('should show correct links and buttons if logged in as T1_USER', () => {
    cy.login({ user: T1_USER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to lead underwriter page
    partials.caseSubNavigation.underwritingLink().click();

    pages.underwritingPage.showAllButton().click();

    pages.underwritingPage.leadUnderwriterUnassigned().contains('Unassigned');
    pages.underwritingPage.assignLeadUnderwriterButton().should('not.exist');

    pages.underwritingPage.underwriterManagerDecisionNotAdded().contains('Not added yet');
    pages.underwritingPage.addUnderwriterManagerDecisionButton().should('not.exist');

    pages.underwritingPage.exporterTableChangeOrAddCreditRatingLink().should('not.exist');
    pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().should('not.exist');
    pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');

    pages.underwritingPage.facilityTable(dealFacilities[0]._id).changeRiskProfileLink().should('not.exist');
  });
});
