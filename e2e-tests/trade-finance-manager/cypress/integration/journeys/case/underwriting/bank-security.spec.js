import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Bank Security', () => {
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

  beforeEach(() => {
    const underWritingSupportUser = MOCK_USERS.find((user) =>
      user.teams.includes('UNDERWRITERS'));

    cy.login(underWritingSupportUser);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to pricing and risk page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.bankSecurityLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/bank-security`));
  });

  it('bank security page should display security details', () => {
    partials.underwritingSubNav.bankSecurityLink().should('have.class', 'moj-side-navigation__item--active');
    pages.underwritingBankSecurity.bankSecurityHeading().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Bank Security');
    });

    pages.underwritingBankSecurity.bankSecurityText().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_DEAL_MIA.dealFiles.security);
    });
  });
});
