const moment = require('moment');
const { isTrueSet } = require('./helpers');
const {
  BOOLEAN, STAGE, FACILITY_TYPE,
} = require('../constants');

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
    href: `${exporterUrl}/enter-exporters-correspondence-address?status=change`,
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
    method: (callback) => callback,
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
    method: (callback) => (isTrueSet(callback) ? BOOLEAN.YES : BOOLEAN.NO),
  },
];

const eligibilityCriteriaItems = (coverUrl) => [
  {
    label: 'Cover',
    id: 'cover',
    href: `${coverUrl}`,
  },
];

const facilityItems = (facilityUrl, {
  type,
  hasBeenIssued,
  shouldCoverStartOnSubmission,
  ukefFacilityId,
  feeType,
  issueDate,
}) => {
  const AT_MATURITY = 'At maturity';
  return [
    {
      label: 'Name',
      id: 'name',
      href: `${facilityUrl}/about-facility?status=change`,
    },
    {
      label: 'UKEF facility ID',
      id: 'ukefFacilityId',
      href: '#',
      isHidden: !ukefFacilityId,
    },
    {
      label: 'Stage',
      id: 'hasBeenIssued',
      href: `${facilityUrl}?status=change`,
      method: (callback) => (isTrueSet(callback) ? STAGE.ISSUED : STAGE.UNISSUED),
    },
    {
      label: 'Date issued to exporter',
      id: 'issueDate',
      method: (callback) => moment(callback)
        .format('D MMMM YYYY'),
      isHidden: !issueDate,
    },
    {
      label: 'Cover start date',
      id: 'coverStartDate',
      href: `${facilityUrl}/about-facility?status=change`,
      method: (callback) => moment(callback)
        .format('D MMMM YYYY'),
      isHidden: !hasBeenIssued,
      shouldCoverStartOnSubmission,
      issueDate,
    },
    {
      label: 'Cover end date',
      id: 'coverEndDate',
      href: `${facilityUrl}/about-facility?status=change`,
      method: (callback) => moment(callback)
        .format('D MMMM YYYY'),
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
      label: 'Facility provided on',
      id: 'details',
      href: `${facilityUrl}/provided-facility?status=change`,
      isDetails: true,
    },
    {
      label: 'Facility value',
      id: 'value',
      href: `${facilityUrl}/facility-currency?status=change`,
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
};

module.exports = {
  exporterItems,
  eligibilityCriteriaItems,
  facilityItems,
};
