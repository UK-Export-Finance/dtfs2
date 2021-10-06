const { now } = require('../../helpers/date');
const { getSmeType, getPartyNames } = require('./helpers');
const CONSTANTS = require('../../constants');

let countryCode;
let dealCountry;

/*
Field mapping based on email from Gareth Ashby 15/03/2021
  partyAlternateIdentifier  string  UKEF Party URN
  industryClassification    string  4 digit industry class, banks = 2501, if not known then use 0001, default to 0116
  name1                     string  First 35 characters of Party name
  name2                     string  Characters 36 – 70 of Party name
  name3                     string  Characters 71 – 105 of Party name
  sme                       string  Workflow sme type code  4 digit code - default if unknown 70
  citizenshipClass          string  If Customer domicile country is UK set to '1' otherwise '2'
  officerRiskDate           date    yyyy-MM-dd i.e. 2019-10-21, Date of creation (we use current date)
  */

const exporter = ({ deal, acbsReference }) => {
  // Get Deal's Snapshot
  const submissionDetails = deal.dealSnapshot;

  // Get Product Type i.e. GEF
  const product = deal.dealSnapshot.dealType;

  if (product === CONSTANTS.PRODUCT.TYPE.GEF) {
    countryCode = submissionDetails.exporter.registeredAddress.country;
    dealCountry = 'GB';
  } else {
    countryCode = submissionDetails['supplier-address-country'] && submissionDetails['supplier-address-country'].code;
    dealCountry = 'GBR';
  }

  const citizenshipClass = countryCode === dealCountry ? '1' : '2';
  const partyNames = getPartyNames(product === CONSTANTS.PRODUCT.TYPE.GEF
    ? submissionDetails.exporter.companyName
    : submissionDetails['supplier-name']);

  return {
    alternateIdentifier: deal.tfm.parties.exporter.partyUrn,
    industryClassification: acbsReference.supplierAcbsIndustryCode,
    ...partyNames,
    smeType: getSmeType(product === CONSTANTS.PRODUCT.TYPE.GEF
      ? submissionDetails.exporter.smeType
      : submissionDetails['sme-type']),
    citizenshipClass,
    officerRiskDate: now(),
    countryCode,
  };
};

module.exports = exporter;
