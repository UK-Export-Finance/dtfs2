/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { app } from '../../server/createApp';
import { api } from '../api';

const { get } = api(app);

describe('/credit-risk-ratings', () => {
  describe('GET /credit-risk-ratings', () => {
    it('returns a list of credit-risk-ratings', async () => {
      // Act
      const { status, body } = await get('/credit-risk-ratings');

      // Assert
      expect(status).toEqual(200);

      expect(body?.length).toBeGreaterThan(1);

      const expected = expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(Number),
          description: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          effectiveFrom: expect.any(String),
          effectiveTo: expect.any(String),
        }),
      ]);

      expect(body).toEqual(expected);
    });
  });
});
