import relative from '../relativeURL';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

context('Clone GEF (MIA) deal', () => {
  let MIAdealId;
  let MIADealName;

  const clonedDealName = 'Cloned MIA deal';

  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        MIAdealId = body.items[2]._id;
        MIADealName = body.items[2].bankInternalRefName;
        cy.login(BANK1_MAKER1);
      });
  });
  describe('Clone MIA deal', () => {
    before(() => {
      cy.submitMockDataLoaderDealToChecker(MIAdealId, 'MIA');
    });

    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${MIAdealId}`));
    });

    it('should contain the right text and aria-label for the cloned button', () => {
      cy.visit(relative(`/gef/application-details/${MIAdealId}`));
      cy.checkCloneDealLink(MIADealName);
    });

    describe('when cloning the deal', () => {
      before(() => {
        cy.cloneDeal(MIAdealId, clonedDealName);
      });

      beforeEach(() => {
        cy.login(BANK1_MAKER1);
        cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      });

      it('should validate the information in the banner and deal', () => {
        cy.checkClonedDealBannerAndDeal(clonedDealName, 'In progress');
        cy.get('[data-cy="facility-summary-list"]').eq(1).find('.govuk-summary-list__row').eq(1).find('.govuk-summary-list__key').contains('Stage');
      });
    });
  });
});
