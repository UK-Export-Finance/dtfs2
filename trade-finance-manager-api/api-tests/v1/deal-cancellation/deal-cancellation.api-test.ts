import { ObjectId } from 'mongodb';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import createApi from '../../api';
import app from '../../../src/createApp';
import testUserCache from '../../api-test-users';
import { MOCK_TFM_SESSION_USER } from '../../../src/v1/__mocks__/mock-tfm-session-user.ts';

const { as, put } = createApi(app);

describe('/v1/tfm/deals/:id/cancellation', () => {
  const validId = new ObjectId().toString();

  const payload = {
    dealCancellationUpdate: { reason: 'test reason' },
    auditDetails: generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id),
  };

  describe('PUT /v1/tfm/deals/:id/cancellation', () => {
    const getTfmDealCancellationUpdateUrl = ({ id }: { id: string }) => `/v1/tfm/deals/${id}/cancellation`;

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

    it('puts the deal cancellation for an authenticated user', async () => {
      // Arrange
      const tokenUser = await testUserCache.initialise(app);
      const url = getTfmDealCancellationUpdateUrl({ id: validId });

      // Act
      const response = await as(tokenUser).put(payload).to(url);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body).not.toBeNull();
    });
  });
});
