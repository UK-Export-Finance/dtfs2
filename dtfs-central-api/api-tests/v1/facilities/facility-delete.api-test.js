const axios = require('axios');
const { MOCK_BSS_FACILITY, MOCK_BSS_DEAL, MOCK_USER } = require('../mocks/mock-data');

const { DTFS_CENTRAL_API } = process.env;

describe('/v1/portal/facilities', () => {
  let bondFacilityId;
  let dealId;

  beforeAll(async () => {
    const { data: deal } = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API}/v1/portal/deals`,
      data: { deal: MOCK_BSS_DEAL, user: MOCK_USER },
    });

    dealId = deal._id;
    MOCK_BSS_FACILITY.dealId = dealId;

    const { data: facility } = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API}/v1/portal/facilities`,
      data: { facility: MOCK_BSS_FACILITY, user: MOCK_USER },
    });

    bondFacilityId = facility._id;
  });

  describe('DELETE /v1/portal/facilities/:id', () => {
    it('deletes the facility', async () => {
      const removeBody = {
        dealId: MOCK_BSS_FACILITY.dealId,
        user: MOCK_USER,
      };

      const { status } = await axios({
        method: 'delete',
        url: `${DTFS_CENTRAL_API}/v1/portal/facilities/${bondFacilityId}`,
        data: removeBody,
      });

      expect(status).toEqual(200);
    });
  });
});
