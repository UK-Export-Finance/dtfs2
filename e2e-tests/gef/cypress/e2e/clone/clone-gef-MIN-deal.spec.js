import CONSTANTS from '../../fixtures/constants';
import { anIssuedContingentFacility } from '../../../../e2e-fixtures/mock-gef-facilities';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_MIN } from '../../fixtures/mocks/mock-deals';

context('Clone GEF (MIN) deal', () => {
  let MINdealId;
  let token;
  let facilityOneId;

  const clonedDealName = 'Cloned MIN deal';

  const facilityToInsert = {
    ...anIssuedContingentFacility(),
    shouldCoverStartOnSubmission: false,
    name: 'This Contingent facility 1',
  };

  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          MINdealId = body._id;
          cy.apiUpdateApplication(MINdealId, token, MOCK_APPLICATION_MIN).then(() => {
            cy.apiCreateFacility(MINdealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) => {
              facilityOneId = facility.body.details._id;
              cy.apiUpdateFacility(facilityOneId, token, facilityToInsert);
            });
          });
        });
      });
  });
  describe('Clone MIN deal', () => {
    let facilityId;

    before(() => {
      cy.cloneDeal(MINdealId, clonedDealName);

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
                const facility = res.body.items.find((eachFacility) => eachFacility.status === 'In progress');
                facilityId = facility.details._id;
              });
            }
          });
        });
    });

    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
    });

    it('should validate the information in the banner and deal', () => {
      cy.checkClonedDealBannerAndDeal(clonedDealName, facilityId);
    });
  });
});
