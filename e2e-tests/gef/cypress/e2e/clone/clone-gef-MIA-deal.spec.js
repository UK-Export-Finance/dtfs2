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
      let token;
      let facilityId;

      before(() => {
        cy.cloneDeal(MIAdealId, clonedDealName);

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
                  facilityId = facility.details._id;
                });
              }
            });
          });
      });

      beforeEach(() => {
        cy.login(BANK1_MAKER1);
        cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      });

      it('should validate the information in the banner and deal', () => {
        cy.checkClonedDealBannerAndDeal(clonedDealName, facilityId);
      });
    });
  });
});
