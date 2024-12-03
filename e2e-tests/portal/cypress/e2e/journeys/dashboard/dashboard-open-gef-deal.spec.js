const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { headingCaption } = require('../../../../../gef/cypress/e2e/partials');
const gefProblemWithService = require('../../../../../gef/cypress/e2e/pages/login/sign-in-link');
const BssEwcsApplicationDetails = require('../../pages/contract');
const BssEwcsProblemWithService = require('../../pages/login/sign-in-link');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Should get problem with service page when visiting BSS/EWCS with GEF deal ID', () => {
  describe('Visit from maker deal dashboard', () => {
    let gefDealId;
    let BssEwcsDealId;

    before(() => {
      cy.loadData();
      cy.apiLogin(BANK1_MAKER1)
        .then((token) => token)
        .then((token) => {
          cy.apiFetchAllApplications(token);
        })
        .then(({ body }) => {
          gefDealId = body.deals[0]._id;
          BssEwcsDealId = body.deals[4]._id;
        });
    });

    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
    });

    it('Ensure GEF application exist', () => {
      cy.visit(relative(`/gef/application-details/${gefDealId}`));
      headingCaption().should('exist');
    });

    it('Ensure BSS/EWCS application exist', () => {
      cy.visit(relative(`/contract/${BssEwcsDealId}`));
      BssEwcsApplicationDetails.overviewTable().should('exist');
    });

    it('Visit GEF deal with BSS/EWCS deal identifier, should show problem with service page', () => {
      cy.visit(relative(`/gef/application-details/${BssEwcsDealId}`));
      gefProblemWithService.shouldDisplayProblemWithServiceError();
    });

    it('Visit BSS/EWCS deal with GEF deal identifier, should show problem with service page', () => {
      cy.visit(relative(`/contract/${gefDealId}`));
      BssEwcsProblemWithService.shouldDisplayProblemWithServiceError();
    });
  });
});
