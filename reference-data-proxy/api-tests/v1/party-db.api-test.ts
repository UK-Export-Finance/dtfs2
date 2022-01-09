import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const externalAPIsURL: string = process.env.REFERENCE_DATA_PROXY_URL!;

describe('GET /v1/party-db/:partyDbCompanyRegistrationNumber', () => {
   it('should return 404 status code from successful party lookup', async () => {
      let status;
      try {
         await axios({
           method: 'GET',
           url: `${externalAPIsURL}/party-db/1234`,
         });
       } catch (error: any) {
         status = error.response.status;
       }
       expect(status).toEqual(404);
   });
});
