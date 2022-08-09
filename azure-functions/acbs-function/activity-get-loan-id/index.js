/*
 * GET Loan ID for facility DAF
 * *****************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP starter function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-amend-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */

const api = require('../api');
const { isHttpErrorStatus } = require('../helpers/http');

/**
 * GET loan id from facility ID
 * @param {Object} context DF context comprising of binding data
 * @returns {Object} Returns loan id from facility id
 */
const getLoanId = async (context) => {
  try {
    const { facilityId } = context.bindingData;

    if (facilityId) {
      const { status, data } = await api.getLoanId(facilityId);

      // Non 200 HTTP response code
      if (isHttpErrorStatus(status)) {
        throw new Error(
          JSON.stringify({
            name: 'ACBS Loan ID fetch error',
            facilityId,
            dataReceived: data,
          }, null, 4),
        );
      }

      // Validate returned data
      if (data.length) {
        const [loan] = data;

        if (loan.loanIdentifier) {
          return loan.loanIdentifier;
        }
      }

      // Throw an error upon data validation failure
      throw new Error(
        JSON.stringify({
          name: 'Void dataset returned',
          facilityId,
          dataReceived: data,
        }, null, 4),
      );
    }

    return null;
  } catch (e) {
    console.error('Error fetching loan id for facility: ', { e });
    throw new Error(e);
  }
};

module.exports = getLoanId;
