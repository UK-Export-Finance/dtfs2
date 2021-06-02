const moment = require('moment');
const {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
  sendMiaAcknowledgement,
  generateFacilitiesListString,
} = require('../src/v1/controllers/send-deal-submit-emails');
const CONSTANTS = require('../src/constants');
const formattedTimestamp = require('../src/v1/formattedTimestamp');
const MOCK_TEAMS = require('../src/v1/__mocks__/mock-teams');
const api = require('../src/v1/api');

describe('send-deal-submit-emails', () => {
  let mockDeal;
  beforeEach(async () => {
    const mockDealMia = await api.findOneDeal('MOCK_MIA_NOT_SUBMITTED');
    const mockBonds = mockDealMia.dealSnapshot.bondTransactions.items.map((facility) => ({
      facilitySnapshot: facility,
    }));
    const mockLoans = mockDealMia.dealSnapshot.loanTransactions.items.map((facility) => ({
      facilitySnapshot: facility,
    }));

    mockDeal = {
      ...mockDealMia,
      dealSnapshot: {
        ...mockDealMia.dealSnapshot,
        bondTransactions: {
          items: mockBonds,
        },
        loanTransactions: {
          items: mockLoans,
        },
      },
      tfm: {
        tasks: [
          {
            groupTasks: [
              {
                title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
                team: {
                  id: 'BUSINESS_SUPPORT',
                },
              },
            ],
          },
        ],
        history: {
          tasks: [],
          emails: [],
        },
      },
    };
  });

  describe('shouldSendFirstTaskEmail', () => {
    it('should return true when task title is `match or create parties`', () => {
      const mockTask = {
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
      };

      const result = shouldSendFirstTaskEmail(mockTask);
      expect(result).toEqual(true);
    });

    it('should return false when task title is NOT `match or create parties`', () => {
      const mockTask = {
        title: 'Test',
      };

      const result = shouldSendFirstTaskEmail(mockTask);
      expect(result).toEqual(false);
    });
  });

  describe('sendFirstTaskEmail', () => {
    it('should return API response with correct emailVariables', async () => {
      const firstTask = mockDeal.tfm.tasks[0].groupTasks[0];

      const expectedEmailVariables = {
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        submissionType: mockDeal.dealSnapshot.details.submissionType,
        submissionDate: moment(formattedTimestamp(mockDeal.dealSnapshot.details.submissionDate)).format('Do MMMM YYYY'),
        bank: mockDeal.dealSnapshot.details.owningBank.name,
      };

      const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

      // api response is mocked/stubbed
      const expected = {
        content: {
          body: {},
        },
        id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_SUBMITTED_COMPLETE_TASK_MATCH_OR_CREATE_PARTIES,
        email: expectedTeamEmailAddress,
        ...expectedEmailVariables,
        template: {},
      };

      const result = await sendFirstTaskEmail(mockDeal);

      expect(result).toEqual(expected);
    });

    it('should return null when first task email should NOT be sent', async () => {
      const mockDealWithInvalidFirstTask = {
        ...mockDeal,
        tfm: {
          ...mockDeal.tfm,
          tasks: [
            {
              groupTasks: [
                {
                  title: 'Test',
                },
              ],
            },
          ],
        },
      };

      const result = await sendFirstTaskEmail(mockDealWithInvalidFirstTask);

      expect(result).toEqual(null);
    });
  });

  describe('send MIA acknowledgement', () => {
    it('should return API response with correct emailVariables', async () => {
      const bssList = generateFacilitiesListString(mockDeal.dealSnapshot.bondTransactions.items);
      const ewcsList = generateFacilitiesListString(mockDeal.dealSnapshot.loanTransactions.items);

      const expectedEmailVariables = {
        recipientName: mockDeal.dealSnapshot.details.maker.firstname,
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        bankReferenceNumber: mockDeal.dealSnapshot.details.bankSupplyContractID,
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
        bssList,
        showBssHeader: 'yes',
        ewcsList,
        showEwcsHeader: 'yes',
      };

      const { email: expectedTeamEmailAddress } = mockDeal.dealSnapshot.details.maker;

      // api response is mocked/stubbed
      const expected = {
        content: {
          body: {},
        },
        id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED,
        email: expectedTeamEmailAddress,
        ...expectedEmailVariables,
        template: {},
      };

      const result = await sendMiaAcknowledgement(mockDeal);

      expect(result).toEqual(expected);
    });

    it('should not show BSS header if no bonds', async () => {
      const mockDealNoBss = {
        ...mockDeal,
        dealSnapshot: {
          ...mockDeal.dealSnapshot,
          bondTransactions: {
            items: [],
          },
        },
      };

      const bssList = generateFacilitiesListString(mockDealNoBss.dealSnapshot.bondTransactions.items);
      const ewcsList = generateFacilitiesListString(mockDealNoBss.dealSnapshot.loanTransactions.items);


      const expectedEmailVariables = {
        recipientName: mockDeal.dealSnapshot.details.maker.firstname,
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        bankReferenceNumber: mockDeal.dealSnapshot.details.bankSupplyContractID,
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
        bssList,
        showBssHeader: 'no',
        ewcsList,
        showEwcsHeader: 'yes',
      };

      const { email: expectedTeamEmailAddress } = mockDeal.dealSnapshot.details.maker;

      // api response is mocked/stubbed
      const expected = {
        content: {
          body: {},
        },
        id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED,
        email: expectedTeamEmailAddress,
        ...expectedEmailVariables,
        template: {},
      };

      const result = await sendMiaAcknowledgement(mockDealNoBss);
      expect(result).toEqual(expected);
    });

    it('should not show EWCS header if no loans', async () => {
      const mockDealNoEwcs = {
        ...mockDeal,
        dealSnapshot: {
          ...mockDeal.dealSnapshot,
          loanTransactions: {
            items: [],
          },
        },
      };

      const bssList = generateFacilitiesListString(mockDealNoEwcs.dealSnapshot.bondTransactions.items);
      const ewcsList = generateFacilitiesListString(mockDealNoEwcs.dealSnapshot.loanTransactions.items);


      const expectedEmailVariables = {
        recipientName: mockDeal.dealSnapshot.details.maker.firstname,
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        bankReferenceNumber: mockDeal.dealSnapshot.details.bankSupplyContractID,
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
        bssList,
        showBssHeader: 'yes',
        ewcsList,
        showEwcsHeader: 'no',
      };

      const { email: expectedTeamEmailAddress } = mockDeal.dealSnapshot.details.maker;

      // api response is mocked/stubbed
      const expected = {
        content: {
          body: {},
        },
        id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED,
        email: expectedTeamEmailAddress,
        ...expectedEmailVariables,
        template: {},
      };

      const result = await sendMiaAcknowledgement(mockDealNoEwcs);
      expect(result).toEqual(expected);
    });

    it('should generate the correct Bond string depending on uniqueIdentificationNumber', async () => {
      const facilityBankRef = {
        facilitySnapshot: {
          facilityType: 'bond',
          uniqueIdentificationNumber: 'mockBankRef',
          ukefFacilityID: 'ukefId1',
        },
      };
      const facilityNoBankRef = {
        facilitySnapshot: {
          facilityType: 'bond',
          uniqueIdentificationNumber: '',
          ukefFacilityID: 'ukefId2',

        },
      };

      const expected = '- Bond facility with your reference mockBankRef has been given the UKEF reference: ukefId1 \n- Bond facility has been given the UKEF reference: ukefId2 \n';

      const result = generateFacilitiesListString([facilityBankRef, facilityNoBankRef]);
      expect(result).toEqual(expected);
    });

    it('should generate the correct Loan string depending on bankReferenceNumber', async () => {
      const facilityBankRef = {
        facilitySnapshot: {
          facilityType: 'loan',
          bankReferenceNumber: 'mockBankRef',
          ukefFacilityID: 'ukefId1',
        },
      };
      const facilityNoBankRef = {
        facilitySnapshot: {
          facilityType: 'loan',
          bankReferenceNumber: '',
          ukefFacilityID: 'ukefId2',

        },
      };

      const expected = '- Loan facility with your reference mockBankRef has been given the UKEF reference: ukefId1 \n- Loan facility has been given the UKEF reference: ukefId2 \n';

      const result = generateFacilitiesListString([facilityBankRef, facilityNoBankRef]);
      expect(result).toEqual(expected);
    });
  });

  describe('sendDealSubmitEmails', () => {
    it('should return false when there is no deal', async () => {
      const result = await sendDealSubmitEmails();
      expect(result).toEqual(false);
    });

    it('should return sendDealSubmitEmails response', async () => {
      const result = await sendDealSubmitEmails(mockDeal);

      const expected = {
        firstTaskEmail: await sendFirstTaskEmail(mockDeal),
        emailAcknowledgementMIA: await sendMiaAcknowledgement(mockDeal),
      };

      expect(result).toEqual(expected);
    });
  });
});
