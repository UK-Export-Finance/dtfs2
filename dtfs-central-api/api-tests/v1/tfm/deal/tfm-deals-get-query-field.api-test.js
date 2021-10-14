const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const now = require('../../../../src/now');
const CONSTANTS = require('../../../../src/constants');
const {
  newDeal,
  createAndSubmitDeals,
  updateDealsTfm,
} = require('./tfm-deals-get.api-test');

describe('/v1/tfm/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('GET /v1/tfm/deals', () => {
    describe('filter by custom field names and values', () => {
      it('returns deals filtered by tfm.dateReceived', async () => {
        const miaDeal = newDeal({
          details: {
            ukefDealId: 'test-1',
          },
        });

        const minDeal = newDeal({
          details: {
            ukefDealId: 'test-2',
          },
        });

        const [ 
          submittedMIADeal,
          submittedMINDeal,
        ] = await createAndSubmitDeals([
          miaDeal,
          minDeal,
        ]);

        await updateDealsTfm([
          {
            _id: submittedMIADeal._id,
            tfm: {
              dateReceived: '13-11-2021',
            },
          },
          {
            _id: submittedMINDeal._id,
            tfm: {
              dateReceived: '12-11-2021',
            },
          },
        ]);

        const mockReqBody = {
          queryParams: {
            byField: [
              {
                name: 'tfm.dateReceived',
                value: '12-11-2021',
              },
            ],
          },
        };

        const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

        expect(status).toEqual(200);

        const expectedDeals = [
          {
            ...submittedMINDeal,
            tfm: {
              ...submittedMINDeal.tfm,
              dateReceived: '12-11-2021',
            },
          },
        ];

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });
    });
  });
});
