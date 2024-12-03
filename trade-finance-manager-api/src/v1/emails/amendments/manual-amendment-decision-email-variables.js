const { AMENDMENT_UW_DECISION, AMENDMENT_TYPE } = require('../../../constants/deals');

// email variables if amendment includes approved with conditions but not declined
const approvedWithWithoutConditionsDecision = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId, ukefDecision } = amendment;
  const { exporter, bankInternalRefName } = dealSnapshot;
  const { firstname, surname } = user;

  const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;

  return {
    recipientName: `${firstname} ${surname}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
    conditions: ukefDecision?.conditions,
  };
};

// email variables if amendment is approved with conditions and declined
const approvedWithConditionsDeclinedDecision = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId, ukefDecision } = amendment;
  const { exporter, bankInternalRefName } = dealSnapshot;
  const { firstname, surname } = user;
  const { conditions, declined, value } = ukefDecision;

  const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;

  const amendmentTypeApproved = value === AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS ? AMENDMENT_TYPE.VALUE : AMENDMENT_TYPE.COVER_END_DATE;
  const amendmentTypeDeclined = value === AMENDMENT_UW_DECISION.DECLINED ? AMENDMENT_TYPE.VALUE : AMENDMENT_TYPE.COVER_END_DATE;

  return {
    recipientName: `${firstname} ${surname}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
    conditions,
    declined,
    amendmentTypeApproved,
    amendmentTypeDeclined,
  };
};

// email variables if amendment is approved without conditions and declined
const approvedWithoutConditionsDeclinedDecision = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId, ukefDecision } = amendment;
  const { exporter, bankInternalRefName } = dealSnapshot;
  const { firstname, surname } = user;
  const { declined, value } = ukefDecision;

  const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;

  const amendmentTypeApproved = value === AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS ? AMENDMENT_TYPE.VALUE : AMENDMENT_TYPE.COVER_END_DATE;
  const amendmentTypeDeclined = value === AMENDMENT_UW_DECISION.DECLINED ? AMENDMENT_TYPE.VALUE : AMENDMENT_TYPE.COVER_END_DATE;

  return {
    recipientName: `${firstname} ${surname}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
    declined,
    amendmentTypeApproved,
    amendmentTypeDeclined,
  };
};

// email variables if amendment is declined
const declinedDecision = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId, ukefDecision } = amendment;
  const { exporter, bankInternalRefName } = dealSnapshot;
  const { firstname, surname } = user;
  const { declined } = ukefDecision;

  const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;

  return {
    recipientName: `${firstname} ${surname}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
    declined,
  };
};

const banksDecisionEmailVariables = (amendmentVariables) => {
  const { amendment, dealSnapshot, user } = amendmentVariables;
  const { ukefFacilityId } = amendment;
  const { exporter, bankInternalRefName } = dealSnapshot;
  const { firstname, surname } = user;

  const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;

  return {
    recipientName: `${firstname} ${surname}`,
    ukefFacilityId,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
  };
};

module.exports = {
  approvedWithWithoutConditionsDecision,
  approvedWithConditionsDeclinedDecision,
  approvedWithoutConditionsDeclinedDecision,
  declinedDecision,
  banksDecisionEmailVariables,
};
