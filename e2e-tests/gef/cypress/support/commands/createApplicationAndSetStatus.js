import { GEF_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

/**
 * createApplicationAndSetStatus
 * creates an application with facilities and sets a new status
 * returns the updated deal
 * @param {Object} mockDeal
 * @param {Object} mockCashFacility
 * @param {Object} mockContingentFacility
 * @param {string} dealStatus
 * @returns {Promise<Object>} updated deal
 */

let token;
export const createApplicationAndSetStatus = (mockDeal, mockCashFacility, mockContingentFacility, dealStatus) => {
  cy.apiLogin(BANK1_MAKER1)
    .then((t) => {
      token = t;
    })
    .then(() => {
      // creates application and inserts facilities and changes status
      cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
        cy.apiUpdateApplication(body._id, token, mockDeal).then((response) => {
          // wrap the updated deal
          cy.wrap(response.body);

          if (mockCashFacility) {
            cy.apiCreateFacility(body._id, GEF_FACILITY_TYPE.CASH, token).then((facility) => {
              cy.apiUpdateFacility(facility.body.details._id, token, mockCashFacility);
            });
          }

          if (mockContingentFacility) {
            cy.apiCreateFacility(body._id, GEF_FACILITY_TYPE.CONTINGENT, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, mockContingentFacility),
            );
          }

          cy.apiSetApplicationStatus(body._id, token, dealStatus);
        });
      });
    });
};
