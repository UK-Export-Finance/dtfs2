import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

const MOCK_COMMENTS = 'Testing';
const MOCK_INTERNAL_COMMENTS = 'Internal comment';

context('Case Underwriting - Pricing and risk', () => {
  let dealId;
  let underWritingManager;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN);

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

  beforeEach(() => {
    underWritingManager = MOCK_USERS.find((user) => user.teams.includes('UNDERWRITER_MANAGERS'));

    cy.login(underWritingManager);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.underwriterManagerDecisionLink().click();
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('clicking `underwriting managers decision` nav link should direct to underwriting-managers-decision page', () => {
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/managers-decision`));
  });

  it('decline GEF deal', () => {
    pages.managersDecisionPage.addDecisionLink().click();

    pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('not.exist');

    pages.managersDecisionPage.decisionRadioInputDecline().click();
    pages.managersDecisionPage.commentsInputDecline().should('be.visible');
    pages.managersDecisionPage.commentsInputDecline().type(MOCK_COMMENTS);
    pages.managersDecisionPage.commentsInputInternal().type(MOCK_INTERNAL_COMMENTS);
    pages.managersDecisionPage.submitButton().click();

    pages.managersDecisionPage.decisionStatusTag().invoke('text').then(($text) => {
      expect($text.trim()).to.equal('Declined');
    });

    pages.managersDecisionPage.decisionMadeBy().invoke('text').then((text) => {
      const { firstName, lastName } = underWritingManager;
      const userFullName = `${firstName} ${lastName}`;

      expect(text.trim()).to.equal(userFullName);
    });

    pages.managersDecisionPage.decisionDateTime().invoke('text').then((text) => {
      const todayFormatted = new Date().toLocaleString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' });

      expect(text.trim()).contains(todayFormatted);
    });

    pages.managersDecisionPage.conditions().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_COMMENTS);
    });

    pages.managersDecisionPage.internalComments().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_INTERNAL_COMMENTS);
    });
  });
});
