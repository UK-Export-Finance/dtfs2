const { getFacility, getApplication } = require('../services/api');
const { FACILITY_TYPE } = require('../constants');

class Facility {
  static async find({ dealId, facilityId, status, user, userToken }) {
    try {
      const { details } = await getFacility({ facilityId, userToken });
      const { bank } = await getApplication({ dealId, userToken });
      if (bank.id !== user.bank.id) {
        return null;
      }
      const facilityTypeConst = FACILITY_TYPE[details.type?.toUpperCase()];
      const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';

      const value = JSON.stringify(details.value);
      const coverPercentage = JSON.stringify(details.coverPercentage);
      const interestPercentage = JSON.stringify(details.interestPercentage);

      return {
        currency: details.currency?.id,
        value,
        facilityType: facilityTypeConst,
        coverPercentage: coverPercentage !== 'null' ? coverPercentage : null,
        interestPercentage: interestPercentage !== 'null' ? interestPercentage : null,
        facilityTypeString,
        dealId,
        facilityId,
        status,
        feeFrequency: details.feeFrequency,
        dayCountBasis: details.dayCountBasis,
        feeType: details.feeType,
      };
    } catch (error) {
      console.info('GEF Facility model error %o', error);
      throw new Error('GEF Facility model error');
    }
  }
}

module.exports = Facility;
