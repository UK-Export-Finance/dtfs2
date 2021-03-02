import moment from 'moment';

const exporterItems = (exporterUri) => [
  {
    label: 'Companies House registration number',
    id: 'companiesHouseRegistrationNumber',
    href: `${exporterUri}/`,
  },
  {
    label: 'Company name',
    id: 'companyName',
    href: `${exporterUri}/`,
  },
  {
    label: 'Registered Address',
    id: 'registeredAddress',
  },
  {
    label: 'Correspondence address, if different',
    id: 'correspondenceAddress',
  },
  {
    label: 'Industry sector',
    id: 'industrySectorId',
  },
  {
    label: 'Industry class',
    id: 'industryClassId',
  },
  {
    label: 'SME type',
    id: 'smeTypeId',
    href: `${exporterUri}/`,
  },
  {
    label: 'Probability of default',
    id: 'probabilityOfDefault',
    href: `${exporterUri}/`,
  },
  {
    label: 'Is finance for this exporter increasing?',
    id: 'isFinanceIncreasing',
    href: `${exporterUri}/`,
  },
];

const facilityItems = (exporterUri) => [
  {
    label: 'Name',
    id: 'name',
    href: `${exporterUri}/`,
  },
  {
    label: 'Stage',
    id: 'stage',
    href: `${exporterUri}/`,
  },
  {
    label: 'Months the UKEF guarantee will be in place for',
    id: 'monthsOfCover',
    href: `${exporterUri}/`,
    suffix: ' months',
  },
  {
    label: 'Facility provided on',
    id: 'details',
    href: `${exporterUri}/`,
  },
  {
    label: 'Cash facility value',
    id: 'value',
    href: `${exporterUri}/`,
    suffix: ' GBP',
    isCurrency: true,
  },
  {
    label: 'Percentage of UKEF cover needed',
    id: 'coverPercentage',
    href: `${exporterUri}/`,
    suffix: '%',
  },
  {
    label: 'Cover start date',
    id: 'coverStartDate',
    href: `${exporterUri}/`,
    method: (callback) => moment(callback).format('D MMMM YYYY'),
  },
  {
    label: 'Cover end date',
    id: 'coverEndDate',
    href: `${exporterUri}/`,
    method: (callback) => moment(callback).format('D MMMM YYYY'),
  },
];

export {
  exporterItems,
  facilityItems,
};
