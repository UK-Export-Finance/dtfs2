const { format, parseISO } = require('date-fns');
const { isFacilityEndDateEnabledOnGefVersion, PORTAL_AMENDMENT_STATUS, getLatestAmendmentsByFacility } = require('@ukef/dtfs2-common');
const { isTrueSet } = require('./helpers');
const { BOOLEAN, STAGE, FACILITY_TYPE } = require('../constants');

const exporterItems = (exporterUrl, options = {}) => [
  {
    label: 'Companies House registration number',
    id: 'companiesHouseRegistrationNumber',
    href: `${exporterUrl}/companies-house?status=change`,
  },
  {
    label: 'Company name',
    id: 'companyName',
  },
  {
    label: 'Registered Address',
    id: 'registeredAddress',
  },
  {
    label: 'Correspondence address, if different',
    id: 'correspondenceAddress',
    href: options.correspondenceAddressLink ? `${exporterUrl}/exporters-address` : `${exporterUrl}/enter-exporters-correspondence-address?status=change`,
  },
  {
    label: 'Industry',
    id: 'selectedIndustry',
    isIndustry: true,
    href: options.showIndustryChangeLink ? `${exporterUrl}/about-exporter?status=change` : null,
  },
  {
    label: 'SME type',
    id: 'smeType',
    href: `${exporterUrl}/about-exporter?status=change`,
    method: (value) => value,
  },
  {
    label: 'Probability of default',
    id: 'probabilityOfDefault',
    href: `${exporterUrl}/about-exporter?status=change`,
    suffix: '%',
  },
  {
    label: 'Is finance for this exporter increasing?',
    id: 'isFinanceIncreasing',
    href: `${exporterUrl}/about-exporter?status=change`,
    method: (value) => (isTrueSet(value) ? BOOLEAN.YES : BOOLEAN.NO),
  },
];

const eligibilityCriteriaItems = (coverUrl) => [
  {
    label: 'Cover',
    id: 'cover',
    href: `${coverUrl}`,
  },
];

/**
 * Generates an array of facility items to display on the facility summary lists on the application details page.
 * @param {string} facilityUrl url for the facility
 * @param {Facility} details facility details
 * @param {Record<string, PortalFacilityAmendment>} latestAmendments - object with the latest amendment for each facility.
 * @param {PortalFacilityAmendment[]} amendmentsOnDeal - array of amendments on the deal.
 * @param {number} dealVersion
 * @returns {Array} Array of facility items with label, id, href, method, suffix, and isHidden properties.
 */
const facilityItems = (facilityUrl, details, latestAmendments, amendmentsOnDeal, dealVersion) => {
  const { _id, type, hasBeenIssued, shouldCoverStartOnSubmission, ukefFacilityId, feeType, issueDate, facilityStage } = details;

  const stringMongoId = _id?.toString();

  // get the latest amendment for this facility
  const latestAmendment = latestAmendments[stringMongoId];

  const amendmentsOnFacility = amendmentsOnDeal.filter(
    (amendment) => amendment.facilityId.toString() === stringMongoId && amendment.status === PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
  );

  // get the latest completed amendment for this facility
  const latestCompletedAmendmentByFacility = getLatestAmendmentsByFacility(amendmentsOnFacility);
  const latestCompletedAmendment = latestCompletedAmendmentByFacility[stringMongoId];

  const isUsingFacilityEndDate = latestCompletedAmendment ? latestCompletedAmendment.isUsingFacilityEndDate : details.isUsingFacilityEndDate;

  isFacilityEndDateEnabledOnGefVersion(dealVersion);

  const AT_MATURITY = 'At maturity';

  const items = [
    {
      label: 'Name',
      id: 'name',
      href: `${facilityUrl}/about-facility?status=change`,
    },
    {
      label: 'UKEF facility ID',
      id: 'ukefFacilityId',
      isHidden: !ukefFacilityId,
    },
    {
      label: 'Amendment status',
      id: 'latestAmendmentStatus',
      isHidden: !latestAmendment,
    },
    {
      label: 'Stage',
      id: 'hasBeenIssued',
      href: `${facilityUrl}?status=change`,
      method: (value) => {
        if (facilityStage) {
          return facilityStage;
        }

        return isTrueSet(value) ? STAGE.ISSUED : STAGE.UNISSUED;
      },
    },
    {
      label: 'Date issued to exporter',
      id: 'issueDate',
      method: (value) => {
        // issueDate is an ISO-8601 string with milliseconds (e.g '2024-02-14T00:00:00.000+00:00')
        const date = parseISO(value);
        return format(date, 'd MMMM yyyy');
      },
      isHidden: !issueDate,
    },
    {
      label: 'Cover start date',
      id: 'coverStartDate',
      href: `${facilityUrl}/about-facility?status=change`,
      method: (value) => {
        // coverStartDate is an ISO-8601 string with milliseconds (e.g '2024-02-14T00:00:00.000+00:00')
        const date = parseISO(value);
        return format(date, 'd MMMM yyyy');
      },
      isHidden: !hasBeenIssued,
      shouldCoverStartOnSubmission,
      issueDate,
    },
    {
      label: 'Cover end date',
      id: 'coverEndDate',
      href: `${facilityUrl}/about-facility?status=change`,
      method: (value) => {
        const coverEndDate = latestCompletedAmendment ? new Date(latestCompletedAmendment.coverEndDate).toISOString() : value;
        // coverEndDate is an ISO-8601 string with milliseconds (e.g '2024-02-14T00:00:00.000+00:00')
        const date = parseISO(coverEndDate);
        return format(date, 'd MMMM yyyy');
      },
      isHidden: !hasBeenIssued,
    },
    {
      label: 'Months the UKEF guarantee will be in place for',
      id: 'monthsOfCover',
      href: `${facilityUrl}/about-facility?status=change`,
      suffix: ' months',
      isHidden: hasBeenIssued,
    },
    {
      label: 'Has a facility end date',
      id: 'isUsingFacilityEndDate',
      href: `${facilityUrl}/about-facility?status=change`,
      method: (value) => {
        const isUsingFED = latestCompletedAmendment ? String(latestCompletedAmendment.isUsingFacilityEndDate) : value;
        return isTrueSet(isUsingFED) ? BOOLEAN.YES : BOOLEAN.NO;
      },
      isHidden: !isFacilityEndDateEnabledOnGefVersion(dealVersion),
    },
    {
      label: 'Facility end date',
      id: 'facilityEndDate',
      href: `${facilityUrl}/facility-end-date?status=change`,
      method: (value) => {
        const facilityEndDate = latestCompletedAmendment ? latestCompletedAmendment.facilityEndDate : value;
        // facilityEndDate is an ISO-8601 string with milliseconds (e.g '2024-02-14T00:00:00.000+00:00')
        const date = parseISO(facilityEndDate);
        return format(date, 'd MMMM yyyy');
      },
      isHidden: !isUsingFacilityEndDate || !isFacilityEndDateEnabledOnGefVersion(dealVersion),
    },
    {
      label: 'Bank review date',
      id: 'bankReviewDate',
      href: `${facilityUrl}/bank-review-date?status=change`,
      method: (value) => {
        const bankReviewDate = latestCompletedAmendment ? latestCompletedAmendment.bankReviewDate : value;
        // bankReviewDate is an ISO-8601 string with milliseconds (e.g '2024-02-14T00:00:00.000+00:00')
        const date = parseISO(bankReviewDate);
        return format(date, 'd MMMM yyyy');
      },
      isHidden: isUsingFacilityEndDate || !isFacilityEndDateEnabledOnGefVersion(dealVersion),
    },
    {
      label: 'Facility provided on',
      id: 'details',
      href: `${facilityUrl}/provided-facility?status=change`,
      isDetails: true,
    },
    {
      label: 'Facility value',
      id: 'value',
      href: `${facilityUrl}/facility-currency?status=change`,
      method: (value) => {
        const facilityValue = latestCompletedAmendment ? latestCompletedAmendment.value : value;
        return facilityValue;
      },
      isCurrency: true,
    },
    {
      label: 'Percentage of UKEF cover needed',
      id: 'coverPercentage',
      href: `${facilityUrl}/facility-value?status=change`,
      suffix: '%',
    },
    {
      label: 'Your bank’s maximum liability',
      id: 'banksMaximumLiability',
      href: `${facilityUrl}`,
      isCurrency: true,
    },
    {
      label: 'UKEF’s maximum liability',
      id: 'ukefMaximumLiability',
      href: `${facilityUrl}`,
      isCurrency: true,
    },
    {
      label: type === FACILITY_TYPE.CASH ? 'Interest margin your bank will charge' : 'Risk margin your bank will charge',
      id: 'interestPercentage',
      href: `${facilityUrl}/facility-value?status=change`,
      suffix: '%',
    },
    {
      label: 'Frequency your bank will pay the UKEF guarantee fee',
      id: feeType === AT_MATURITY ? 'feeType' : 'feeFrequency',
      href: `${facilityUrl}/facility-guarantee?status=change`,
      suffix: feeType === AT_MATURITY ? '' : `, ${feeType}`,
    },
    {
      label: 'Day count basis',
      id: 'dayCountBasis',
      href: `${facilityUrl}/facility-guarantee?status=change`,
    },
  ];

  return items;
};

module.exports = {
  exporterItems,
  eligibilityCriteriaItems,
  facilityItems,
};
