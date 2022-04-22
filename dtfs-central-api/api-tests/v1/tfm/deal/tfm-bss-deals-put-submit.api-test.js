const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const DEFAULTS = require('../../../../src/v1/defaults');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  bankInternalRefName: 'Test',
  additionalRefName: 'Test',
  details: {
    submissionCount: 1,
  },
};

const newFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
};

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

describe('/v1/tfm/deals/submit - BSS/EWCS deal', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  it('returns dealSnapshot with tfm object', async () => {
    const { body: createDealBody } = await api.post({
      deal: newDeal,
      user: mockUser,
    }).to('/v1/portal/deals');

    const dealId = createDealBody._id;

    const { status, body } = await api.put({
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      dealId,
    }).to('/v1/tfm/deals/submit');

    expect(status).toEqual(200);

    const { body: dealAfterCreation } = await api.get(`/v1/portal/deals/${dealId}`);

    const expected = {
      _id: createDealBody._id,
      dealSnapshot: {
        ...dealAfterCreation.deal,
        facilities: [],
      },
      tfm: DEFAULTS.DEAL_TFM,
    };

    expect(body).toEqual(expected);
  });

  it('creates facility snapshots and tfm object', async () => {
    // create deal
    const { body: createDealBody } = await api.post({
      deal: newDeal,
      user: mockUser,
    }).to('/v1/portal/deals');

    const dealId = createDealBody._id;

    // create facilities
    const newFacility1 = { ...newFacility, dealId };
    const newFacility2 = { ...newFacility, dealId };

    const { body: facility1Body } = await api.post({
      facility: newFacility1,
      user: mockUser,
    }).to('/v1/portal/facilities');

    const { body: facility2Body } = await api.post({
      facility: newFacility2,
      user: mockUser,
    }).to('/v1/portal/facilities');

    const facility1Id = facility1Body._id;
    const facility2Id = facility2Body._id;

    // submit deal
    const { status } = await api.put({
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      dealId,
    }).to('/v1/tfm/deals/submit');

    expect(status).toEqual(200);

    // get the facilities in tfm
    const facility1 = await api.get(`/v1/tfm/facilities/${facility1Id}`);

    expect(facility1.status).toEqual(200);
    expect(facility1.body).toEqual({
      _id: facility1Id,
      facilitySnapshot: {
        _id: facility1Id,
        ...newFacility1,
        createdDate: expect.any(Number),
        updatedAt: expect.any(Number),
      },
      tfm: DEFAULTS.FACILITY_TFM,
      amendments: {
        history: [],
      },
    });

    const facility2 = await api.get(`/v1/tfm/facilities/${facility2Id}`);

    expect(facility2.status).toEqual(200);
    expect(facility2.body).toEqual({
      _id: facility2Id,
      facilitySnapshot: {
        _id: facility2Id,
        ...newFacility2,
        createdDate: expect.any(Number),
        updatedAt: expect.any(Number),
      },
      tfm: DEFAULTS.FACILITY_TFM,
      amendments: {
        history: [],
      },
    });
  });
});
