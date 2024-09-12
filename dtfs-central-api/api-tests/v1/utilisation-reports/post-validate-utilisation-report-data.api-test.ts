import { HttpStatusCode } from 'axios';
import { Response } from 'supertest';
import { MONGO_DB_COLLECTIONS, TfmFacility, UTILISATION_REPORT_HEADERS, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { aFacility, aTfmFacility } from '../../../test-helpers';

interface SuccessResponse extends Response {
  body: {
    csvValidationErrors: UtilisationReportDataValidationError[];
  };
}

console.error = jest.fn();

const URL = '/v1/utilisation-reports/report-data-validation';

describe(`POST ${URL}`, () => {
  it(`returns a ${HttpStatusCode.BadRequest} when the 'reportData' field is missing fom request body`, async () => {
    // Arrange
    const requestBody = {};

    // Act
    const response = await testApi.post(requestBody).to(URL);

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it(`returns a ${HttpStatusCode.BadRequest} when the 'reportData' items are not csv rows`, async () => {
    // Arrange
    const requestBody = {
      reportData: [{ 'a key': 'this is not cell data' }],
    };

    // Act
    const response = await testApi.post(requestBody).to(URL);

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  describe('when the request body is valid', () => {
    it(`returns a ${HttpStatusCode.Ok}`, async () => {
      // Arrange
      const requestBody = {
        reportData: [{ 'a csv header': { value: null, row: '2', column: 'C' } }],
      };

      // Act
      const response = await testApi.post(requestBody).to(URL);

      // Assert
      expect(response.status).toBe(HttpStatusCode.Ok);
    });

    describe('and when the UKEF facility ID is an 8 to 10 digit string', () => {
      const expectedError = 'The Facility ID has not been recognised. Enter a valid Facility ID between 8 and 10 characters.';

      const ukefFacilityId = '123456789';

      const getRequestBody = () => ({
        reportData: [{ [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: ukefFacilityId, row: '2', column: 'C' } }],
      });

      beforeEach(async () => {
        const tfmFacilitiesCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
        await tfmFacilitiesCollection.deleteMany({});
      });

      afterAll(async () => {
        const tfmFacilitiesCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
        await tfmFacilitiesCollection.deleteMany({});
      });

      it('returns the "facility ID not recognised" error when the supplied facility id does not exist in the TFM facilities collection', async () => {
        // Arrange
        const requestBody = getRequestBody();

        // Act
        const response: SuccessResponse = await testApi.post(requestBody).to(URL);

        // Assert
        const errorMessages = response.body.csvValidationErrors.map(({ errorMessage }) => errorMessage);
        expect(errorMessages).toContain(expectedError);
      });

      it('does not return the "facility ID not recognised" error when the facility id does exist in the TFM facilities collection', async () => {
        // Arrange
        const requestBody = getRequestBody();

        const tfmFacility: TfmFacility = {
          ...aTfmFacility(),
          facilitySnapshot: {
            ...aFacility(),
            ukefFacilityId,
          },
        };

        const tfmFacilitiesCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
        await tfmFacilitiesCollection.insertOne(tfmFacility);

        // Act
        const response: SuccessResponse = await testApi.post(requestBody).to(URL);

        // Assert
        const errorMessages = response.body.csvValidationErrors.map(({ errorMessage }) => errorMessage);
        expect(errorMessages).not.toContain(expectedError);
      });
    });
  });
});
