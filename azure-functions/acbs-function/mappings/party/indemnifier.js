const { now } = require('../../helpers/date');
const { getPartyNames } = require('./helpers');
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
*/

const indemnifier = ({ deal }) => {
  const { submissionDetails } = deal.dealSnapshot;
  const countryCode = submissionDetails['indemnifier-address-country'] && submissionDetails['indemnifier-address-country'].code;
  const citizenshipClass = countryCode === CONSTANTS.DEAL.COUNTRY.DEFAULT
    ? CONSTANTS.PARTY.CITIZENSHIP_CLASS.UNITED_KINGDOM
    : CONSTANTS.PARTY.CITIZENSHIP_CLASS.ROW;
  const partyNames = getPartyNames(submissionDetails['indemnifier-name']);

  return {
    alternateIdentifier: deal.tfm.parties.indemnifier.partyUrn.substring(0, 20),
    industryClassification: CONSTANTS.PARTY.INDUSTRY_CLASSFICATION.DEFAULT,
    smeType: CONSTANTS.PARTY.SME_TYPE.NOT_KNOWN,
    citizenshipClass,
    officerRiskDate: now(),
    countryCode,
    ...partyNames,
  };
};

module.exports = indemnifier;
