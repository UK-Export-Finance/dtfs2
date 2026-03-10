/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { app } from '../../server/createApp';
import { api } from '../api';

const { get } = api(app);

describe('/industry-sectors', () => {
  describe('GET /industry-sectors', () => {
    it('returns a list of industry-sectors', async () => {
      // Act
      const { status, body } = await get('/industry-sectors');

      // Assert
      expect(status).toEqual(200);

      expect(body.industrySectors.length).toBeGreaterThan(1);

      expect(body.industries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: expect.any(Number),
            name: expect.any(String),
            classes: expect.arrayContaining([
              expect.objectContaining({
                code: expect.any(Number),
                name: expect.any(String),
              }),
            ]),
          }),
        ]),
      );
    });
  });

  describe('GET /v1/industry-sectors/:code', () => {
    it('returns country', async () => {
      // Act
      const { status, body } = await get('/industry-sectors/1008');

      // Assert
      expect(status).toEqual(200);

      expect(body.code).toBeDefined();
      expect(body.name).toBeDefined();
      expect(body.classes.length).toBeGreaterThan(0);
    });

    it("returns 404 when industry-sector doesn't exist", async () => {
      // Act
      const { status } = await get('/industry-sectors/1');

      // Assert
      expect(status).toEqual(404);
    });
  });
});
