const { generateTfmUserAuditDetails } = require('@ukef/dtfs2-common/src/helpers/changeStream/generateAuditDetails')
const {
  shouldCreatePartiesTask,
  shouldCreateAgentCheckTask,
  listAdditionalTasks,
  createDealTasks,
} = require('./deal.tasks');
const externalApis = require('../api');
const CONSTANTS = require('../../constants');
const MOCK_DEAL_MIA = require('../__mocks__/mock-deal-MIA-submitted');
const { createTasks } = require('../helpers/create-tasks');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');

describe('createDealTasks', () => {
  const updateDealSpy = jest.fn((dealId, dealUpdate, sessionUser) =>
    Promise.resolve({
      ...dealUpdate,
      auditDetails: generateTfmUserAuditDetails(sessionUser?._id),
    }),
  );

  let mockSubmittedDeal;
  let mockDealEligibilityCriteria11False;
  let mockDealWithPartyUrn;
  const sessionUser = { _id: 'tfm-user-id' }

  beforeEach(async () => {
    externalApis.updateDeal = updateDealSpy;

    mockSubmittedDeal = await mapSubmittedDeal({
      dealSnapshot: MOCK_DEAL_MIA,
      tfm: {
        parties: { exporter: {} },
      },
    });

    mockDealEligibilityCriteria11False = {
      ...mockSubmittedDeal,
      eligibility: {
        criteria: [
          { id: 11, answer: false },
        ],
      },
    };

    mockDealWithPartyUrn = {
      ...mockSubmittedDeal,
      tfm: {
        parties: { exporter: { partyUrn: '1234' } },
      },
    };
  });

  describe('shouldCreatePartiesTask', () => {
    describe('when a deal has tfm.exporter.partyUrn but NO tfm.buyer.partyUrn and deal is BSS', () => {
      it('should return true', () => {
        const result = shouldCreatePartiesTask(mockDealWithPartyUrn);
        expect(result).toEqual(true);
      });
    });

    describe('when a deal does NOT have tfm.exporter.partyUrn but has tfm.buyer.partyUrn and deal is BSS', () => {
      it('should return true', () => {
        mockDealWithPartyUrn.tfm.parties.buyer = { partyUrn: '1234' };
        mockDealWithPartyUrn.tfm.parties.exporter = '';
        const result = shouldCreatePartiesTask(mockDealWithPartyUrn);
        expect(result).toEqual(true);
      });
    });

    describe('when a deal has empty string tfm.exporter.partyUrn but has tfm.buyer.partyUrn and deal is BSS', () => {
      it('should return true', () => {
        mockDealWithPartyUrn.tfm.parties.buyer = { partyUrn: '1234' };
        mockDealWithPartyUrn.tfm.parties.exporter = { partyUrn: ' ' };
        const result = shouldCreatePartiesTask(mockDealWithPartyUrn);
        expect(result).toEqual(true);
      });
    });

    describe('when a deal has tfm.exporter.partyUrn and has tfm.buyer.partyUrn and deal is BSS', () => {
      it('should return true', () => {
        mockDealWithPartyUrn.tfm.parties.buyer = { partyUrn: '1234' };
        mockDealWithPartyUrn.tfm.parties.exporter = { partyUrn: '1234' };
        const result = shouldCreatePartiesTask(mockDealWithPartyUrn);
        expect(result).toEqual(false);
      });
    });

    describe('when a deal does NOT have tfm.exporter.partyUrn and NO tfm.buyer.partyUrn and deal is BSS', () => {
      it('should return true', () => {
        const result = shouldCreatePartiesTask(mockSubmittedDeal);
        expect(result).toEqual(true);
      });
    });

    describe('when a deal has tfm.exporter.partyUrn and deal is GEF', () => {
      it('should return false', () => {
        mockDealWithPartyUrn.tfm.parties.exporter = { partyUrn: '1234' };
        mockDealWithPartyUrn.dealType = CONSTANTS.DEALS.DEAL_TYPE.GEF;
        const result = shouldCreatePartiesTask(mockDealWithPartyUrn);
        expect(result).toEqual(false);
      });
    });

    describe('when a deal does NOT have tfm.exporter.partyUrn and deal is GEF', () => {
      it('should return true', () => {
        mockDealWithPartyUrn.tfm.parties.exporter = '';
        mockDealWithPartyUrn.dealType = CONSTANTS.DEALS.DEAL_TYPE.GEF;
        const result = shouldCreatePartiesTask(mockDealWithPartyUrn);
        expect(result).toEqual(true);
      });
    });

    describe('when a deal has a blank partyURN with a space in it', () => {
      it('should return true', () => {
        mockDealWithPartyUrn.tfm.parties.exporter = { partyUrn: ' ' };
        mockDealWithPartyUrn.dealType = CONSTANTS.DEALS.DEAL_TYPE.GEF;
        const result = shouldCreatePartiesTask(mockDealWithPartyUrn);
        expect(result).toEqual(true);
      });
    });
  });

  describe('shouldCreateAgentCheckTask', () => {
    describe('when a deal has is BSS MIA and eligibility criteria 11 is false', () => {
      it('should return true', () => {
        const result = shouldCreateAgentCheckTask(mockDealEligibilityCriteria11False);
        expect(result).toEqual(true);
      });
    });

    describe('when a deal is not BSS', () => {
      it('should return false', () => {
        const result = shouldCreateAgentCheckTask({
          ...mockSubmittedDeal,
          dealType: 'GEF',
        });
        expect(result).toEqual(false);
      });
    });

    describe('when a deal is not MIA', () => {
      it('should return false', () => {
        const result = shouldCreateAgentCheckTask({
          ...mockSubmittedDeal,
          submissionType: 'Not MIA',
        });
        expect(result).toEqual(false);
      });
    });

    describe('when a deal has true eligibility criteria 11', () => {
      it('should return false', () => {
        const result = shouldCreateAgentCheckTask(mockSubmittedDeal);
        expect(result).toEqual(false);
      });
    });
  });

  describe('listAdditionalTasks', () => {
    describe('when all additional tasks should be added', () => {
      it('should return array of all additional tasks', () => {
        const result = listAdditionalTasks(mockDealEligibilityCriteria11False);

        const expected = [
          CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
          CONSTANTS.TASKS.MIA_GROUP_1_TASKS.COMPLETE_AGENT_CHECK,
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when no additional tasks should be added', () => {
      it('should return empty array', () => {
        mockDealWithPartyUrn.tfm.parties.exporter = { partyUrn: '1234' };
        mockDealWithPartyUrn.dealType = CONSTANTS.DEALS.DEAL_TYPE.GEF;
        const result = listAdditionalTasks(mockDealWithPartyUrn);

        expect(result).toEqual([]);
      });
    });
  });

  describe('createDealTasks', () => {
    it('should return false when there is no deal', async () => {
      const result = await createDealTasks();

      expect(result).toEqual(false);
    });

    it('should call api.updateDeal and return updated deal', async () => {
      const result = await createDealTasks(mockSubmittedDeal, sessionUser);

      const expectedTasks = createTasks(
        mockSubmittedDeal.submissionType,
        listAdditionalTasks(mockSubmittedDeal),
      );

      const expectedDealTfm = {
        ...mockSubmittedDeal.tfm,
        tasks: expectedTasks,
      };

      expect(updateDealSpy).toHaveBeenCalledWith(
        mockSubmittedDeal._id,
        { tfm: expectedDealTfm },
        expect.objectContaining({
          _id: expect.any(String),
        }),
      );

      const expectedDealReturn = {
        ...mockSubmittedDeal,
        tfm: expectedDealTfm,
      };

      expect(result).toEqual(expectedDealReturn);
    });
  });
});
