import moment from 'moment';
import { isTrueSet } from './helpers';
import { SME_TYPE, BOOLEAN, STAGE } from '../../constants';

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
    method: (callback) => SME_TYPE[callback],
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

const facilityItems = (facilityUrl, type) => [
  {
    label: 'Name',
    id: 'name',
    href: `${facilityUrl}/about-facility?status=change`,
  },
  {
    label: 'Stage',
    id: 'hasBeenIssued',
    href: `${facilityUrl}?status=change`,
    method: (callback) => (isTrueSet(callback) ? STAGE.ISSUED : STAGE.UNISSUED),
  },
  {
    label: 'Cover start date',
    id: 'coverStartDate',
    href: `${facilityUrl}/about-facility?status=change`,
    method: (callback) => moment(callback).format('D MMMM YYYY'),
  },
  {
    label: 'Cover end date',
    id: 'coverEndDate',
    href: `${facilityUrl}/about-facility?status=change`,
    method: (callback) => moment(callback).format('D MMMM YYYY'),
  },
  {
    label: 'Months the UKEF guarantee will be in place for',
    id: 'monthsOfCover',
    href: `${facilityUrl}`,
    suffix: ' months',
  },
  {
    label: 'Facility provided on',
    id: 'details',
    href: `${facilityUrl}`,
  },
  {
    label: 'Facility value',
    id: 'value',
    href: `${facilityUrl}`,
    isCurrency: true,
  },
  {
    label: 'Percentage of UKEF cover needed',
    id: 'coverPercentage',
    href: `${facilityUrl}`,
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
    label: type === 0 ? 'Interest margin your bank will charge' : 'Risk margin your bank will charge',
    id: 'interestPercentage',
    href: `${facilityUrl}`,
    suffix: '%',
  },
];

export {
  exporterItems,
  facilityItems,
};
