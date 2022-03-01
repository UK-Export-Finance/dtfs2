const { now } = require('../../helpers/date');
const { getSmeType, getPartyNames } = require('./helpers');
const CONSTANTS = require('../../constants');

/*
Field mapping based on email from Gareth Ashby 15/03/2021
  partyAlternateIdentifier  string  UKEF Party URN (Maximum 20 character)
  industryClassification    string  4 digit industry class, banks = 2501, if not known then use 0001, default to 0116
  name1                     string  First 35 characters of Party name
  name2                     string  Characters 36 – 70 of Party name
  name3                     string  Characters 71 – 105 of Party name
  sme                       string  Workflow sme type code  4 digit code - default if unknown 70
  citizenshipClass          string  If Customer domicile country is UK set to '1' otherwise '2'
  officerRiskDate           date    yyyy-MM-dd i.e. 2019-10-21, Date of creation (we use current date)
  countryCode               string  3 Character ISO Code
  */

const exporter = ({ deal, acbsReference }) => {
  const countryCode = acbsReference.country.supplierAcbsCountryCode
    ? acbsReference.country.supplierAcbsCountryCode
    : acbsReference.country;
  const sme = deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF
    ? deal.dealSnapshot.exporter.smeType
    : deal.dealSnapshot.submissionDetails['sme-type'];
  const citizenshipClass = countryCode === CONSTANTS.DEAL.COUNTRY.DEFAULT
    ? CONSTANTS.PARTY.CITIZENSHIP_CLASS.UNITED_KINGDOM
    : CONSTANTS.PARTY.CITIZENSHIP_CLASS.ROW;
  const partyNames = getPartyNames(deal.dealSnapshot.exporter.companyName);

  return {
    alternateIdentifier: deal.tfm.parties.exporter.partyUrn.substring(0, 20),
    industryClassification: acbsReference.supplierAcbsIndustryCode,
    ...partyNames,
    smeType: getSmeType(sme),
    citizenshipClass,
    officerRiskDate: now(),
    countryCode,
  };
};

module.exports = exporter;
