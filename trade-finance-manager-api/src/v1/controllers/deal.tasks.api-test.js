const {
  listExcludedTasks,
  listAdditionalTasks,
  createDealTasks,
} = require('./deal.tasks');
const externalApis = require('../../../src/v1/api');
const CONSTANTS = require('../../constants');
const MOCK_DEAL_MIA = require('../../../src/v1/__mocks__/mock-deal-MIA-submitted');
const { createTasks } = require('../helpers/create-tasks');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');

describe('createDealTasks', () => {
  const updateDealSpy = jest.fn((dealUpdate) => Promise.resolve(dealUpdate));
  const mockSubmittedDeal = mapSubmittedDeal({
    dealSnapshot: MOCK_DEAL_MIA,
    tfm: {
      parties: { exporter: {} },
    },
  });

  beforeEach(() => {
    externalApis.updateDeal = updateDealSpy;
  });

  describe('listExcludedTasks', () => {
    describe('when a deal has tfm.parties.exporter.partyUrn', () => {
      it('should return array with MATCH_OR_CREATE_PARTIES task title', () => {
        const mockDeal = {
          ...mockSubmittedDeal,
          tfm: {
            parties: {
              exporter: {
                partyUrn: 'mock',
              },
            },
          },
        };

        const result = listExcludedTasks(mockDeal);

        const expected = [
          CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when a deal does NOT have tfm.parties.exporter.partyUrn', () => {
      it('should return empty array', () => {
        const mockDeal = {
          ...mockSubmittedDeal,
          tfm: {
            parties: {
              exporter: {
                partyUrn: '',
              },
            },
          },
        };

        const result = listExcludedTasks(mockDeal);

        expect(result).toEqual([]);
      });
    });
  });

  describe('listAdditionalTasks', () => {
    describe('when a BSS deal has eligibility criteria 11 answer as false', () => {
      it('should return array with COMPLETE_AGENT_CHECK task title', () => {
        const mockDeal = {
          ...mockSubmittedDeal,
          eligibility: {
            criteria: [
              { id: 11, answer: false },
            ],
          },
        };

        const result = listAdditionalTasks(mockDeal);

        const expected = [
          CONSTANTS.TASKS.MIA_GROUP_1_TASKS.COMPLETE_AGENT_CHECK,
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when a deal does NOT have eligibility criteria 11 answer as false', () => {
      it('should return empty array', () => {
        const mockDeal = {
          ...mockSubmittedDeal,
          eligibility: {
            criteria: [
              { id: 11, answer: true },
            ],
          },
        };

        const result = listAdditionalTasks(mockDeal);

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
      await createDealTasks(mockSubmittedDeal);

      const expectedTasks = createTasks(
        mockSubmittedDeal.submissionType,
        listExcludedTasks(mockSubmittedDeal),
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
