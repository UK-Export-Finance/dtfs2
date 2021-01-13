const moment = require('moment');
const CONSTANTS = require('../../constants');

const mapFacilities = (facilities) => {
  const mappedFacilities = facilities;

  mappedFacilities.map((f) => {
    const facility = f;
    if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
      facility.facilityProduct = CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND;
    }
    if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
      facility.facilityProduct = CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN;
    }

    // currently, we don't always have facilityType.
    // this is a hacky fallback/workaround for initial TFM development.
    // TODO: remove this once DTFS2-3054 is completed.
    if (facility.bondType) {
      facility.facilityProduct = CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND;
    }
    if (facility.disbursementAmount) {
      facility.facilityProduct = CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN;
    }

    const {
      'coverEndDate-day': coverEndDateDay,
      'coverEndDate-month': coverEndDateMonth,
      'coverEndDate-year': coverEndDateYear,
    } = facility;

    const coverEndDate = moment().set({
      date: Number(coverEndDateDay),
      month: Number(coverEndDateMonth) - 1, // months are zero indexed
      year: Number(coverEndDateYear),
    });

    facility.coverEndDate = moment(coverEndDate).format('DD MMM YYYY');

    const formattedCoveredPercentage = `(${facility.coveredPercentage}%)`;
    facility.ukefExposure = `GBP ${facility.ukefExposure} ${formattedCoveredPercentage}`;

    return facility;
  });

  return mappedFacilities;
};

module.exports = mapFacilities;
