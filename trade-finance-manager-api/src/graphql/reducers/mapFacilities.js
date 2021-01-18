const moment = require('moment');
const CONSTANTS = require('../../constants');
const { hasValue } = require('../../utils/string');

const mapFacilities = (facilities) => {
  const mappedFacilities = [];

  facilities.forEach((f) => {
    const facility = f;
    // facilityType will eventually be facilityProduct / facilityProductCode
    // TODO: refactor when DTFS2-3054 is completed.
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
      // only bonds have `bondType`
      facility.facilityProduct = CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND;
    }
    if (facility.interestMarginFee) {
      // only loans have `interestMarginFee`
      facility.facilityProduct = CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN;
    }

    if (facility.facilityProduct === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND) {
      // only bonds have `bondType`
      facility.facilityType = facility.bondType;
    } else {
      facility.facilityType = null;
    }

    const {
      'coverEndDate-day': coverEndDateDay,
      'coverEndDate-month': coverEndDateMonth,
      'coverEndDate-year': coverEndDateYear,
    } = facility;

    const hasCoverEndDate = (hasValue(coverEndDateDay)
                            && hasValue(coverEndDateMonth)
                            && hasValue(coverEndDateYear));

    if (hasCoverEndDate) {
      const coverEndDate = moment().set({
        date: Number(coverEndDateDay),
        month: Number(coverEndDateMonth) - 1, // months are zero indexed
        year: Number(coverEndDateYear),
      });

      facility.coverEndDate = moment(coverEndDate).format('D MMM YYYY');
    }

    facility.ukefExposure = `${facility.currency.id} ${facility.ukefExposure}`;
    facility.coveredPercentage = `${facility.coveredPercentage}%`;

    const facilityValue = facility.facilityValue;

    // DTFS-2727
    // for initial dev, only return facilityValue if currency is GBP.
    // until we figure out which API to use for conversion from non-GBP.
    if (facility.currency.id === 'GBP') {
      facility.facilityValue = `${facility.currency.id} ${facilityValue}`;
    } else {
      facility.facilityValue = '';
    }

    facility.facilityValueExportCurrency = `${facility.currency.id} ${facilityValue}`;

    mappedFacilities.push({
      _id: facility._id, // eslint-disable-line no-underscore-dangle
      facilityType: facility.facilityType,
      facilityProduct: facility.facilityProduct,
      coverEndDate: facility.coverEndDate,
      ukefExposure: facility.ukefExposure,
      coveredPercentage: facility.coveredPercentage,
      facilityValue: facility.facilityValue,
      facilityValueExportCurrency: facility.facilityValueExportCurrency,
    });
  });

  return mappedFacilities;
};

module.exports = mapFacilities;
