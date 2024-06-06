/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module acbs-get-facility-loan-id
 */

/*
 * GET Loan ID for facility DAF
 * *****************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP trigger function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-amend-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */
const df = require('durable-functions');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');

df.app.activity('get-facility-loan-id', {
  handler: async (facilityId) => {
    try {
      if (!facilityId) {
        throw new Error('Invalid facility ID');
      }

      if (facilityId) {
        const { status, data } = await api.getLoanId(facilityId);

        // Non 200 HTTP response code
        if (isHttpErrorStatus(status)) {
          throw new Error(
            JSON.stringify(
              {
                name: 'ACBS Loan ID fetch error',
                facilityId,
                dataReceived: data,
              },
              null,
              4,
            ),
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
          JSON.stringify(
            {
              name: 'Invalid dataset returned',
              facilityId,
              dataReceived: data,
            },
            null,
            4,
          ),
        );
      }

      return null;
    } catch (error) {
      console.error('Unable to get facility loan %o', error);
      throw new Error(`Unable to get facility loan ${error}`);
    }
  },
});
