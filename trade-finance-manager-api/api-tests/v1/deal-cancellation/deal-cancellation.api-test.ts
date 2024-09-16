import { ObjectId } from 'mongodb';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { isTfmDealCancellationFeatureFlagEnabled } from '@ukef/dtfs2-common';
import createApi from '../../api';
import api from '../../../src/v1/api';
import app from '../../../src/createApp';
import testUserCache from '../../api-test-users';
import { MOCK_TFM_SESSION_USER } from '../../../src/v1/__mocks__/mock-tfm-session-user.ts';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('../../../src/v1/api', () => ({
  ...jest.requireActual('../../../src/v1/api'),
  updateDealCancellation: jest.fn(),
}));

const mock = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmDealCancellationFeatureFlagEnabled: () => mock,
}));

const { as, put } = createApi(app);

const validId = new ObjectId().toString();

const mockUpdateResult = {
  acknowledged: true,
  modifiedCount: 1,
  matchedCount: 1,
  upsertedCount: 1,
  upsertedId: new ObjectId(validId),
};

describe('/v1/deals/:id/cancellation', () => {
  const payload = {
    dealCancellationUpdate: { reason: 'test reason' },
    auditDetails: generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id),
  };

  describe('PUT /v1/deals/:id/cancellation', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(api.updateDealCancellation).mockResolvedValue(mockUpdateResult);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    const getTfmDealCancellationUpdateUrl = ({ id }: { id: string }) => `/v1/deals/${id}/cancellation`;

    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is disabled', () => {
      beforeEach(() => {
        jest.mocked(mock).mockReturnValue(false);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('returns a 404 response for an authenticated user with a valid id path', async () => {
        // Arrange
        const tokenUser = await testUserCache.initialise(app);
        const url = getTfmDealCancellationUpdateUrl({ id: validId });

        // Act
        const response = await as(tokenUser).put(payload).to(url);

        // Assert
        expect(response.status).toEqual(404);
      });
    });

    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is enabled', () => {
      beforeEach(() => {
        jest.mocked(isTfmDealCancellationFeatureFlagEnabled).mockReturnValue(true);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('returns a 401 response when user is not authenticated', async () => {
        // Arrange
        const url = getTfmDealCancellationUpdateUrl({ id: validId });

        // Act
        const response = await put(url);

        // Assert
        expect(response.status).toEqual(401);
      });

      it('returns a 400 response when the id path param is invalid', async () => {
        // Arrange
        const tokenUser = await testUserCache.initialise(app);
        const url = getTfmDealCancellationUpdateUrl({ id: 'invalid' });

        // Act
        const response = await as(tokenUser).put(payload).to(url);

        // Assert
        expect(response.status).toEqual(400);
      });

      it('updates the deal cancellation for an authenticated user', async () => {
        // Arrange
        const tokenUser = await testUserCache.initialise(app);
        const url = getTfmDealCancellationUpdateUrl({ id: validId });

        // Act
        const response = await as(tokenUser).put(payload).to(url);

        const expectedResponse = { ...mockUpdateResult, upsertedId: validId };

        // Assert
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(expectedResponse);
      });
    });
  });
});
