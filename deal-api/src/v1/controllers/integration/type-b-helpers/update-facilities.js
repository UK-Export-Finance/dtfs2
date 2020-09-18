const CONSTANTS = require('../../../../constants');

const updateBondStatus = (bond, workflowBond) => {
  const {
    bondStage,
    previousFacilityStage,
  } = bond;

  const isIssuedFacility = (bondStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED
                           || (bondStage === CONSTANTS.FACILITIES.BOND_STAGE.ISSUED
                           && previousFacilityStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED));

  const hasWorflowStatus = workflowBond.BSS_status && workflowBond.BSS_status.length > 0;

  // if status is `Acknowledged`, status cannot be changed
  if (bond.status !== CONSTANTS.FACILITIES.STATUS.ACKNOWLEDGED) {
    if (isIssuedFacility && hasWorflowStatus) {
      if (workflowBond.BSS_status[0] === 'Issued acknowledged') {
        return CONSTANTS.FACILITIES.STATUS.ACKNOWLEDGED;
      }

      if (workflowBond.BSS_status[0] === '""') {
        return CONSTANTS.FACILITIES.STATUS.NOT_STARTED;
      }
    }

    if (bondStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED) {
      return CONSTANTS.FACILITIES.STATUS.NOT_STARTED;
    }
  }
  return null;
};

const updateLoanStatus = (loan, workflowLoan) => {
  const {
    facilityStage,
    previousFacilityStage,
  } = loan;

  const isIssuedFacility = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL
                          || (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.UNCONDITIONAL
                          && previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL));

  const hasWorflowStatus = workflowLoan.EWCS_status && workflowLoan.EWCS_status.length > 0;


  // if status is `Acknowledged`, status cannot be changed
  if (loan.status !== CONSTANTS.FACILITIES.STATUS.ACKNOWLEDGED) {
    if (isIssuedFacility && hasWorflowStatus) {
      if (workflowLoan.EWCS_status[0] === 'Issued acknowledged') {
        return CONSTANTS.FACILITIES.STATUS.ACKNOWLEDGED;
      }

      if (workflowLoan.EWCS_status[0] === '""') {
        return CONSTANTS.FACILITIES.STATUS.NOT_STARTED;
      }
    }

    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL) {
      return CONSTANTS.FACILITIES.STATUS.NOT_STARTED;
    }
  }

  return null;
};

const updateBonds = (dealBonds, workflowDeal, checkIssueFacilities) => {
  const bondTransactionItems = dealBonds.map((bond) => {
    const workflowBond = workflowDeal.BSSFacilities && workflowDeal.BSSFacilities.find(
      (b) => b.BSS_portal_facility_id[0] === bond._id, // eslint-disable-line no-underscore-dangle
    );
    if (!workflowBond) {
      return bond;
    }

    const updatedBond = {
      ...bond,
      ukefFacilityID: Array.isArray(workflowBond.BSS_ukef_facility_id)
        ? workflowBond.BSS_ukef_facility_id[0]
        : workflowBond.BSS_ukef_facility_id,
    };

    if (checkIssueFacilities) {
      updatedBond.status = updateBondStatus(bond, workflowBond);
    }

    return updatedBond;
  });

  return bondTransactionItems;
};

const updateLoans = (dealLoans, workflowDeal, checkIssueFacilities) => {
  const loanTransactionItems = dealLoans.map((loan) => {
    const workflowLoan = workflowDeal.EWCSFacilities && workflowDeal.EWCSFacilities.find(
      (b) => b.EWCS_portal_facility_id[0] === loan._id, // eslint-disable-line no-underscore-dangle
    );

    if (!workflowLoan) {
      return loan;
    }

    const updatedLoan = {
      ...loan,
      ukefFacilityID: Array.isArray(workflowLoan.EWCS_ukef_facility_id)
        ? workflowLoan.EWCS_ukef_facility_id[0]
        : workflowLoan.EWCS_ukef_facility_id,
    };

    if (checkIssueFacilities) {
      updatedLoan.status = updateLoanStatus(loan, workflowLoan);
    }

    return updatedLoan;
  });

  return loanTransactionItems;
};

module.exports = {
  updateBonds,
  updateLoans,
};
