const findPortalValue = require('./findPortalValue');
const mapSubmissionType = require('./map-submission-type');
const { getBankByName } = require('../../helpers/banks');
const { convertV1Date } = require('../helpers/date-helpers');
const { getUserByEmail } = require('../../helpers/users');
const CONSTANTS = require('../../../../portal-api/src/constants');

const mapDealRoot = (portalDealId, v1Deal, banks) => {
  let hasError = false;

  const previousStatus = v1Deal.Deal_information.Extra_fields.Deal_previous_status === 'confirmed_by_bank'
    ? 'submitted'
    : v1Deal.Deal_information.Extra_fields.Deal_previous_status;

  const dealRoot = {
    dataMigration: {
      drupalDealId: portalDealId,
    },
    dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS,
    status: findPortalValue(
      v1Deal.Deal_information.Extra_fields.Deal_status,
      'Deal_status',
      'DEAL',
      'STATUS',
    ),
    previousStatus: findPortalValue(
      previousStatus,
      'Deal_previous_status',
      'DEAL',
      'STATUS',
    ),
    bank: getBankByName(banks, v1Deal.Application_bank),
    submissionType: mapSubmissionType(v1Deal),
    bankInternalRefName: v1Deal.General_information.Bank_deal_id,
    additionalRefName: v1Deal.General_information.Deal_name,
    updatedAt: convertV1Date(v1Deal.Deal_information.Extra_fields.Deal_updated),
  };

  const minUsername = v1Deal.Deal_information.Extra_fields.MIN_Maker.username;

  const makerUsername = Array.isArray(v1Deal.Deal_information.Extra_fields.All_Makers.Maker)
    ? v1Deal.Deal_information.Extra_fields.All_Makers.Maker[0].username
    : v1Deal.Deal_information.Extra_fields.All_Makers.Maker.username;

  const maker = minUsername ? getUserByEmail(minUsername) : getUserByEmail(makerUsername);

  dealRoot.maker = maker;

  if (!dealRoot.dataMigration.drupalDealId
    || !dealRoot.dealType
    || !dealRoot.status
    || !dealRoot.previousStatus
    || !dealRoot.bank
    || !dealRoot.bankInternalRefName
    || !dealRoot.additionalRefName
    || !dealRoot.updatedAt
    || !dealRoot.maker) {
    hasError = true;
  }

  return [
    dealRoot,
    hasError,
  ];
};

module.exports = mapDealRoot;
