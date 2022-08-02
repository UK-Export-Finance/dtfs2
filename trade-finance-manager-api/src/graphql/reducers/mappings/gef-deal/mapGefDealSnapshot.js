const mapGefDealDetails = require('./mapGefDealDetails');
const mapGefFacilities = require('../gef-facilities/mapGefFacilities');
const mapTotals = require('../deal/mapTotals');
const mapGefSubmissionDetails = require('./mapGefSubmissionDetails');

const mapGefDealSnapshot = async (dealSnapshot, dealTfm) => ({
  _id: dealSnapshot._id,
  dealType: dealSnapshot.dealType,
  status: dealSnapshot.status,
  updatedAt: dealSnapshot.updatedAt,
  isFinanceIncreasing: dealSnapshot.exporter.isFinanceIncreasing,
  submissionType: dealSnapshot.submissionType,
  maker: dealSnapshot.maker,
  bank: dealSnapshot.bank,
  exporter: {
    companyName: dealSnapshot.exporter.companyName,
  },
  bankInternalRefName: dealSnapshot.bankInternalRefName,
  additionalRefName: dealSnapshot.additionalRefName,
  details: mapGefDealDetails(dealSnapshot),
  submissionDetails: mapGefSubmissionDetails(dealSnapshot),
  eligibility: dealSnapshot.eligibility,
  supportingInformation: dealSnapshot.supportingInformation,
  facilities: await mapGefFacilities(dealSnapshot, dealTfm),
  totals: await mapTotals(dealSnapshot.facilities),
});

module.exports = mapGefDealSnapshot;
