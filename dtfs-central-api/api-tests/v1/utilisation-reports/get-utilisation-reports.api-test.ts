import { Response } from 'supertest';
import { MONGO_DB_COLLECTIONS, UtilisationReport } from '@ukef/dtfs2-common';
import wipeDB from '../../wipeDB';
import app from '../../../src/createApp';
import db from '../../../src/drivers/db-client';
import { MOCK_UTILISATION_REPORT } from '../../mocks/utilisation-reports/utilisation-reports';
import createApi from '../../api';

const api = createApi(app);

const getUrl = (bankId: string) => `/v1/bank/${bankId}/utilisation-reports`;

interface CustomResponse extends Response {
  body:
    | {
        errors: {
          msg: string;
        }[];
      }
    | ({ errors?: undefined } & UtilisationReport);
}

describe('GET /v1/bank/:bankId/utilisation-reports', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  it('returns 400 when an invalid bank id is provided', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl('invalid-mongo-id'));

    // Assert
    expect(response.status).toEqual(400);

    expect(response.body.errors?.at(0)?.msg).toEqual('The bank id provided should be a string of numbers');
  });

  it('gets a utilisation report', async () => {
    // Arrange
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.UTILISATION_REPORTS);
    const { insertedId } = await collection.insertOne(MOCK_UTILISATION_REPORT);
    const _id = insertedId.toString();
    const dateUploadedAsISOString = MOCK_UTILISATION_REPORT.dateUploaded?.toISOString();

    // Act
    const response: CustomResponse = await api.get(getUrl(MOCK_UTILISATION_REPORT.bank.id));

    // Assert
    expect(response.status).toEqual(200);

    const expected = [
      {
        ...MOCK_UTILISATION_REPORT,
        _id,
        dateUploaded: dateUploadedAsISOString,
      },
    ];

    expect(response.body).toEqual(expected);
  });
});
