const {
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
  const updateDealSpy = jest.fn((dealId, dealUpdate) => Promise.resolve(dealUpdate));

  const mockSubmittedDeal = mapSubmittedDeal({
    dealSnapshot: MOCK_DEAL_MIA,
    tfm: {
      parties: { exporter: {} },
    },
  });

  const mockDealEligibilityCriteria11False = {
    ...mockSubmittedDeal,
    eligibility: {
      criteria: [
        { id: 11, answer: false },
      ],
    },
  };

  const mockDealWithPartyUrn = {
    ...mockSubmittedDeal,
    tfm: {
      parties: { exporter: { partyUrn: 'test' } },
    },
  };

  beforeEach(() => {
    externalApis.updateDeal = updateDealSpy;
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
          CONSTANTS.TASKS.MIA_GROUP_1_TASKS.COMPLETE_AGENT_CHECK,
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when no additional tasks should be added', () => {
      it('should return empty array', () => {
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
      const result = await createDealTasks(mockSubmittedDeal);

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
      );

      const expectedDealReturn = {
        ...mockSubmittedDeal,
        tfm: expectedDealTfm,
      };

      expect(result).toEqual(expectedDealReturn);
    });
  });
});
