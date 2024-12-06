import { GEF_FACILITY_TYPE } from '@ukef/dtfs2-common';

export const createAndConfigureApplicationStatus = (BANK1_MAKER1, token, mockDeal, mockCashFacility, mockContingentFacility, dealStatus) => {
  // creates application and inserts facilities and changes status
  cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
    cy.apiUpdateApplication(body._id, token, mockDeal).then((response) => {
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
};
