import { app } from '../../src/createApp';
const { get } = require('../api')(app);

describe('/industry-sectors', () => {
   describe('GET /industry-sectors', () => {
      it('returns a list of industry-sectors', async () => {
         const { status, body } = await get('/industry-sectors');
         expect(status).toEqual(200);
         expect(body.industrySectors.length).toBeGreaterThan(1);
         body.industrySectors.forEach((industrySector: any) => {
            expect(industrySector.code).toBeDefined();
            expect(industrySector.name).toBeDefined();
            expect(industrySector.classes.length).toBeGreaterThan(0);
         });
      });
   });

   describe('GET /v1/industry-sectors/:code', () => {
      it('returns country', async () => {
         const { status, body } = await get('/industry-sectors/1008');
         expect(status).toEqual(200);
         expect(body.code).toBeDefined();
         expect(body.name).toBeDefined();
         expect(body.classes.length).toBeGreaterThan(0);
      });

      it("returns 404 when industry-sector doesn't exist", async () => {
         const { status } = await get('/industry-sectors/1');
         expect(status).toEqual(404);
      });
   });
});
