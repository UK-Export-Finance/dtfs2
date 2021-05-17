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

const MOCK_CREDIT_RATING_TEXT_INPUT_VALUE = 'Testing';

context('Case Underwriting - Pricing and risk - Loss Given Default', () => {
  let deal;
  let dealId;
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

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  context('unauthorised user', () => {
    it('a user that is not in the `underwriting support` team cannot view the loss given default page', () => {
      // non-underwriting support user goes to the `Pricing and risk` page
      const nonUnderWritingSupportUser = MOCK_USERS.find((user) =>
        !user.teams.includes('UNDERWRITERS'));

      cy.login(nonUnderWritingSupportUser);
      cy.visit(relative(`/case/${dealId}/underwriting/pricing-and-risk/loss-given-default`));

      cy.url().should('eq', relative('/not-found'));
    });
  });

  context('authorised user', () => {
    beforeEach(() => {
      const underWritingSupportUser = MOCK_USERS.find((user) =>
        user.teams.includes('UNDERWRITERS'));

      cy.login(underWritingSupportUser);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();

      // go to loss given default
      pages.underwritingPricingAndRiskPage.exporterTableChangeLossGivenDefaultLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/loss-given-default`));
    });

    it('should display the current LGD value in input field', () => {
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().invoke('val').then((value) => {
        expect(value.trim()).equal('50');
      });
    });

    it('should display validation error if necessary', () => {
      pages.underwritingLossGivenDefaultPage.errorSummary().should('not.exist');
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear();
      pages.underwritingLossGivenDefaultPage.submitButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/loss-given-default`));
      pages.underwritingLossGivenDefaultPage.errorSummary().should('exist');
    });

    it('should return to pricing & risk page without updating value if cancel', () => {
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear().type('45');
      pages.underwritingLossGivenDefaultPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
      pages.underwritingPricingAndRiskPage.exporterTableLossGivenDefault().invoke('text').then((text) => {
        expect(text.trim()).to.equal('50%');
      });
    });

    it('should update LGD', () => {
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear().type('45');
      pages.underwritingLossGivenDefaultPage.submitButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
      pages.underwritingPricingAndRiskPage.exporterTableLossGivenDefault().invoke('text').then((text) => {
        expect(text.trim()).to.equal('45%');
      });
    });
  });
});
