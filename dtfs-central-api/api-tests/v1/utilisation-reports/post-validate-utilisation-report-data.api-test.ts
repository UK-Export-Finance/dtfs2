import { HttpStatusCode } from 'axios';
import { Response } from 'supertest';
import {
  FACILITY_TYPE,
  FacilityType,
  GEF_FACILITY_TYPE,
  MONGO_DB_COLLECTIONS,
  TfmFacility,
  UTILISATION_REPORT_HEADERS,
  UtilisationReportDataValidationError,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
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
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`returns a ${HttpStatusCode.BadRequest} when the 'reportData' items are not csv rows`, async () => {
    // Arrange
    const requestBody = {
      reportData: [{ 'a key': 'this is not cell data' }],
    };

    // Act
    const response = await testApi.post(requestBody).to(URL);

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
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
      expect(response.status).toEqual(HttpStatusCode.Ok);
    });

    describe('and when the UKEF facility ID is not an 8 to 10 digit string', () => {
      const expectedError = 'UKEF facility ID must be an 8 to 10 digit number';

      const ukefFacilityId = '1234567';

      it('should return the "facility ID format" error', async () => {
        // Arrange
        const requestBody = {
          reportData: [{ [UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]: { value: ukefFacilityId, row: '2', column: 'C' } }],
        };

        // Act
        const response: SuccessResponse = await testApi.post(requestBody).to(URL);

        // Assert
        const errorMessages = response.body.csvValidationErrors.map(({ errorMessage }) => errorMessage);
        expect(errorMessages).toContain(expectedError);
      });
    });

    describe('and when the UKEF facility ID is an 8 to 10 digit string', () => {
      const expectedError = 'The facility ID has not been recognised. Enter a facility ID for a general export facility.';

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

      describe('and when the supplied facility id does not exist in the TFM facilities collection', () => {
        it('should return the "facility ID not recognised" error', async () => {
          // Arrange
          const requestBody = getRequestBody();

          // Act
          const response: SuccessResponse = await testApi.post(requestBody).to(URL);

          // Assert
          const errorMessages = response.body.csvValidationErrors.map(({ errorMessage }) => errorMessage);
          expect(errorMessages).toContain(expectedError);
        });
      });

      describe('and when the supplied facility id exists in the TFM facilities collection', () => {
        it.each(difference(Object.values(FACILITY_TYPE), Object.values(GEF_FACILITY_TYPE)))(
          'should return the "facility ID not recognised" error for unsupported facility type "%s"',
          async (facilityType: FacilityType) => {
            // Arrange
            const requestBody = getRequestBody();

            const tfmFacility: TfmFacility = {
              ...aTfmFacility(),
              facilitySnapshot: {
                ...aFacility(),
                type: facilityType,
                ukefFacilityId,
              },
            };

            const tfmFacilitiesCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
            await tfmFacilitiesCollection.insertOne(tfmFacility);

            // Act
            const response: SuccessResponse = await testApi.post(requestBody).to(URL);

            // Assert
            const errorMessages = response.body.csvValidationErrors.map(({ errorMessage }) => errorMessage);
            expect(errorMessages).toContain(expectedError);
          },
        );

        it.each(Object.values(GEF_FACILITY_TYPE))(
          'should not return the "facility ID not recognised" error for supported facility type "%s"',
          async (facilityType: FacilityType) => {
            // Arrange
            const requestBody = getRequestBody();

            const tfmFacility: TfmFacility = {
              ...aTfmFacility(),
              facilitySnapshot: {
                ...aFacility(),
                type: facilityType,
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
          },
        );
      });
    });
  });
});
