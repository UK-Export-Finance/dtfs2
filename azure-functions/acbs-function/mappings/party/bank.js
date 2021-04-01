const { now } = require('../../helpers/date');

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

const bankMap = ({ bank }) => ({
  alternateIdentifier: bank.partyUrn,
  industryClassification: '2501',
  name1: bank.name,
  smeType: '5',
  citizenshipClass: '1',
  officerRiskDate: now(),
  countryCode: 'GBR',
});

module.exports = bankMap;
