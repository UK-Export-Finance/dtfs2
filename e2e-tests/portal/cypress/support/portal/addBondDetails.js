import { FACILITY_STAGE } from '@ukef/dtfs2-common';

const { fillBondFinancialDetails } = require('./completeBondFinancialDetails');
const { fillUnissuedBondDetails } = require('./completeUnissuedBondDetails');
const { fillIssuedBondDetails } = require('./completeIssuedBondDetails');
const { fillBondFeeDetails } = require('./completeBondFeeDetails');
/**
 * Adds bond details based on the facility stage.
 *
 * This function clicks the "Add Bond" button and fills in the bond details
 * depending on whether the bond is 'Unissued' or 'Issued'. It also fills in
 * the bond's financial and fee details.
 *
 *  @param {typeof FACILITY_STAGE.ISSUED | typeof FACILITY_STAGE.UNISSUED} facilityStage - The stage of the facility, either 'Unissued' or 'Issued'.

 */
const addBondDetails = (facilityStage) => {
  cy.clickAddBondButton();

  if (facilityStage === FACILITY_STAGE.UNISSUED) {
    fillUnissuedBondDetails();
  } else if (facilityStage === FACILITY_STAGE.ISSUED) {
    fillIssuedBondDetails();
  }

  fillBondFinancialDetails();
  fillBondFeeDetails();
};

export { addBondDetails };
