/* eslint-disable cypress/no-unnecessary-waiting */
import relative from '../relativeURL';
import { dashboard, dashboardSubNavigation } from '../partials';
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
      let token;
      let facilityId;
      let facilityLog;
      let allFacilities;

      before(() => {
        cy.cloneDeal(AINdealId, clonedDealName);

        /**
         * Fetches all deals
         * Finds the deal which is cloned by bankInternalRefName matching clonedDealName
         * Finds the id of the facility which is in progress
         */
        cy.apiLogin(BANK1_MAKER1)
          .then((tok) => {
            token = tok;
          })
          .then(() => cy.apiFetchAllGefApplications(token))
          .then(({ body }) => {
            body.items.forEach((item) => {
              /**
               * if the deal has the clonedDealName, then find the facility in progress in this deal
               * one facility will be in progress as was issued and had a past cover start date
               */
              if (item.bankInternalRefName === clonedDealName) {
                cy.apiFetchAllFacilities(item._id, token).then((res) => {
                  const facility = res.body.items.find((eachFacility) => eachFacility.name === 'This Contingent facility 1');
                  allFacilities = res.body.items;
                  facilityLog = facility;
                  facilityId = facility.details._id;
                });
              }
            });
          });
      });

      beforeEach(() => {
        cy.wait(60000);
        cy.login(BANK1_MAKER1);
        cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      });

      it('should validate the information in the banner and deal', () => {
        cy.wait(60000);
        cy.task('log', `all facilities: ${JSON.stringify(allFacilities)}`);
        cy.task('log', `facility: ${JSON.stringify(facilityLog)}`);
        cy.checkClonedDealBannerAndDeal(clonedDealName, facilityId);
      });

      it('should reset the issueDate on facilities table to -', () => {
        dashboard().click();
        // goes to facilities table and makes sure the cloned issued facility is Issued and has a cover start date of -
        dashboardSubNavigation.facilities().click();
        cy.get(`[data-cy="facility__bankStage--${facilityId}"]`).contains('Issued');
        cy.get(`[data-cy="facility__issuedDate--${facilityId}"]`).contains('-');
      });
    });
  });
});
