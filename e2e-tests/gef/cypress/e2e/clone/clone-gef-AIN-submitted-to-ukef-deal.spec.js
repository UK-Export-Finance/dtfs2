import relative from '../relativeURL';
import { dashboard, dashboardSubNavigation } from '../partials';
import applicationDetails from '../pages/application-details';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

context('Clone GEF (AIN) deal - Submitted to UKEF', () => {
  let AINdealId;
  let AINDealName;

  const clonedDealName = 'Cloned AIN deal';

  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        AINdealId = body.items[2]._id;
        AINDealName = body.items[2].bankInternalRefName;
      });
  });

  describe('Clone AIN deal', () => {
    before(() => {
      cy.submitMockDataLoaderDealToUkef(AINdealId);
    });

    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
    });

    it('should contain the right text and aria-label for the cloned button', () => {
      cy.visit(relative(`/gef/application-details/${AINdealId}`));

      cy.checkCloneDealLink(AINDealName);
    });

    describe('when cloning the deal', () => {
      before(() => {
        cy.cloneDeal(AINdealId, clonedDealName);
      });

      beforeEach(() => {
        cy.login(BANK1_MAKER1);
        cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      });

      it('should validate the information in the banner and deal', () => {
        cy.checkClonedDealBannerAndDeal(clonedDealName, 'In progress');
        cy.get('[data-cy="facility-summary-list"]').eq(1).find('.govuk-summary-list__row').eq(1).find('.govuk-summary-list__key').contains('Stage');
      });

      it('should reset the issueDate on facilities table to -', () => {
        applicationDetails
          .facilitySummaryListTable(0)
          .nameAction()
          .invoke('attr', 'href')
          .then((href) => {
            // get id from href for facility
            const hrefSplit = href.split('/');
            const facilityId = hrefSplit[5];

            dashboard().click();
            // goes to facilities table and makes sure it's issued and no issue date so properly cloned
            dashboardSubNavigation.facilities().click();
            cy.get(`[data-cy="facility__bankStage--${facilityId}"]`).contains('Issued');
            cy.get(`[data-cy="facility__issuedDate--${facilityId}"]`).contains('-');
          });
      });
    });
  });
});
