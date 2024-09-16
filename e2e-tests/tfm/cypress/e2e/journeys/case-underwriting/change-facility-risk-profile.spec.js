import relative from '../../relativeURL';
import { caseSubNavigation } from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, UNDERWRITER_MANAGER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Case Underwriting - Pricing and risk - Facility Risk Profile', () => {
  let dealId;
  const dealFacilities = [];
  let facilityId;

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        facilityId = createdFacilities[0]._id;

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

  context('unauthorised user', () => {
    it('a user that is not in the `underwriters` or `underwriter managers` team cannot view the `edit facility risk profile`page', () => {
      // unauthorised user goes to the `Pricing and risk` page
      cy.login({ user: T1_USER_1 });
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      caseSubNavigation.underwritingLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

      // change link should not be visible
      const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

      facilityRow.changeRiskProfileLink().should('not.exist');

      // user cannot manually navigate to the page
      cy.visit(relative(`/case/${dealId}/underwriting/pricing-and-risk/facility/${dealFacilities[0]._id}/risk-profile`));
      cy.url().should('eq', relative('/not-found'));
    });
  });

  it('should show Guarantee fee, interest margin and risk profile correctly', () => {
    cy.login({ user: UNDERWRITER_MANAGER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    facilityRow.bankInterestMargin().contains(`${dealFacilities[0].banksInterestMargin}%`);
    facilityRow.guaranteeFee().contains(`${dealFacilities[0].guaranteeFeePayableByBank}%`);
    facilityRow.changeRiskProfileLink().should('exist');
  });

  it('clicking `Change` link in facilities table goes to Facility Risk profile page', () => {
    cy.login({ user: UNDERWRITER_MANAGER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    const facilityRow = pages.underwritingPage.facilityTable(facilityId);

    facilityRow.changeRiskProfileLink().should('exist');
    facilityRow.changeRiskProfileLink().click({ force: true });

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/facility/${facilityId}/risk-profile`));
  });

  it('clicking `ukefFacilityId` link in the legend goes to the Facility page', () => {
    cy.login({ user: UNDERWRITER_MANAGER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    facilityRow.changeRiskProfileLink().click({ force: true });

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/facility/${facilityId}/risk-profile`));

    pages.facilityRiskProfilePage.legendLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
  });

  it('clicking `cancel` link in the form redirects to `Pricing and risk` page', () => {
    cy.login({ user: UNDERWRITER_MANAGER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    facilityRow.changeRiskProfileLink().click({ force: true });

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/facility/${facilityId}/risk-profile`));

    pages.facilityRiskProfilePage.cancelLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
  });

  it('submitting an empty form displays validation errors', () => {
    cy.login({ user: UNDERWRITER_MANAGER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    facilityRow.changeRiskProfileLink().click({ force: true });

    pages.facilityRiskProfilePage.submitButton().click();

    pages.facilityRiskProfilePage.errorSummaryItems().should('have.length', 1);
    pages.facilityRiskProfilePage.riskProfileRadioInputValidationError().should('exist');
  });

  it('submitting a new risk profile redirects to `Pricing and Risk` page and updates the value in facilities table', () => {
    cy.login({ user: UNDERWRITER_MANAGER_1 });
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    // assert initial Risk Profile value
    facilityRow
      .riskProfile()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Flat');
      });

    facilityRow.changeRiskProfileLink().click({ force: true });

    // submit form
    pages.facilityRiskProfilePage.riskProfileRadioInputVariable().click();
    pages.facilityRiskProfilePage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

    // assert new Risk Profile value
    facilityRow
      .riskProfile()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal('Variable');
      });
  });
});
