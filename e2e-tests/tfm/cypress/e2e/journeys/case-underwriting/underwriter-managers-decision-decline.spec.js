import relative from '../../relativeURL';
import partials from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { UNDERWRITER_MANAGER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

const MOCK_COMMENTS = 'Testing';
const MOCK_INTERNAL_COMMENTS = 'Internal comment';

context('Case Underwriting - Pricing and risk', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, UNDERWRITER_MANAGER_1);
    });
  });

  beforeEach(() => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('decline GEF deal', () => {
    pages.underwritingPage.addUnderwriterManagerDecisionButton().click({ force: true });

    pages.managersDecisionPage.commentsInputApproveWithConditionsValidationError().should('not.exist');

    pages.managersDecisionPage.decisionRadioInputDecline().click();
    pages.managersDecisionPage.commentsInputDecline().should('be.visible');
    cy.keyboardInput(pages.managersDecisionPage.commentsInputDecline(), MOCK_COMMENTS);
    cy.keyboardInput(pages.managersDecisionPage.commentsInputInternal(), MOCK_INTERNAL_COMMENTS);
    cy.clickSubmitButton();

    cy.assertText(pages.managersDecisionPage.decisionStatusTag(), 'Declined');

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

    cy.assertText(pages.managersDecisionPage.conditions(), MOCK_COMMENTS);

    cy.assertText(pages.managersDecisionPage.internalComments(), MOCK_INTERNAL_COMMENTS);
  });
});
