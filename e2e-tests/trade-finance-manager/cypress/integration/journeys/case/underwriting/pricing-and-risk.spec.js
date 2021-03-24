import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL from '../../../../fixtures/deal';
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

context('Case tasks - AIN deal', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });

  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('clicking underwriting nav link should direct to pricing-and-risk page and render `add rating` link. Clicking `add rating` takes user to edit page', () => {
    partials.caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    pages.underwritingPricingAndRiskPage.addRatingLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/edit`));
  });

  it('submitting a rating displays the rating in table on `pricing and risk` page and does not render `add credit rating` link', () => {
    // go to edit page
    partials.caseSubNavigation.underwritingLink().click();
    pages.underwritingPricingAndRiskPage.addRatingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/edit`));

    // select option, submit
    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().click();
    pages.underwritingPricingAndRiskEditPage.submitButton().click();

    // assert elements/value in `pricing and risk` page
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    pages.underwritingPricingAndRiskPage.addRatingLink().should('not.be.visible');

    pages.underwritingPricingAndRiskPage.creditRatingTableChangeLink().should('be.visible');

    pages.underwritingPricingAndRiskPage.creditRatingTableRatingValue().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Good (BB-)');
    });
  });

  it('after submitting a rating, editing the rating has default value and new rating displays in `pricing and risk` page', () => {
    // go to edit page
    partials.caseSubNavigation.underwritingLink().click();
    pages.underwritingPricingAndRiskPage.creditRatingTableChangeLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/edit`));

    // previously submitted value should be auto selected
    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().should('be.checked');

    // submit different value
    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputAcceptable().click();
    pages.underwritingPricingAndRiskEditPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    // check new value displays in `pricing and risk` page
    pages.underwritingPricingAndRiskPage.creditRatingTableRatingValue().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acceptable (B+)');
    });
  });
});
