const { now } = require('../../helpers/date');
const { getSmeType } = require('./helpers');

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

const buyer = ({ deal }) => {
  const { submissionDetails } = deal.dealSnapshot;

  const countryCode = submissionDetails['buyer-address-country'] && submissionDetails['buyer-address-country'].code;
  const citizenshipClass = countryCode === 'GBR' ? '1' : '2';

  return {
    alternateIdentifier: deal.tfm.parties.buyer.partyUrn,
    industryClassification: '0001',
    name1: submissionDetails['buyer-name'],
    smeType: getSmeType(''),
    citizenshipClass,
    officerRiskDate: now(),
    countryCode,
  };
};

module.exports = buyer;
