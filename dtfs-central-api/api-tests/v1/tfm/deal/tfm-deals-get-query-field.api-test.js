const { getTime, format } = require('date-fns');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
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
              lastUpdated: expect.any(Number),
            },
          },
        ];

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });

      it('returns deals filtered by dealSnapshot.eligibility.lastUpdated', async () => {
        const today = new Date();
        const todayTimestamp = getTime(today);
        const todayFormatted = format(new Date(), 'dd-MM-yyyy');

        const miaDeal = newDeal({
          eligibility: {
            lastUpdated: todayTimestamp,
          },
        });

        const minDeal = newDeal({});

        const [submittedMIADeal] = await createAndSubmitDeals([miaDeal, minDeal]);

        const mockReqBody = {
          queryParams: {
            byField: [
              {
                name: 'dealSnapshot.eligibility.lastUpdated',
                value: todayFormatted,
              },
            ],
          },
        };

        const { status, body } = await api.get('/v1/tfm/deals', mockReqBody);

        expect(status).toEqual(200);

        const expectedDeals = [
          submittedMIADeal,
        ];

        expect(body.deals.length).toEqual(expectedDeals.length);

        expect(body.deals).toEqual(expectedDeals);
      });
    });
  });
});
