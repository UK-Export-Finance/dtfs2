import { AnyObject, TfmDealCancellation } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import createApi from '../../api.js';
import app from '../../../src/createApp.js';
import testUserCache from '../../api-test-users.js';

const getDealCancellationMock = jest.fn() as jest.Mock<Promise<TfmDealCancellation>>;

jest.mock('../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../src/v1/api'),
  getDealCancellation: () => getDealCancellationMock(),
}));

const originalProcessEnv = { ...process.env };
const { as, get } = createApi(app);

const validId = new ObjectId().toString();

describe('/v1/deals/:id/cancellation', () => {
  describe('GET /v1/deals/:id/cancellation', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    afterAll(() => {
      jest.restoreAllMocks();
      process.env = originalProcessEnv;
    });

    const getTfmDealCancellationUrl = ({ id }: { id: string }) => `/v1/deals/${id}/cancellation`;

    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is disabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'false';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('returns a 404 response', async () => {
        // Arrange
        const tokenUser = await testUserCache.initialise(app);
        const url = getTfmDealCancellationUrl({ id: validId });

        // Act
        const response = await as(tokenUser).get(url);

        // Assert
        expect(response.status).toEqual(404);
      });
    });

    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is enabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'true';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('returns a 401 response when user is not authenticated', async () => {
        // Arrange
        const url = getTfmDealCancellationUrl({ id: validId });

        // Act
        const response = await get(url);

        // Assert
        expect(response.status).toEqual(401);
      });

      it('returns a 400 response when the id path param is invalid', async () => {
        // Arrange
        const tokenUser = await testUserCache.initialise(app);
        const url = getTfmDealCancellationUrl({ id: 'invalid' });

        // Act
        const response = await as(tokenUser).get(url);

        // Assert
        expect(response.status).toEqual(400);
      });

      it('returns the deal cancellation object for an authenticated user', async () => {
        // Arrange
        const tfmDealCancellation: TfmDealCancellation = {
          reason: 'Test Reason',
          bankRequestDate: new Date().valueOf(),
          effectiveFrom: new Date().valueOf(),
        };

        jest.mocked(getDealCancellationMock).mockResolvedValue(tfmDealCancellation);
        const tokenUser = await testUserCache.initialise(app);
        const url = getTfmDealCancellationUrl({ id: validId });

        // Act
        const response = await as(tokenUser).get(url);

        // Assert
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(tfmDealCancellation);
      });
    });
  });
});
