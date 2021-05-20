import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';

const MOCK_MAKER_TFM = {
  username: 'MAKER-TFM',
  password: 'AbC!2345',
  firstname: 'Tamil',
  surname: 'Rahani',
  email: 'maker@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'checker@ukexportfinance.gov.uk',
    ],
  },
  teams: ['UNDERWRITERS'],
};

const ADMIN_LOGIN = {
  username: 'ADMIN',
  password: 'AbC!2345',
  firstname: 'Julius',
  surname: 'No',
  email: '',
  timezone: 'Europe/London',
  roles: ['maker', 'editor', 'admin'],
  bank: {
    id: '*',
  },
};

const underWritingManagerUser = MOCK_USERS.find((user) =>
  user.teams.includes('UNDERWRITER_MANAGERS'));

context('Case Underwriting - Pricing and risk - Facility Risk Profile', () => {
  let deal;
  let dealId;
  const dealFacilities = [];
  let facilityId;

  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_MIA;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          facilityId = createdFacilities[0]._id; // eslint-disable-line no-underscore-dangle

          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  context('unauthorised user', () => {
    it('a user that is not in the `underwriters` or `underwriter managers` team cannot view the `edit facility risk profile`page', () => {
      // unauthorised user goes to the `Pricing and risk` page
      const nonUnderWritingSupportUser = MOCK_USERS.find((user) =>
        !user.teams.includes('UNDERWRITERS'));

      cy.login(nonUnderWritingSupportUser);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

      // change link should not be visible
      const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

      facilityRow.changeRiskProfileLink().should('not.be.visible');

      // user cannot manually navigate to the page
      cy.visit(relative(`/case/${dealId}/underwriting/pricing-and-risk/facility/${dealFacilities[0]._id}/risk-profile`));
      cy.url().should('eq', relative('/not-found'));
    });
  });

  it('clicking `Change` link in facilities table goes to Facility Risk profile page', () => {
    cy.login(underWritingManagerUser);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    partials.caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    facilityRow.changeRiskProfileLink().should('be.visible');
    facilityRow.changeRiskProfileLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/facility/${facilityId}/risk-profile`));
  });

  it('clicking `ukefFacilityID` link in the legend goes to the Facility page', () => {
    cy.login(underWritingManagerUser);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    partials.caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    facilityRow.changeRiskProfileLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/facility/${facilityId}/risk-profile`));

    pages.facilityRiskProfilePage.legendLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
  });

  it('clicking `cancel` link in the form redirects to `Pricing and risk` page', () => {
    cy.login(underWritingManagerUser);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    partials.caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    facilityRow.changeRiskProfileLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/facility/${facilityId}/risk-profile`));

    pages.facilityRiskProfilePage.cancelLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
  });

  it('submitting an empty form displays validation errors', () => {
    cy.login(underWritingManagerUser);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    partials.caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    facilityRow.changeRiskProfileLink().click();

    pages.facilityRiskProfilePage.submitButton().click();

    pages.facilityRiskProfilePage.errorSummaryItems().should('have.length', 1);
    pages.facilityRiskProfilePage.riskProfileRadioInputValidationError().should('be.visible');
  });

  it('submitting a new risk profile redirects to `Pricing and Risk` page and updates the value in facilities table', () => {
    cy.login(underWritingManagerUser);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    partials.caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    const facilityRow = pages.underwritingPricingAndRiskPage.facilityTable(facilityId);

    // assert initial Risk Profile value
    facilityRow.riskProfile().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Flat');
    });

    facilityRow.changeRiskProfileLink().click();

    // submit form
    pages.facilityRiskProfilePage.riskProfileRadioInputVariable().click();
    pages.facilityRiskProfilePage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    // assert new Risk Profile value
    facilityRow.riskProfile().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Variable');
    });
  });
});
