const CONSTANTS = require('../../../../constants');
const facilitiesController = require('../../facilities.controller');

const changeBondStatus = (bond, workflowBond, workflowActionCode) => {
  const {
    facilityStage,
    previousFacilityStage,
  } = bond;

  const isIssuedFacility = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
                           || (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
                           && previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED));

  const hasWorflowStatus = workflowBond.BSS_status && workflowBond.BSS_status.length > 0;

  // if status is `Acknowledged`, status cannot be changed
  if (bond.status !== CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED) {
    if (isIssuedFacility && hasWorflowStatus) {
      if (workflowBond.BSS_status[0] === 'Issued acknowledged') {
        return CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED;
      }

      if ((workflowActionCode === '011' || workflowActionCode === '017') && bond.status === CONSTANTS.FACILITIES.DEAL_STATUS.SUBMITTED_TO_UKEF) {
        return CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED;
      }

      if (workflowBond.BSS_status[0] === '""') {
        return CONSTANTS.FACILITIES.DEAL_STATUS.NOT_STARTED;
      }
    }

    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED) {
      return CONSTANTS.FACILITIES.DEAL_STATUS.NOT_STARTED;
    }
  }

  // "facilities issued in draft deal stage should have status updated after submission".
  // These type of facilities are the only facilities that we manually add a status to.
  // This happens during deal submission to UKEF. They are 'locked' in 'Completed' status.
  // The status is otherwise generated from workflow response (above), or dynmically generated according to validation.
  if (bond.status === CONSTANTS.FACILITIES.DEAL_STATUS.COMPLETED) {
    return bond.status;
  }

  return null;
};

const changeLoanStatus = (loan, workflowLoan, workflowActionCode) => {
  const {
    facilityStage,
    previousFacilityStage,
  } = loan;

  const isIssuedFacility = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
                          || (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
                          && previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL));

  const hasWorflowStatus = workflowLoan.EWCS_status && workflowLoan.EWCS_status.length > 0;

  // if status is `Acknowledged`, status cannot be changed
  if (loan.status !== CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED) {
    if (isIssuedFacility && hasWorflowStatus) {
      if (workflowLoan.EWCS_status[0] === 'Issued acknowledged') {
        return CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED;
      }

      if ((workflowActionCode === '011' || workflowActionCode === '017') && loan.status === CONSTANTS.FACILITIES.DEAL_STATUS.SUBMITTED_TO_UKEF) {
        return CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED;
      }

      if (workflowLoan.EWCS_status[0] === '""') {
        return CONSTANTS.FACILITIES.DEAL_STATUS.NOT_STARTED;
      }
    }

    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL) {
      return CONSTANTS.FACILITIES.DEAL_STATUS.NOT_STARTED;
    }
  }

  // "facilities issued in draft deal stage should have status updated after submission".
  // These type of facilities are the only facilities that we manually add a status to.
  // This happens during deal submission to UKEF. They are 'locked' in 'Completed' status.
  // The status is otherwise generated from workflow response (above), or dynmically generated according to validation.
  if (loan.status === CONSTANTS.FACILITIES.DEAL_STATUS.COMPLETED) {
    return loan.status;
  }

  return null;
};

const updateBond = async (bond, dealId, workflowDeal, interfaceUser, checkIssueFacilities) => {
  let modifiedBond = bond;
  const bondId = bond._id; // eslint-disable-line no-underscore-dangle

  const workflowBond = workflowDeal.BSSFacilities && workflowDeal.BSSFacilities.find(
    (b) => b.BSS_portal_facility_id[0] === bondId,
  );

  if (!workflowBond) {
    return bond;
  }

  modifiedBond = {
    ...modifiedBond,
    ukefFacilityId: Array.isArray(workflowBond.BSS_ukef_facility_id)
      ? workflowBond.BSS_ukef_facility_id[0]
      : workflowBond.BSS_ukef_facility_id,
    // fail safe to make sure we have dealId.
    // this should already exist in the data,
    // but some legacy deals might not have this.
    dealId,
  };

  if (checkIssueFacilities) {
    const workflowActionCode = workflowDeal.$.Action_Code;
    modifiedBond.status = changeBondStatus(bond, workflowBond, workflowActionCode);
  }

  const { data } = await facilitiesController.update(
    dealId,
    bondId,
    modifiedBond,
    interfaceUser,
  );

  return data;
};

const updateLoan = async (loan, dealId, workflowDeal, interfaceUser, checkIssueFacilities) => {
  let modifiedLoan = loan;
  const loanId = loan._id; // eslint-disable-line no-underscore-dangle

  const workflowLoan = workflowDeal.EWCSFacilities && workflowDeal.EWCSFacilities.find(
    (b) => b.EWCS_portal_facility_id[0] === loanId,
  );

  if (!workflowLoan) {
    return loan;
  }

  modifiedLoan = {
    ...modifiedLoan,
    ukefFacilityId: Array.isArray(workflowLoan.EWCS_ukef_facility_id)
      ? workflowLoan.EWCS_ukef_facility_id[0]
      : workflowLoan.EWCS_ukef_facility_id,

    // fail safe to make sure we have dealId.
    // this should already exist in the data,
    // but some legacy deals might not have this.
    dealId,
  };

  if (checkIssueFacilities) {
    const workflowActionCode = workflowDeal.$.Action_Code;
    modifiedLoan.status = changeLoanStatus(loan, workflowLoan, workflowActionCode);
  }

  const { data } = await facilitiesController.update(loanId, modifiedLoan, interfaceUser);

  return data;
};

const updateFacilities = (facilities, dealId, workflowDeal, interfaceUser, checkIssueFacilities) => {
  facilities.forEach(async (facilityId) => {
    const facility = await facilitiesController.findOne(facilityId);

    if (facility.facilityType === 'Bond') {
      await updateBond(facility, dealId, workflowDeal, interfaceUser, checkIssueFacilities);
    } else if (facility.facilityType === 'Loan') {
      await updateLoan(facility, dealId, workflowDeal, interfaceUser, checkIssueFacilities);
    }
  });
};

module.exports = {
  updateFacilities,
};
